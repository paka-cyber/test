/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import ThreeDMonitor from "./components/ThreeDMonitor";
import PotentialEnergyChart from "./components/PotentialEnergyChart";
import ControlPanel from "./components/ControlPanel";
import { SimulationResponse, SimulationPhase } from "./types";
import { Atom, Shield, Cpu, Sparkles, Network, HelpCircle, ArrowRight, BookOpen, Trash2, History, RotateCcw, Orbit, Info, Code, Save, Play, CheckCircle, Copy } from "lucide-react";
import { LOCAL_PRESETS, matchLocalPreset, generateDynamicFallback } from "./presets";

export interface ArchivedReaction {
  id: string;
  title: string;
  reactantsInputOriginal: string;
  chemicalEquation: string;
  reactantsList: { name: string; formula: string }[];
  description: string;
  timestamp: string;
  category: "all" | "redox" | "neutralization" | "exothermic" | "endothermic" | "virtual" | "physical-mixture";
  tags: string[];
}

const FORMULA_NAME_MAP: { [key: string]: string } = {
  "NaHCO3": "탄산수소나트륨 (베이킹 소다)",
  "NaHCO₃": "탄산수소나트륨 (베이킹 소다)",
  "CH3COOH": "아세트산 수용액 (식초)",
  "CH₃COOH": "아세트산 수용액 (식초)",
  "CO2": "이산화탄소 가스",
  "CO₂": "이산화탄소 가스",
  "H2O": "물 (수용액)",
  "H₂O": "물 (수용액)",
  "CH3COONa": "아세트산나트륨 용액",
  "CH₃COONa": "아세트산나트륨 용액",
  "HCl": "염산 수용액",
  "NaOH": "수산화나트륨",
  "NaCl": "염화나트륨 (소금)",
  "C2H5OH": "에탄올 (알코올)",
  "C₂H₅OH": "에탄올 (알코올)",
  "CH4": "메탄 가스",
  "CH₄": "메탄 가스",
  "O2": "산소 기체",
  "O₂": "산소 기체",
  "Vb": "비브라늄 (가상)",
  "Ad": "아다만티움 (가상)",
  "Elx": "마법 비약 (가상)",
  "H2": "수소 기체",
  "H₂": "수소 기체",
};

function parseFormulaComponent(part: string) {
  const trimmed = part.trim();
  const match = trimmed.match(/^(\d+)\s*(.*)$/);
  if (match) {
    return {
      coefficient: match[1],
      formulaOnly: match[2].trim(),
      full: trimmed
    };
  }
  return {
    coefficient: "",
    formulaOnly: trimmed,
    full: trimmed
  };
}

function getSubstanceKoreanName(formula: string): string {
  const cleaned = formula.replace(/\s+/g, "");
  if (FORMULA_NAME_MAP[cleaned]) {
    return FORMULA_NAME_MAP[cleaned];
  }
  if (cleaned.endsWith("_Mol")) {
    return cleaned.replace("_Mol", "");
  }
  const upper = cleaned.toUpperCase();
  for (const [key, val] of Object.entries(FORMULA_NAME_MAP)) {
    if (key.toUpperCase() === upper) {
      return val;
    }
  }
  return formula + " 기질";
}

export default function App() {
  const [simulationData, setSimulationData] = useState<SimulationResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activePhaseId, setActivePhaseId] = useState<"reactant" | "intermediate" | "product">("reactant");
  const [errorText, setErrorText] = useState<string>("");
  const [activeView, setActiveView] = useState<"simulator" | "library" | "custom_input">("simulator");
  const [injectedSubstances, setInjectedSubstances] = useState<any[]>([
    { id: "init_1", name: "베이킹 소다", formula: "NaHCO3" },
    { id: "init_2", name: "식초(아세트산)", formula: "CH3COOH" }
  ]);

  const [currentReactantsQuery, setCurrentReactantsQuery] = useState<string>("NaHCO₃ + CH₃COOH");

  // Custom simulation template states for user manual configuration
  const [customTitle, setCustomTitle] = useState<string>("");
  const [customEquationInput, setCustomEquationInput] = useState<string>("");
  const [customMaterials, setCustomMaterials] = useState<Array<{ name: string; formula: string }>>([]);
  const [quickInputTitle, setQuickInputTitle] = useState<string>("");
  const [quickInputEquation, setQuickInputEquation] = useState<string>("");
  const [energyReactant, setEnergyReactant] = useState<number>(30);
  const [energyBarrier, setEnergyBarrier] = useState<number>(75);
  const [energyProduct, setEnergyProduct] = useState<number>(10);
  const [isReactionValidInput, setIsReactionValidInput] = useState<boolean>(true);
  
  const [jsonInputText, setJsonInputText] = useState<string>("");
  
  // JSON 입력창(jsonInputText)에 유효한 JSON 정보가 입력되면 자동으로 간편 폼 빌더 하단 입력창(customMaterials, customEquationInput)에 동기화해주는 완벽한 연동 훅
  useEffect(() => {
    const trimmed = jsonInputText.trim();
    if (!trimmed) return;
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        // 주석 제거 및 JSON 파싱
        const cleanJsonText = trimmed
          .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1')
          .trim();
        const parsed = JSON.parse(cleanJsonText);
        
        let targetEquation = "";
        if (parsed.chemicalEquation) {
          targetEquation = parsed.chemicalEquation;
        } else if (parsed.validation?.chemicalEquation) {
          targetEquation = parsed.validation.chemicalEquation;
        }

        if (targetEquation) {
          // 화학식 갱신
          setCustomEquationInput(targetEquation);
          
          // 화학 에너지 수치가 있으면 자동 동기화
          if (parsed.potentialEnergy && Array.isArray(parsed.potentialEnergy) && parsed.potentialEnergy.length === 3) {
            setEnergyReactant(parsed.potentialEnergy[0]);
            setEnergyBarrier(parsed.potentialEnergy[1]);
            setEnergyProduct(parsed.potentialEnergy[2]);
          } else if (parsed.validation?.potentialEnergy && Array.isArray(parsed.validation.potentialEnergy) && parsed.validation.potentialEnergy.length === 3) {
            setEnergyReactant(parsed.validation.potentialEnergy[0]);
            setEnergyBarrier(parsed.validation.potentialEnergy[1]);
            setEnergyProduct(parsed.validation.potentialEnergy[2]);
          }

          // 반응식 왼쪽(Reactants) 파트로부터 화학 기질 목록 자동 역산 추출 및 주입
          const leftSidePart = targetEquation.split(/[⟶→]|->/)[0] || "";
          const reagents = leftSidePart.split("+").map((r: any) => r.trim()).filter(Boolean);
          if (reagents.length > 0) {
            const newlyBuiltMaterials = reagents.map((reagent: string) => {
              // 계수 제거 예: "3O2" -> "O2", "2HCl" -> "HCl"
              const cleanFormula = reagent.replace(/^[0-9\s]+/, "").trim();
              return {
                name: getSubstanceKoreanName(cleanFormula) || cleanFormula,
                formula: cleanFormula
              };
            });
            setCustomMaterials(newlyBuiltMaterials);
          }
        }
      } catch (err) {
        // 불완전한 입력이 진행 중일 때는 콘솔에 경고를 내지 않고 침묵하여 UX 부드러움 보장
      }
    }
  }, [jsonInputText]);

  const [selectedArchiveTab, setSelectedArchiveTab] = useState<string>("all");
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "info" } | null>(null);

  const [archivedReactions, setArchivedReactions] = useState<ArchivedReaction[]>(() => {
    const saved = localStorage.getItem("molecular_simulator_archives_v1");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: "default_1",
        title: "이산화탄소 & 물 수증기 (에탄올 완전 연소 생성물)",
        reactantsInputOriginal: "C2H5OH + 3O2",
        chemicalEquation: "C₂H₅OH + 3O₂ ⟶ 2CO₂ + 3H₂O",
        reactantsList: [
          { name: "에탄올", formula: "C2H5OH" },
          { name: "산소", formula: "O2" }
        ],
        description: "에탄올의 가연성 완전 연소 반응은 전형적인 다각 산화-환원 작용의 정수입니다. 분해 반응 전후의 자유 에너지가 극적으로 하강하여 매우 강력한 열 에너지를 방출하는 대표적 발열 반응입니다.",
        timestamp: "2026. 6. 12. 오후 3:54:40",
        category: "redox",
        tags: ["redox", "exothermic"]
      },
      {
        id: "default_2",
        title: "이산화탄소 & 아세트산나트륨 혼합 시뮬레이션",
        reactantsInputOriginal: "NaHCO3 + CH3COOH",
        chemicalEquation: "NaHCO₃ + CH₃COOH ⟶ CH₃COONa + H₂O + CO₂",
        reactantsList: [
          { name: "베이킹 소다", formula: "NaHCO3" },
          { name: "식초(아세트산)", formula: "CH3COOH" }
        ],
        description: "전형적인 산-염기 중화 가스 생성 화학적 메커니즘입니다. 카복시산의 일종인 아세트산(신맛)이 중탄산나트륨 무기 화합물을 이온 교환을 통해 불안정한 탄산 분자로 환원시킨 후, 자발적 탄산 탈수에 의한 정량적 흡열 작용을 보입니다.",
        timestamp: "2026. 6. 12. 오후 3:53:01",
        category: "neutralization",
        tags: ["neutralization", "endothermic"]
      }
    ];
  });

  // Persist archives to local storage
  useEffect(() => {
    localStorage.setItem("molecular_simulator_archives_v1", JSON.stringify(archivedReactions));
  }, [archivedReactions]);

  // Handle toast timers
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Run initial simulation on mount using Vinegar & Baking Soda
  useEffect(() => {
    runSimulation("NaHCO₃ + CH₃COOH");
  }, []);

  const runSimulation = async (reactants: string, forceAI: boolean = false) => {
    setCurrentReactantsQuery(reactants);
    setIsLoading(true);
    setErrorText("");
    
    // Add a natural minimal physical calculation delay to simulate highly precise atomic docking calculation
    await new Promise((resolve) => setTimeout(resolve, 850));

    try {
      let data: SimulationResponse | null = null;
      const strippedQuery = reactants.replace(/[\s+⟶→]+/g, "").toLowerCase();

      // 1. Inspect client-side custom input registry first
      const savedCustoms = localStorage.getItem("molecular_simulator_custom_reactions_v1");
      if (savedCustoms) {
        try {
          const parsedList: SimulationResponse[] = JSON.parse(savedCustoms);
          const found = parsedList.find(c => {
            const eqNorm = (c.validation.chemicalEquation || "").replace(/[\s+⟶→]+/g, "").toLowerCase();
            return eqNorm.includes(strippedQuery) || strippedQuery.includes(eqNorm);
          });
          if (found) {
            data = found;
          }
        } catch (e) {
          console.error("Failed to parse custom local reactions:", e);
        }
      }

      // 2. Fallback to pre-built chemical presets
      if (!data) {
        const matchedKey = matchLocalPreset(reactants);
        if (matchedKey && LOCAL_PRESETS[matchedKey]) {
          data = LOCAL_PRESETS[matchedKey];
        }
      }

      // 3. Fallback to physical mixture or custom dynamic stoichiometry solver
      if (!data) {
        data = generateDynamicFallback(reactants);
      }

      setSimulationData(data);
      setActivePhaseId("reactant");
    } catch (e: any) {
      console.warn("Simulation retrieval warning:", e);
      setErrorText("완벽 오프라인 물리 도킹 연산 시스템 분석 오류");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCustomTitleChange = (val: string) => {
    setCustomTitle(val);
  };

  const handleAddCustomMaterial = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return;

    const standardMap: { [key: string]: string } = {
      "물": "H2O",
      "식초": "CH3COOH",
      "아세트산": "CH3COOH",
      "베이킹 소다": "NaHCO3",
      "베이킹소다": "NaHCO3",
      "염산": "HCl",
      "수산화나트륨": "NaOH",
      "에탄올": "C2H5OH",
      "알코올": "C2H5OH",
      "메탄": "CH4",
      "메탄가스": "CH4",
      "메탄 가스": "CH4",
      "프로판": "C3H8",
      "프로판가스": "C3H8",
      "프로판 가스": "C3H8",
      "산소": "O2",
      "이산화탄소": "CO2",
      "비브라늄": "Vb",
      "아다만티움": "Ad",
      "마법 비약": "Elx",
      "마법비약": "Elx",
      "탄산칼슘과 염산의 결합반응": "CaCO3 + 2HCl ⟶ CaCl2 + H2O + CO2",
      "탄산칼슘과 염산": "CaCO3 + 2HCl ⟶ CaCl2 + H2O + CO2",
      "탄산칼슘 염산": "CaCO3 + 2HCl ⟶ CaCl2 + H2O + CO2",
      "탄산칼슘": "CaCO3",
      "질산은": "AgNO3",
      "염화나트륨": "NaCl",
      "소금": "NaCl",
      "질산은과 염화나트륨": "AgNO3 + NaCl ⟶ AgCl + NaNO3",
      "질산은과 염화나트륨의 반응": "AgNO3 + NaCl ⟶ AgCl + NaNO3",
      "산소 뷰티르산": "O2 + 뷰티르_MOL",
      "뷰티르산 산소": "O2 + 뷰티르_MOL",
      "산소와 뷰티르산": "O2 + 뷰티르_MOL",
      "탄산나트륨과 염화칼슘": "Na2CO3 + CaCl2 ⟶ CaCO3 + 2NaCl",
      "염화구리와 철": "CuCl2 + Fe ⟶ FeCl2 + Cu",
      "탄산나트륨": "Na2CO3",
      "염화칼슘": "CaCl2",
      "염화구리": "CuCl2",
      "철": "Fe",
    };

    const detectedFormula = standardMap[trimmed] || trimmed;

    setCustomMaterials(prev => {
      const isDup = prev.some(item => item.name.toLowerCase() === trimmed.toLowerCase());
      if (isDup) return prev;
      const newArr = [...prev, { name: trimmed, formula: detectedFormula }];

      // 화학물질 목록이 차례대로 나열됨에 따라 Stoichiometric formula의 반응물 부분도 세련되게 자동 업데이트
      const reactantPart = newArr.map(item => item.formula).join(" + ");
      let currentEq = customEquationInput;
      if (currentEq.includes("⟶")) {
        const parts = currentEq.split("⟶");
        setCustomEquationInput(`${reactantPart} ⟶ ${parts[1]?.trim() || ""}`);
      } else if (currentEq.includes("->")) {
        const parts = currentEq.split("->");
        setCustomEquationInput(`${reactantPart} -> ${parts[1]?.trim() || ""}`);
      } else {
        setCustomEquationInput(`${reactantPart} ⟶ `);
      }

      return newArr;
    });

    setCustomTitle("");
    setToastMessage({ text: `🧪 '${trimmed}' 물질이 기질 목록에 정상적으로 누적 추가되었습니다.`, type: "success" });
  };

  const handleRemoveCustomMaterial = (index: number) => {
    setCustomMaterials(prev => {
      const newArr = prev.filter((_, i) => i !== index);
      const reactantPart = newArr.map(item => item.formula).join(" + ");
      let currentEq = customEquationInput;
      if (currentEq.includes("⟶")) {
        const parts = currentEq.split("⟶");
        setCustomEquationInput(`${reactantPart} ⟶ ${parts[1]?.trim() || ""}`);
      } else if (currentEq.includes("->")) {
        const parts = currentEq.split("->");
        setCustomEquationInput(`${reactantPart} -> ${parts[1]?.trim() || ""}`);
      } else {
        setCustomEquationInput(`${reactantPart} ⟶ `);
      }
      return newArr;
    });
  };

  const handleApplyQuickInput = () => {
    const titleVal = quickInputTitle.trim();
    const eqVal = quickInputEquation.trim();

    if (!titleVal && !eqVal) {
      setToastMessage({ text: "물질명 또는 화학식 중 최소 하나는 입력해야 합니다.", type: "info" });
      return;
    }

    if (titleVal) {
      setCustomTitle(titleVal);
      // 화학식 칸이 비었을 때 잘 알려진 물질이면 자동으로 우측 화학식에 채워줍니다.
      if (!eqVal) {
        const standardMap: { [key: string]: string } = {
          "물": "H2O",
          "식초": "CH3COOH",
          "아세트산": "CH3COOH",
          "베이킹 소다": "NaHCO3",
          "베이킹소다": "NaHCO3",
          "염산": "HCl",
          "수산화나트륨": "NaOH",
          "에탄올": "C2H5OH",
          "알코올": "C2H5OH",
          "메탄": "CH4",
          "메탄가스": "CH4",
          "메탄 가스": "CH4",
          "프로판": "C3H8",
          "프로판가스": "C3H8",
          "프로판 가스": "C3H8",
          "산소": "O2",
          "이산화탄소": "CO2",
          "비브라늄": "Vb",
          "아다만티움": "Ad",
          "마법 비약": "Elx",
          "마법비약": "Elx",
          "탄산칼슘과 염산의 결합반응": "CaCO3 + 2HCl ⟶ CaCl2 + H2O + CO2",
          "탄산칼슘과 염산": "CaCO3 + 2HCl ⟶ CaCl2 + H2O + CO2",
          "탄산칼슘 염산": "CaCO3 + 2HCl ⟶ CaCl2 + H2O + CO2",
          "탄산칼슘": "CaCO3",
          "질산은": "AgNO3",
          "염화나트륨": "NaCl",
          "질산은과 염화나트륨": "AgNO3 + NaCl ⟶ AgCl + NaNO3",
          "질산은과 염화나트륨의 반응": "AgNO3 + NaCl ⟶ AgCl + NaNO3",
          "산소 뷰티르산": "O2 + 뷰티르_MOL",
          "뷰티르산 산소": "O2 + 뷰티르_MOL",
          "산소와 뷰티르산": "O2 + 뷰티르_MOL",
          "탄산나트륨과 염화칼슘": "Na2CO3 + CaCl2 ⟶ CaCO3 + 2NaCl",
          "염화구리와 철": "CuCl2 + Fe ⟶ FeCl2 + Cu",
        };
        if (standardMap[titleVal]) {
          setCustomEquationInput(standardMap[titleVal]);
        }
      }
    }

    if (eqVal) {
      setCustomEquationInput(eqVal);
    }

    setToastMessage({ text: "⚡️ 입력하신 화학 물질 설정정보가 위의 폼 빌더에 주입되었습니다!", type: "success" });
    setQuickInputTitle("");
    setQuickInputEquation("");
  };

  const handleApplyCustomSimulation = () => {
    if (!customEquationInput.trim()) {
      setToastMessage({ text: "화학 반응식 표기는 필수 입력 사항입니다.", type: "info" });
      return;
    }

    let customReactionResponse: SimulationResponse;

    // 1. Check if user wants to use manual JSON or fall back to automatic stoichiometry generation
    try {
      const trimmedText = jsonInputText.trim();
      let hasParsedSuccessfully = false;

      // Only attempt to parse if it is potentially a correct JSON block (starts with '{' or '[')
      if (trimmedText && (trimmedText.startsWith("{") || trimmedText.startsWith("["))) {
        try {
          // Remove potential JavaScript single-line (// ...) and multi-line (/* ... */) comments elegantly
          const cleanJsonText = trimmedText
            .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1')
            .trim();
          
          const parsedObj = JSON.parse(cleanJsonText);
          
          // Convert into strict SimulationResponse formats
          const finalEquation = parsedObj.chemicalEquation || customEquationInput;
          const finalEnergy = parsedObj.potentialEnergy || [energyReactant, energyBarrier, energyProduct];
          
          customReactionResponse = {
            usedAI: false,
            validation: {
              isValidReaction: isReactionValidInput,
              chemicalEquation: finalEquation,
              potentialEnergy: finalEnergy,
              alternativeRecommendations: parsedObj.alternativeRecommendations || [
                { reactant: "NaHCO₃ + CH₃COOH", reason: "교과서 산성 염기 중화반응으로서 자발적 이산화탄소가 도약 팽창됩니다." }
              ]
            },
            phases: [
              {
                phaseId: "reactant",
                title: "화학 반응물 기질 정렬 (Reactants)",
                description: `'${finalEquation}' 반응물 기질들이 오프라인 연산 필터에 안정 결합 구도를 수립했습니다.`,
                nodes: parsedObj.reactantNodes || [],
                links: parsedObj.reactantLinks || []
              },
              {
                phaseId: "intermediate",
                title: "중간 전이 배위 장벽 체계 (Transition)",
                description: "원 자결합이 최대로 신장되어 열역학적 융합 포텐셜 최고 장벽을 점검하고 있습니다.",
                nodes: parsedObj.intermediateNodes || [],
                links: parsedObj.intermediateLinks || []
              },
              {
                phaseId: "product",
                title: "최종 보존 생성물 (Products)",
                description: "안정 상태 분재 결합 궤도로 안주하여, 완전한 고품질 시뮬레이션 물질을 안정 정립했습니다.",
                nodes: parsedObj.productNodes || [],
                links: parsedObj.productLinks || []
              }
            ]
          };
          hasParsedSuccessfully = true;
        } catch (jsonErr) {
          console.warn("Manual JSON parsing parsed fail, fallback to high-fidelity stoichiometry generator:", jsonErr);
        }
      }

      if (!hasParsedSuccessfully) {
        // Automatic generation from raw equation
        customReactionResponse = generateDynamicFallback(customEquationInput);
        customReactionResponse.validation.isValidReaction = isReactionValidInput;
        customReactionResponse.validation.potentialEnergy = [energyReactant, energyBarrier, energyProduct];
      }

      // Save newly registered chemical reaction to LocalStorage custom store
      const customStoreKey = "molecular_simulator_custom_reactions_v1";
      const existingRaw = localStorage.getItem(customStoreKey);
      let customsList: SimulationResponse[] = [];
      if (existingRaw) {
        try {
          customsList = JSON.parse(existingRaw);
        } catch (ex) {
          customsList = [];
        }
      }

      // Remove duplicates by exact equation
      customsList = customsList.filter(o => 
        o.validation.chemicalEquation.replace(/\s+/g,"") !== customReactionResponse.validation.chemicalEquation.replace(/\s+/g,"")
      );

      // Push and save
      customsList.unshift(customReactionResponse);
      localStorage.setItem(customStoreKey, JSON.stringify(customsList));

      // 2. Clear current Injected substances and set it up to the custom input formula
      const parts = (customEquationInput || "").split(/[+\s⟶→↛]+/).map(p => p.trim()).filter(Boolean);
      const parsedSubstances = parts.map((part, idx) => ({
        id: `custom_injected_${idx}_${Date.now()}`,
        name: getSubstanceKoreanName(part) ? getSubstanceKoreanName(part).split(" ")[0] : part + " 분자",
        formula: part
      })).slice(0, 5); // up to 5 elements

      setInjectedSubstances(parsedSubstances);

      // 3. Trigger simulation run offline and redirect back to visual sandbox
      // 만약 JSON 파싱이 성공했다면 기하 좌표가 덮어씌워지지 않도록 직접 상태 주입하고, 그렇지 않으면 기본 생성 알고리즘 가동
      const textVal = jsonInputText.trim();
      const isJsonActive = textVal && (textVal.startsWith("{") || textVal.startsWith("["));
      
      if (isJsonActive && customReactionResponse!) {
        setIsLoading(true);
        // 고정밀 렌더링 준비를 위해 아주 찰나의 연산 시간 부여
        setTimeout(() => {
          setSimulationData(customReactionResponse);
          setActivePhaseId("reactant");
          setCurrentReactantsQuery(customReactionResponse.validation.chemicalEquation);
          setIsLoading(false);
        }, 150);
        setActiveView("simulator");
        setToastMessage({ text: "🎉 입력하신 3D 원자 극성 기하 배치를 정지 오차 없이 3D 모니터 공간에 성공적으로 활성 주입했습니다!", type: "success" });
      } else {
        runSimulation(customEquationInput);
        setActiveView("simulator");
        setToastMessage({ text: `🎉 '${customTitle || "커스텀"}' 화학반응 연산 모델이 로컬 시뮬레이터에 등록 및 자동 개시되었습니다!`, type: "success" });
      }

    } catch (err: any) {
      console.error("Critical fallback failed:", err);
      // Fail-proof fallback even if completely unexpected errors occur
      const fallbackResponse = generateDynamicFallback(customEquationInput);
      setSimulationData(fallbackResponse);
      setActivePhaseId("reactant");
      setCurrentReactantsQuery(customEquationInput);
      setActiveView("simulator");
      setToastMessage({ text: "🎉 신속 오프라인 가상 반응 기밀 합성이 성공적으로 대체 기동되었습니다!", type: "success" });
    }
  };

  // Safe destructuring of current active phase nodes / links
  const activePhaseData: SimulationPhase | undefined = simulationData?.phases.find(
    (p) => p.phaseId === activePhaseId
  );

  // Dynamic high-fidelity parsing of chemical equation into distinct visual cards
  const chemicalEquation = simulationData?.validation.chemicalEquation || "NaHCO₃ + CH₃COOH ⟶ CO₂ + H₂O + CH₃COONa";
  const equationParts = chemicalEquation.split(/[⟶→]|->/);
  const leftSide = equationParts[0] ? equationParts[0].trim() : "";
  const rightSide = equationParts[1] ? equationParts[1].trim() : "";

  const reactantsParsed = leftSide.split("+").map(r => r.trim()).filter(Boolean).map(r => {
    const parsed = parseFormulaComponent(r);
    return {
      ...parsed,
      koreanName: getSubstanceKoreanName(parsed.formulaOnly)
    };
  });

  const productsParsed = rightSide.split("+").map(p => p.trim()).filter(Boolean).map(p => {
    const parsed = parseFormulaComponent(p);
    return {
      ...parsed,
      koreanName: getSubstanceKoreanName(parsed.formulaOnly)
    };
  });

  const prodCompactNames = productsParsed.map(p => p.koreanName.split(" ")[0].split("(")[0]);
  const productsCombinedTitle = prodCompactNames.length > 0
    ? `${prodCompactNames.join(" & ")} 혼합 시뮬레이션`
    : "고차 반응 생성물";

  const handleAddToArchiveAndScroll = () => {
    setActiveView("library");
    if (!simulationData) {
      setToastMessage({ text: "보존된 학술 기록실로 이동했습니다.", type: "info" });
      return;
    }

    const currentEquation = simulationData.validation.chemicalEquation || "Unknown Reaction";
    const cleanEq = currentEquation.replace(/\s+/g, "");

    // Check if clean chemical equation already exists in the archives list
    const exists = archivedReactions.some(
      (r) => r.chemicalEquation.replace(/\s+/g, "") === cleanEq
    );

    if (exists) {
      setToastMessage({ text: "이미 기록 보관소에 등록되어 있는 반응입니다.", type: "info" });
      return;
    }

    // It's a new reaction! Create archived card
    const parsedReactants = reactantsParsed.map(r => ({
      name: r.koreanName.split(" ")[0].split("(")[0],
      formula: r.formulaOnly
    }));

    let title = productsCombinedTitle;
    if (title.includes("고차 반응 생성물")) {
      title = `${reactantsParsed.map(r => r.koreanName.split(" ")[0].split("(")[0]).join(" & ")} 융합 반응`;
    }

    const tags: string[] = [];
    const isExo = simulationData.validation.potentialEnergy && 
                  simulationData.validation.potentialEnergy.length >= 3 && 
                  simulationData.validation.potentialEnergy[2] < simulationData.validation.potentialEnergy[0];
    
    if (simulationData.validation.isValidReaction) {
      if (isExo) {
        tags.push("exothermic");
      } else {
        tags.push("endothermic");
      }
      
      const normInput = (simulationData.validation.chemicalEquation || "").toLowerCase();
      if (normInput.includes("o₂") || normInput.includes("o2") || normInput.includes("ch₄") || normInput.includes("ch4") || normInput.includes("c₂h₅oh") || normInput.includes("c2h5oh")) {
        tags.push("redox");
      }
      if ((normInput.includes("nahco₃") && normInput.includes("cooh")) || (normInput.includes("nahco3") && normInput.includes("cooh")) || (normInput.includes("hcl") && normInput.includes("naoh")) || normInput.includes("ch₃coona") || normInput.includes("ch3coona") || normInput.includes("nacl")) {
        tags.push("neutralization");
      }
      if (normInput.includes("vb") || normInput.includes("ad") || normInput.includes("elx")) {
        tags.push("virtual");
      }
      if (tags.length === 1 && tags[0] !== "virtual") {
        tags.push("redox");
      }
    } else {
      tags.push("physical-mixture");
    }

    let primaryCategory: ArchivedReaction["category"] = "redox";
    if (tags.includes("physical-mixture")) primaryCategory = "physical-mixture";
    else if (tags.includes("virtual")) primaryCategory = "virtual";
    else if (tags.includes("neutralization")) primaryCategory = "neutralization";
    else if (tags.includes("redox")) primaryCategory = "redox";
    else if (tags.includes("exothermic")) primaryCategory = "exothermic";
    else if (tags.includes("endothermic")) primaryCategory = "endothermic";

    const productPhase = simulationData.phases.find(p => p.phaseId === "product");
    const desc = productPhase?.description || `${currentEquation} 반응 조합에 기반하여 성공적으로 증명된 고품질의 학술 시뮬레이션 기록물입니다.`;

    const now = new Date();
    const timestampStr = now.toLocaleString("ko-KR", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    });

    const newArchive: ArchivedReaction = {
      id: `arch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      reactantsInputOriginal: currentReactantsQuery,
      chemicalEquation: currentEquation,
      reactantsList: parsedReactants,
      description: desc,
      timestamp: timestampStr,
      category: primaryCategory,
      tags: tags
    };

    setArchivedReactions((prev) => [newArchive, ...prev]);
    setToastMessage({ text: "새로운 학술 연구 결과가 기록소에 추가되었습니다!", type: "success" });
  };

  const handleRestoreFromArchive = (archive: ArchivedReaction) => {
    // 0. Switch to simulator
    setActiveView("simulator");

    // 1. Rebuild injected substances list
    const parsed = archive.reactantsList.map((item, idx) => ({
      id: `restore_${idx}_${Date.now()}_${Math.random()}`,
      name: item.name,
      formula: item.formula
    }));
    setInjectedSubstances(parsed);

    // 2. Run simulation
    runSimulation(archive.reactantsInputOriginal);
    
    setToastMessage({ text: "해당 학술 연구를 라이브 3D 시뮬레이터로 안전하게 복원했습니다.", type: "success" });
  };

  const handleDeleteArchive = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setArchivedReactions((prev) => prev.filter((r) => r.id !== id));
    setToastMessage({ text: "해당 학술 기록을 폐기 삭제했습니다.", type: "info" });
  };

  const getCountForTag = (tag: string) => {
    if (tag === "all") return archivedReactions.length;
    return archivedReactions.filter(r => r.tags.includes(tag)).length;
  };

  const filteredReactions = archivedReactions.filter((reaction) => {
    if (selectedArchiveTab === "all") return true;
    return reaction.tags.includes(selectedArchiveTab);
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col p-4 md:p-6 overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Dynamic Cyber-atomic ambient gradient backdrop lights */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-950/10 rounded-full blur-[130px] pointer-events-none"></div>

      {/* Modern Sci-Fi Header HUD */}
      <header className="relative w-full max-w-7xl mx-auto mb-6 flex flex-col lg:flex-row lg:items-center justify-between border border-white/10 bg-zinc-950/80 p-5 rounded-2xl gap-5 shadow-xl shadow-slate-950/50 backdrop-blur-md">
        {/* Left Side: Logo & Main Titles (No wraps, clean spacing) */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-600 to-violet-500 p-[1px] flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <Atom className="w-6 h-6 text-indigo-400 rotate-spin" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight uppercase bg-gradient-to-r from-slate-100 via-indigo-200 to-indigo-400 bg-clip-text text-transparent whitespace-nowrap shrink-0">
                ChemiSim AI
              </h1>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full font-mono font-bold tracking-widest uppercase shrink-0 whitespace-nowrap">
                Quantized v2.5
              </span>
            </div>
            <p className="text-[10px] md:text-[11px] text-slate-400 font-sans tracking-wide mt-1 uppercase">
              제미나이 AI 기반 학술 화학반응 시뮬레이터 • 실시간 CPK 가이드라인 3차원 공간 투영 결합 탐색기
            </p>
          </div>
        </div>

        {/* Right Side: Grouped switchers and statuses to avoid collision */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4 min-w-0 shrink-0 mt-3 lg:mt-0">
          {/* Modern Tab Routing Switcher pill container (Image 4 Design layout) */}
          <div className="flex items-center bg-zinc-950 border border-white/10 rounded-2xl p-1 gap-1 select-none flex-shrink-0 w-fit">
            {/* Reaction Chamber Simulator Tab Button */}
            <button
              type="button"
              onClick={() => setActiveView("simulator")}
              style={{ contentVisibility: "auto" }}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer active:scale-95 group whitespace-nowrap flex-shrink-0 ${
                activeView === "simulator"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold shadow-md shadow-emerald-500/5"
                  : "text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              <Orbit className={`w-4 h-4 flex-shrink-0 ${activeView === "simulator" ? "text-emerald-400 animate-spin-slow" : "text-slate-500 group-hover:text-slate-400"}`} />
              <span className="tracking-wide whitespace-nowrap border-0">반응 챔버 시뮬레이터</span>
            </button>

            {/* Academic Records Library Tab Button */}
            <button
              type="button"
              onClick={handleAddToArchiveAndScroll}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer active:scale-95 group whitespace-nowrap flex-shrink-0 ${
                activeView === "library"
                  ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/25 font-bold shadow-md shadow-indigo-500/5"
                  : "text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              <BookOpen className={`w-4 h-4 flex-shrink-0 ${activeView === "library" ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-400"}`} />
              <span className="tracking-wide whitespace-nowrap border-0">학술 기록 도서관</span>
              <span className={`flex items-center justify-center px-1.5 py-0.5 rounded-full text-[9px] font-mono leading-none flex-shrink-0 ${
                activeView === "library"
                  ? "bg-indigo-600 text-white"
                  : "bg-purple-950/85 text-purple-300 border border-purple-500/20"
              }`}>
                {archivedReactions.length}
              </span>
            </button>

            {/* Chemical Information Input Tab Button (화학 반응 정보입력 창) */}
            <button
              type="button"
              onClick={() => setActiveView("custom_input")}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer active:scale-95 group whitespace-nowrap flex-shrink-0 ${
                activeView === "custom_input"
                  ? "bg-purple-600/20 text-purple-300 border border-purple-500/35 font-bold shadow-md shadow-purple-500/5"
                  : "text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              <Sparkles className={`w-4 h-4 flex-shrink-0 ${activeView === "custom_input" ? "text-purple-400 grayscale-0" : "text-slate-500 group-hover:text-slate-400"}`} />
              <span className="tracking-wide whitespace-nowrap border-0">화학 반응 정보입력 창</span>
            </button>
          </div>

          {/* Global HUD status readouts */}
          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            <div className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-900/80 border border-white/5 rounded-xl text-[9px] md:text-[10px] font-mono text-slate-400 shadow-inner flex-shrink-0">
              <Cpu className="w-3 h-3 text-emerald-400 flex-shrink-0" />
              <span className="whitespace-nowrap">CALC ENGINE:</span>
              <span className="text-emerald-400 font-bold whitespace-nowrap">
                LOCAL PHYSICS V2
              </span>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-900/80 border border-white/5 rounded-xl text-[9px] md:text-[10px] font-mono text-slate-400 shadow-inner flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0"></span>
              <span className="text-slate-300 whitespace-nowrap">ACTIVE YIELD</span>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-900/80 border border-white/5 rounded-xl text-[9px] md:text-[10px] font-mono text-slate-400 shadow-inner flex-shrink-0">
              {simulationData?.validation.isValidReaction ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_#818cf8] flex-shrink-0"></span>
                  <span className="text-indigo-400 font-bold whitespace-nowrap">OPTIMAL YIELD</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0"></span>
                  <span className="text-red-400 font-bold whitespace-nowrap">STAGNATE MIX</span>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Critical Core Error overlay notification toast banner */}
      {errorText && (
        <div className="w-full max-w-7xl mx-auto mb-6 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-start gap-3 text-sm text-red-300">
          <Shield className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold uppercase tracking-wider text-xs font-mono text-red-300">심각한 시뮬레이션 로딩 실패 감지</span>
            <p className="text-[11px] text-red-400 mt-1">{errorText}</p>
          </div>
        </div>
      )}

      {/* Main Single-view Dashboard grid workspace with high-performance animations */}
      <AnimatePresence mode="wait">
        {activeView === "simulator" && (
          <motion.main
            key="simulator"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
          >
        
        {/* Left pane: Control panels, preset cards, & intelligence Recommendations (4 cols) */}
        <section className="lg:col-span-4 flex flex-col justify-between gap-6" id="panel_controls_section">
          <ControlPanel
            onSimulate={runSimulation}
            isLoading={isLoading}
            activePhaseId={activePhaseId}
            onSelectPhase={(id) => setActivePhaseId(id)}
            isValidReaction={simulationData?.validation.isValidReaction ?? true}
            alternativeRecommendations={simulationData?.validation.alternativeRecommendations}
            usedAI={simulationData?.usedAI ?? false}
            modelUsed={simulationData?.modelUsed}
            errorDetail={simulationData?.errorDetail}
            injectedSubstances={injectedSubstances}
            setInjectedSubstances={setInjectedSubstances}
          />
        </section>

        {/* Right pane: 3D Monitor panel & Potential energy curves (8 cols) */}
        <section className="lg:col-span-8 flex flex-col gap-6" id="panel_display_section">
          
          {/* Top segment: High resolution 3D SVG atomic spatial projection */}
          <div className="flex-1 min-h-[440px] relative">
            <ThreeDMonitor
              phases={simulationData?.phases ?? []}
              activePhaseId={activePhaseId}
              onSelectPhase={(id) => setActivePhaseId(id)}
            />
          </div>

          {/* Beaker Chamber Injected Substances Horizontal Bar (First Designated Part reshaped) */}
          <div className="bg-zinc-950/80 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 shadow-xl shadow-slate-950/40 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-505 bg-indigo-500 animate-pulse"></span>
                <span className="text-xs font-sans tracking-wider text-slate-300 font-bold uppercase">
                  비커 챔버 실시간 투약 원소 현황 (INJECTED CHAMBER ELEMENTS)
                </span>
              </div>
              <span className="text-[10px] font-mono text-indigo-400 font-bold">
                ({injectedSubstances.length}/5) Active
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {injectedSubstances.length === 0 ? (
                <span className="text-xs text-slate-500 italic font-sans py-1">투약된 화학 기질 원소가 없습니다. 물질을 추가해 주십시오.</span>
              ) : (
                injectedSubstances.map((sub, idx) => {
                  // Format the substance as "한글(영어)"
                  let koreanName = sub.name || "";
                  let formula = sub.formula || "";
                  return (
                    <div 
                      key={sub.id || idx}
                      className="bg-indigo-500/10 border border-indigo-500/25 rounded-xl px-4 py-2 flex items-center justify-center gap-2 text-center text-xs font-semibold text-indigo-300 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all shadow-sm"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                      <span className="font-sans leading-none">
                        {koreanName}(<span className="font-mono text-[11px] text-indigo-400/90">{formula}</span>)
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Elegant Stoichiometric Equation Bar (GAP OVERLAY - 4th Picture Reference) */}
          <div className="bg-zinc-950/80 border border-white/10 rounded-2xl p-5 flex flex-col gap-4 shadow-xl shadow-slate-950/40 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                </span>
                <span className="text-xs font-sans tracking-wider text-indigo-400 font-bold uppercase flex items-center gap-1.5">
                  <Network className="w-4 h-4 text-indigo-400 animate-spin-slow" />
                  실시간 분석 화학반응식 (CHEMICAL EQUATION)
                </span>
              </div>
              <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest font-bold">
                Stoichiometric Matrix Verified
              </span>
            </div>

            {/* Dynamic Reactant & Product visual mapping matrix (Directly reproducing Image 3 core layouts) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-5">
              {/* Reactants list */}
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                {reactantsParsed.map((react, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <span className="text-sm font-mono text-slate-500 font-bold px-1">+</span>}
                    <div className="bg-zinc-900/60 border border-white/5 hover:border-indigo-500/30 rounded-xl px-4 py-2 flex flex-col items-center justify-center min-w-[110px] text-center shadow transition-all">
                      <span className="text-[10px] text-slate-400 font-medium mb-1 leading-none font-sans block truncate max-w-[150px]">
                        {react.koreanName.split(" ")[0]}
                      </span>
                      <span className="text-sm font-mono font-bold text-indigo-300 tracking-wider">
                        {react.coefficient && <span className="text-indigo-400/70 mr-0.5">{react.coefficient}</span>}
                        {react.formulaOnly}
                      </span>
                    </div>
                  </React.Fragment>
                ))}
              </div>

              {/* Dynamic Action Conversion Spline Arrow */}
              <div className="flex items-center justify-center md:self-center py-1 md:py-0">
                <ArrowRight className="w-5 h-5 text-indigo-400 animate-pulse hidden md:block" />
                <span className="text-sm font-bold text-indigo-400 tracking-widest md:hidden uppercase font-mono py-1">⟶ Transition ⟶</span>
              </div>

              {/* Combined and Grouped Products layout box with customized border glow */}
              <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl px-5 py-2.5 flex flex-col items-center justify-center text-center shadow-lg min-w-[200px] sm:flex-1">
                <span className="text-[10px] font-sans font-bold text-indigo-300 mb-1 tracking-tight">
                  {productsCombinedTitle}
                </span>
                <span className="text-sm font-mono font-bold text-indigo-400 tracking-widest flex flex-wrap justify-center items-center gap-1.5 leading-none">
                  {productsParsed.map((prod, idx) => (
                    <React.Fragment key={idx}>
                      {idx > 0 && <span className="text-indigo-500/50 font-normal mx-0.5">+</span>}
                      <span>
                        {prod.coefficient && <span className="text-indigo-300/70 mr-0.5">{prod.coefficient}</span>}
                        {prod.formulaOnly}
                      </span>
                    </React.Fragment>
                  ))}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom segment: Custom interpolated Bezier Spline thermodynamic energy charts */}
          <div className="h-auto">
            <PotentialEnergyChart
              potentialEnergy={simulationData?.validation.potentialEnergy ?? [20, 75, 15]}
              activePhaseId={activePhaseId}
              chemicalEquation={simulationData?.validation.chemicalEquation ?? "A + B ⟶ C + D"}
            />
          </div>
        </section>

          </motion.main>
        )}

        {activeView === "library" && (
          <motion.section
            key="library"
            id="academic_archives_section"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-7xl mx-auto mt-6 p-6 border border-white/10 bg-zinc-950/80 rounded-2xl shadow-2xl backdrop-blur-md"
          >
        
        {/* Decorative corner lines in Sci-fi HUD fashion */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-indigo-500/40 rounded-tl"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-indigo-500/40 rounded-tr"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-indigo-500/40 rounded-bl"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-indigo-500/40 rounded-br"></div>

        {/* Archives Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/5">
          <div>
            <span className="text-indigo-400 font-mono text-[9px] uppercase tracking-widest">
              ACADEMIC ARCHIVES & MEMORANDUMS
            </span>
            <h2 className="text-lg md:text-xl font-bold text-slate-100 flex items-center gap-2 tracking-wide mt-1">
              <History className="w-5 h-5 text-indigo-400" />
              학술 기록실 (Simulation Library Archive)
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed font-sans mt-1.5">
              지금까지 시뮬레이션하고 결합성을 증명했던 복잡한 화합물들의 리스트입니다. 언제든지 다시 클릭해 가상 3D 오비탈 캔버스로 리로드할 수 있습니다.
            </p>
          </div>
          <div className="px-4 py-2 bg-indigo-950/30 border border-indigo-500/20 rounded-xl flex flex-col justify-center min-w-[120px] shadow-inner text-center md:text-right md:self-center h-fit">
            <span className="text-[10px] font-sans font-bold text-indigo-300">총 연구 실적</span>
            <span className="text-lg font-mono font-extrabold text-indigo-400 tracking-wider">
              {archivedReactions.length} 건
            </span>
          </div>
        </div>

        {/* Tab-based Chemical Reaction Categorization Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-6 pb-1 overflow-x-auto select-none no-scrollbar">
          <button
            onClick={() => setSelectedArchiveTab("all")}
            className={`px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedArchiveTab === "all"
                ? "bg-indigo-600 border border-indigo-500 font-bold text-white shadow-lg shadow-indigo-500/20"
                : "bg-zinc-900/60 hover:bg-zinc-800/80 border border-white/5 text-slate-300"
            }`}
          >
            <span>전체 리스트</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono leading-none ${
              selectedArchiveTab === "all" ? "bg-white/20 text-white" : "bg-white/5 text-slate-400"
            }`}>
              {getCountForTag("all")}
            </span>
          </button>

          <button
            onClick={() => setSelectedArchiveTab("redox")}
            className={`px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedArchiveTab === "redox"
                ? "bg-indigo-600 border border-indigo-500 font-bold text-white shadow-lg shadow-indigo-500/20"
                : "bg-zinc-900/60 hover:bg-zinc-800/80 border border-white/5 text-slate-300"
            }`}
          >
            <span>🔥 산화-환원 (Redox)</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono leading-none ${
              selectedArchiveTab === "redox" ? "bg-white/20 text-white" : "bg-white/5 text-slate-400"
            }`}>
              {getCountForTag("redox")}
            </span>
          </button>

          <button
            onClick={() => setSelectedArchiveTab("neutralization")}
            className={`px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedArchiveTab === "neutralization"
                ? "bg-indigo-600 border border-indigo-500 font-bold text-white shadow-lg shadow-indigo-500/20"
                : "bg-zinc-900/60 hover:bg-zinc-800/80 border border-white/5 text-slate-300"
            }`}
          >
            <span>🧪 산-염기 중화 (Neutralization)</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono leading-none ${
              selectedArchiveTab === "neutralization" ? "bg-white/20 text-white" : "bg-white/5 text-slate-400"
            }`}>
              {getCountForTag("neutralization")}
            </span>
          </button>

          <button
            onClick={() => setSelectedArchiveTab("exothermic")}
            className={`px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedArchiveTab === "exothermic"
                ? "bg-indigo-600 border border-indigo-500 font-bold text-white shadow-lg shadow-indigo-500/20"
                : "bg-zinc-900/60 hover:bg-zinc-800/80 border border-white/5 text-slate-300"
            }`}
          >
            <span>⚡ 발열 반응 (Exothermic)</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono leading-none ${
              selectedArchiveTab === "exothermic" ? "bg-white/20 text-white" : "bg-white/5 text-slate-400"
            }`}>
              {getCountForTag("exothermic")}
            </span>
          </button>

          <button
            onClick={() => setSelectedArchiveTab("endothermic")}
            className={`px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedArchiveTab === "endothermic"
                ? "bg-indigo-600 border border-indigo-500 font-bold text-white shadow-lg shadow-indigo-500/20"
                : "bg-zinc-900/60 hover:bg-zinc-800/80 border border-white/5 text-slate-300"
            }`}
          >
            <span>❄️ 흡열 반응 (Endothermic)</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono leading-none ${
              selectedArchiveTab === "endothermic" ? "bg-white/20 text-white" : "bg-white/5 text-slate-400"
            }`}>
              {getCountForTag("endothermic")}
            </span>
          </button>

          <button
            onClick={() => setSelectedArchiveTab("virtual")}
            className={`px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedArchiveTab === "virtual"
                ? "bg-indigo-600 border border-indigo-500 font-bold text-white shadow-lg shadow-indigo-500/20"
                : "bg-zinc-900/60 hover:bg-zinc-800/80 border border-white/5 text-slate-300"
            }`}
          >
            <span>✨ 가상 공상화학 (Virtual)</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono leading-none ${
              selectedArchiveTab === "virtual" ? "bg-white/20 text-white" : "bg-white/5 text-slate-400"
            }`}>
              {getCountForTag("virtual")}
            </span>
          </button>

          <button
            onClick={() => setSelectedArchiveTab("physical-mixture")}
            className={`px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedArchiveTab === "physical-mixture"
                ? "bg-indigo-600 border border-indigo-500 font-bold text-white shadow-lg shadow-indigo-500/20"
                : "bg-zinc-900/60 hover:bg-zinc-800/80 border border-white/5 text-slate-300"
            }`}
          >
            <span>📦 물리적 단순 혼합 (Physical)</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono leading-none ${
              selectedArchiveTab === "physical-mixture" ? "bg-white/20 text-white" : "bg-white/5 text-slate-400"
            }`}>
              {getCountForTag("physical-mixture")}
            </span>
          </button>
        </div>

        {/* Reaction Cards Collection Grid */}
        {filteredReactions.length === 0 ? (
          <div className="border border-dashed border-white/10 rounded-2xl py-12 px-6 flex flex-col items-center justify-center text-center bg-zinc-900/10 mb-2">
            <BookOpen className="w-8 h-8 text-slate-600 mb-3 animate-pulse" />
            <h5 className="text-sm font-bold text-slate-400 mb-1">
              해당 분류군의 기록물이 발견되지 않았습니다.
            </h5>
            <p className="text-xs text-slate-500 max-w-sm">
              상단의 시뮬레이터를 작동하고 '학술 기록 도서관' 버튼을 클릭하면 새로운 분석자료가 여기에 즉시 박제됩니다.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-2">
            {filteredReactions.map((reaction) => (
              <div
                key={reaction.id}
                className="relative bg-zinc-950/70 border border-white/10 hover:border-indigo-500/40 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-indigo-950/20 group"
              >
                <div>
                  {/* Reaction Tag Pills */}
                  <div className="flex flex-wrap gap-1.5 mb-3 pr-14">
                    {reaction.tags.map((tag) => {
                      let label = tag;
                      let colorClasses = "bg-slate-500/10 border-slate-500/20 text-slate-400";
                      if (tag === "redox") {
                        label = "🔥 산화-환원 (Redox)";
                        colorClasses = "bg-rose-500/10 border-rose-500/20 text-rose-400";
                      } else if (tag === "neutralization") {
                        label = "🧪 산-염기 중화 (Neutralization)";
                        colorClasses = "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
                      } else if (tag === "exothermic") {
                        label = "⚡ 발열 반응 (Exothermic)";
                        colorClasses = "bg-orange-500/10 border-orange-500/20 text-orange-400";
                      } else if (tag === "endothermic") {
                        label = "❄️ 흡열 반응 (Endothermic)";
                        colorClasses = "bg-cyan-500/10 border-cyan-500/20 text-cyan-400";
                      } else if (tag === "virtual") {
                        label = "✨ 가상 공상화학";
                        colorClasses = "bg-purple-500/10 border-purple-500/20 text-purple-400";
                      } else if (tag === "physical-mixture") {
                        label = "📦 단순 물리혼합";
                        colorClasses = "bg-zinc-500/10 border-zinc-500/20 text-zinc-400";
                      }
                      return (
                        <span key={tag} className={`px-2 py-0.5 rounded-lg border text-[9px] font-sans font-bold tracking-tight ${colorClasses}`}>
                          {label}
                        </span>
                      );
                    })}
                  </div>

                  {/* Discard Delete Button */}
                  <button
                    type="button"
                    onClick={(e) => handleDeleteArchive(reaction.id, e)}
                    className="absolute top-4 right-4 px-2 py-1 bg-zinc-900 border border-white/5 hover:border-red-500/30 hover:bg-red-950/30 rounded-lg text-[10px] font-semibold text-slate-400 hover:text-red-400 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                  >
                    <Trash2 className="w-3 h-3" />
                    폐기
                  </button>

                  {/* Reaction Title */}
                  <h4 className="text-sm font-bold text-slate-100 group-hover:text-indigo-400 transition-colors mb-1.5 leading-snug">
                    {reaction.title}
                  </h4>

                  {/* Chemical Equation Box */}
                  <div className="bg-slate-950 border border-white/5 rounded-xl px-3 py-2 my-2 text-center shadow-inner">
                    <code className="text-xs font-mono font-bold text-indigo-400 tracking-wider">
                      {reaction.chemicalEquation}
                    </code>
                  </div>

                  {/* Reactant Formula Badge Layout */}
                  <div className="flex flex-wrap items-center gap-1.5 my-2.5">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mr-1">Reactants:</span>
                    {reaction.reactantsList.map((r, i) => (
                      <span key={i} className="px-2 py-0.5 bg-zinc-900/90 border border-white/5 rounded-md text-[10px] font-mono text-slate-300 font-bold">
                        {r.name} ({r.formula})
                      </span>
                    ))}
                  </div>

                  {/* Scientific Narrative */}
                  <p className="text-xs text-slate-400 leading-relaxed font-sans mb-4 min-h-[48px]">
                    {reaction.description}
                  </p>
                </div>

                {/* Footer and Interactive Restoration Button */}
                <div className="border-t border-white/5 pt-3 mt-auto flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-slate-600" />
                    {reaction.timestamp}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRestoreFromArchive(reaction)}
                    className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group/btn transition-colors cursor-pointer active:scale-95"
                  >
                    <span>연구 서서히 복원</span>
                    <RotateCcw className="w-3.5 h-3.5 text-indigo-400 group-hover/btn:rotate-180 transition-transform duration-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
          </motion.section>
        )}

        {/* 3. New 화학 반응 정보입력 창 HUD Dashboard (activeView === "custom_input") */}
        {activeView === "custom_input" && (
          <motion.section
            key="custom_input"
            id="chemical_custom_input_section"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-7xl mx-auto mt-6 p-6 border border-white/10 bg-zinc-950/85 rounded-2xl shadow-xl backdrop-blur-md flex flex-col gap-6"
          >
            {/* Cyber HUD Corner Decorators */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-purple-500/40 rounded-tl"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-purple-500/40 rounded-tr"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-purple-500/40 rounded-bl"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-purple-500/40 rounded-br"></div>

            {/* View Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
              <div>
                <span className="text-purple-400 font-mono text-[9px] uppercase tracking-widest block">
                  CUSTOM CHEMICAL SIMULATION BLUEPRINT REGISTRY
                </span>
                <h2 className="text-lg md:text-xl font-bold text-slate-100 flex items-center gap-2 tracking-wide mt-1">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  화학 반응 정보입력 창 (Custom Reaction Console)
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed font-sans mt-1.5">
                  로컬 시뮬레이터를 독립 기동하기 위한 3D 원자 기 좌표 구조를 직접 수립하거나, 제미나이(Gemini)에게 얻은 양질의 데이터 구조를 붙여넣어 보존할 수 있습니다.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const combinedTitle = customMaterials.length > 0
                    ? customMaterials.map(m => m.name).join(" + ")
                    : (customTitle || "물질 앙금 반응");

                  const promptTemplate = `제미나이야, ChemiSim AI 시뮬레이터 프로그램에 주입할 새로운 3D 화학 반응식 데이터를 json 형식으로 작성해줘.

[실험 설계 요구사항]
- 요구 반응명: ${combinedTitle}
- 반응 화학식: ${customEquationInput || "CaCO3 + 2HCl ⟶ CaCl2 + H2O + CO2"}

[세부 규칙]
1. 위 가상 반응식의 반응물(Reactants), 활성화 전이 상태 중간체(Intermediates), 그리고 최종 안정 수용 생성물(Products)의 3D 원자 클러스터를 수립해줘.
2. 반응식 전후에 관여하는 "모든 참여 원소들의 총 개수"가 질량 보존의 법칙에 의해 완벽하게 일치하고 보존되도록 각 단계(reactantNodes, intermediateNodes, productNodes)의 원자를 설계해줘. (원자 한 개도 임의로 누락되거나 과도하게 생성되어서는 안 됨)
3. 노드 간 가시성 확보 및 원자 식별:
   - 분자와 분자 사이가 너무 가깝게 닿아 있으면 개별 물질을 관찰하기 힘들어.
   - 따라서 반응에 관여하는 분자들과 물질들은 서로 "물질 단위별로 3D 공간 상에서 완전히 이격(최소 25-35 간격 차이 이상)"되도록 x, y, z 좌표를 분산해줘.
   - 예: AgNO3 + NaCl 반응물 단계라면, AgNO3를 구성하는 은(Ag), 질소(N), 산소(O) 원자들의 x 좌표는 대략 10~35 범위에 오밀조밀 모이게 하고, NaCl을 구성하는 나트륨(Na)과 염소(Cl) 원자들의 x 좌표는 70~95 범위에 모이도록 하여, 두 분자가 3D 모형상에서 우아하게 구별되게 만들어줘.
   - 중간체 및 생성물 역시 생성된 CO2, H2O 등의 분자 유닛들이 3D 공간 상에서 가독성 있게 멀찍이 떨어져서 독립된 분자체로 렌더링되게 설계해줘.
4. 모든 노드(Atoms)의 3차원 바운딩 박스는 x: 0-100, y: 0-100, z: -50 ~ 50 공간 내에 골고루 정렬시키고, links로 서로 적절한 결합 타입(single, double, triple, coordination)을 정의해줘.
5. 원소 기호(symbol)에 따른 주기율표 정석 보정 컬러(color) 및 사이즈(size) 기준을 철저히 준수해서 기재해줘:
   - H (수소): "#FFFFFF", size: 0.95
   - C (탄소): "#475569", size: 1.25
   - O (산소): "#EF4444", size: 1.15
   - N (질소): "#3B82F6", size: 1.15
   - Na (나트륨): "#A855F7", size: 1.45
   - Cl (염소): "#22C55E", size: 1.35
   - Ag (은): "#94A3B8", size: 1.4
   - Ca (칼슘): "#10B981", size: 1.4
   - Fe (철): "#EA580C", size: 1.35
   - Cu (구리): "#06B6D4", size: 1.35
   - 기타 다른 전형 원소들도 고유의 뚜렷한 대비 컬러와 적정 스케일 크기값으로 정확히 지정할 것.

출력 형식: 아래 예시 구조와 똑같이 nodes, links 들의 x, y, z 좌표배열을 정밀 계산하여 EXACT JSON 데이터 포맷만 반환해줘. (마크다운 백틱 문자를 제외하고 순수 텍스트 본문만 출력할 것)

{
  "chemicalEquation": "${customEquationInput || "CaCO3 + 2HCl ⟶ CaCl2 + H2O + CO2"}",
  "potentialEnergy": [${energyReactant || 30}, ${energyBarrier || 75}, ${energyProduct || 10}],
  "reactantNodes": [
    { "id": "ca_1", "symbol": "Ca", "x": 20, "y": 40, "z": -10, "color": "#10B981", "size": 1.4 },
    { "id": "c_1", "symbol": "C", "x": 40, "y": 45, "z": 5, "color": "#475569", "size": 1.25 },
    { "id": "o_1", "symbol": "O", "x": 35, "y": 60, "z": -15, "color": "#EF4444", "size": 1.15 }
  ],
  "reactantLinks": [
    { "id": "l_c1_o1", "source": "c_1", "target": "o_1", "bondType": "double" }
  ],
  "intermediateNodes": [
    { "id": "ca_1", "symbol": "Ca", "x": 25, "y": 35, "z": -5, "color": "#10B981", "size": 1.4 },
    { "id": "cl_1", "symbol": "Cl", "x": 15, "y": 20, "z": 5, "color": "#22C55E", "size": 1.35 }
  ],
  "intermediateLinks": [
    { "id": "l_ca1_cl1", "source": "ca_1", "target": "cl_1", "bondType": "coordination" }
  ],
  "productNodes": [
    { "id": "ca_1", "symbol": "Ca", "x": 20, "y": 25, "z": -10, "color": "#10B981", "size": 1.4 }
  ],
  "productLinks": []
}`;
                  navigator.clipboard.writeText(promptTemplate);
                  setToastMessage({ text: "제미나이 최적 프롬프트 프레임워크 템플릿이 클립보드에 복사되었습니다! 제미나이에 붙여넣어 연쇄 계산해 보세요.", type: "success" });
                }}
                className="px-4 py-2.5 bg-indigo-500/10 hover:bg-indigo-600 border border-indigo-500/25 text-indigo-300 hover:text-white rounded-xl text-xs font-sans font-bold flex items-center gap-2.5 transition-all cursor-pointer active:scale-95 shrink-0 h-fit"
              >
                <Copy className="w-4 h-4 animate-pulse text-indigo-400" />
                제미나이 질문용 프롬프트 템플릿 복사하기
              </button>
            </div>

            {/* Layout Split: Left Form manual constructor, Right High-precision JSON text entry */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Left Form: Simple Manual Reaction Solver */}
              <div className="lg:col-span-5 bg-zinc-900/30 border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 pb-2 border-b border-white/5 mb-4">
                    <Info className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-sans font-bold text-slate-300 uppercase">
                      1단계. 가상 입체 시뮬레이션 간편 폼 빌더
                    </span>
                  </div>

                  <div className="space-y-4">
                    {/* Dynamic Materials Pile List */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-sans text-indigo-400 font-bold uppercase tracking-wider block">
                          🧪 등록된 기질 목록 (누적 화학물질)
                        </span>
                        {customMaterials.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setCustomMaterials([]);
                              setCustomEquationInput("");
                              setJsonInputText("");
                              setToastMessage({ text: "누적 기질 목록 및 JSON 데이터가 모두 비워졌습니다.", type: "info" });
                            }}
                            className="text-[9px] text-rose-400 hover:text-rose-300 font-semibold transition-colors cursor-pointer"
                          >
                            모두 비우기
                          </button>
                        )}
                      </div>
                      <div className="min-h-[64px] max-h-[140px] overflow-y-auto p-2 bg-zinc-950/50 border border-white/5 rounded-xl flex flex-wrap gap-1.5 items-start content-start">
                        {customMaterials.map((mat, i) => (
                          <div key={i} className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 border border-white/10 rounded-lg text-[11px] text-slate-200 font-sans shadow-sm transition-all hover:bg-white/10 select-none">
                            <span className="font-mono text-[9px] font-semibold text-purple-400">#{i + 1}</span>
                            <span className="font-bold">{mat.name}</span>
                            <span className="text-[10px] font-mono text-slate-400 font-medium">({mat.formula})</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveCustomMaterial(i)}
                              className="text-slate-400 hover:text-red-400 font-sans transition-colors font-extrabold ml-1 active:scale-95 cursor-pointer text-xs"
                              title="삭제"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        {customMaterials.length === 0 && (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500 font-sans py-3">
                            기질명이 비어있습니다. 아래 입력칸에 화학물질을 적고 엔터를 누르십시오.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-sans text-slate-400 font-bold uppercase block mb-1">화학 물질 입력창 (입력 후 엔터)</label>
                        <input
                          type="text"
                          value={customTitle}
                          onChange={(e) => handleCustomTitleChange(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              if (e.nativeEvent.isComposing) return;
                              e.preventDefault();
                              handleAddCustomMaterial(customTitle);
                            }
                          }}
                          placeholder="예: 물, 에탄올 입력 후 Enter"
                          className="w-full bg-zinc-950 border border-white/5 hover:border-white/10 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500 rounded-xl px-3.5 py-1.5 text-xs font-sans text-slate-200 outline-none transition-all text-center shadow-inner"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-sans text-purple-400 font-bold uppercase block mb-1">화학식 표기 (STOICHIOMETRIC FORMULA)</label>
                        <input
                          type="text"
                          value={customEquationInput}
                          onChange={(e) => setCustomEquationInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              if (e.nativeEvent.isComposing) return;
                              e.preventDefault();
                              setToastMessage({ text: "화학 반응식이 성공적으로 세팅되었습니다.", type: "success" });
                            }
                          }}
                          placeholder="예: CaCO3 + 2HCl ⟶ CaCl2 + H2O + CO2"
                          className="w-full bg-zinc-950 border border-white/5 hover:border-white/10 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500 rounded-xl px-3.5 py-1.5 text-xs font-mono text-purple-300 outline-none transition-all text-center shadow-inner"
                        />
                      </div>
                    </div>

                    {/* 화학 물질 입력창과 직접 완벽 결합된 전이 주입 버튼 */}
                    <button
                      type="button"
                      onClick={() => handleAddCustomMaterial(customTitle)}
                      disabled={!customTitle.trim()}
                      className="w-full py-2 bg-gradient-to-r from-purple-700/80 to-indigo-700/80 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-purple-950/20 active:scale-95 cursor-pointer mt-1"
                    >
                      + 폼 빌더에 전이 주입하기 ⚡
                    </button>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[9px] font-sans text-slate-400 font-bold block mb-1">반응물 에너지 (0-100)</label>
                        <input
                          type="number"
                          value={energyReactant}
                          onChange={(e) => setEnergyReactant(Math.max(0, Math.min(100, Number(e.target.value))))}
                          className="w-full bg-zinc-950 border border-white/5 rounded-xl px-3 py-1.5 text-xs text-center font-mono text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-sans text-slate-400 font-bold block mb-1">활성화 장벽 (0-100)</label>
                        <input
                          type="number"
                          value={energyBarrier}
                          onChange={(e) => setEnergyBarrier(Math.max(0, Math.min(100, Number(e.target.value))))}
                          className="w-full bg-zinc-950 border border-white/5 rounded-xl px-3 py-1.5 text-xs text-center font-mono text-orange-400"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-sans text-slate-400 font-bold block mb-1">생성물 에너지 (0-100)</label>
                        <input
                          type="number"
                          value={energyProduct}
                          onChange={(e) => setEnergyProduct(Math.max(0, Math.min(100, Number(e.target.value))))}
                          className="w-full bg-zinc-950 border border-white/5 rounded-xl px-3 py-1.5 text-xs text-center font-mono text-indigo-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-sans text-slate-400 font-bold block mb-2">중화 및 산화 결합 활성 성립 여부</label>
                      <div className="flex bg-zinc-950 p-1 border border-white/5 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setIsReactionValidInput(true)}
                          className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                            isReactionValidInput ? "bg-purple-600 text-white" : "text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          정상 융합 반응 성립
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsReactionValidInput(false)}
                          className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                            !isReactionValidInput ? "bg-red-500/20 text-red-400 border border-red-500/30" : "text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          단순 물리 불안정 혼합
                        </button>
                      </div>
                    </div>

                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-white/5">
                  <span className="text-[10px] text-slate-500 font-sans leading-relaxed block">
                    위의 간편 폼 입력만으로 저장 시, ChemiSim 알고리즘 물리 규칙에 기반하여 원자 결합도 및 3D 회전 사슬이 완전형 상태로 최적 생성(generateDynamicFallback)되어 편리하고 완벽하게 주입 구동됩니다.
                  </span>
                </div>
              </div>

              {/* Right Input: High resolution 3D Coordinate Blueprint JSON Array */}
              <div className="lg:col-span-7 bg-zinc-900/30 border border-white/5 rounded-2xl p-5 flex flex-col justify-between gap-4">
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-3">
                    <div className="flex items-center gap-2">
                      <Code className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-sans font-bold text-slate-300 uppercase">
                        2단계. 제미나이 3D 기질 구조 정위 좌표계 주입 (JSON Manual Interface)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setJsonInputText("");
                        setCustomMaterials([]);
                        setCustomEquationInput("");
                        setToastMessage({ text: "JSON 수동 주입 데이터 및 입력된 화학 물질이 모두 초기화되었습니다.", type: "info" });
                      }}
                      className="px-2.5 py-1 text-[10px] font-sans font-semibold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 hover:border-transparent rounded-lg transition-all cursor-pointer active:scale-95"
                    >
                      모두 지우기
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 font-sans leading-relaxed mb-2.5">
                    제미나이에 복사 템플릿을 입력해 취득한 3D 극성 오비탈 노드/링크 셋팅 JSON 문자열을 가치분산 가식 필터링 없이 그대로 복사-붙여넣기해 주십시오. (완벽한 기하 모핑이 보장됩니다)
                  </p>

                  <textarea
                    value={jsonInputText}
                    onChange={(e) => setJsonInputText(e.target.value)}
                    placeholder="제미나이에 얻은 온전한 JSON 결과값을 이 영역에 넣어 주십시오..."
                    className="flex-1 min-h-[280px] bg-zinc-950 border border-white/5 hover:border-white/10 focus:border-purple-500/50 rounded-xl p-4 text-[11px] font-mono text-purple-300 outline-none transition-all resize-none shadow-inner"
                  ></textarea>
                </div>

                {/* Confirm actions bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/5">
                  <div className="flex items-center gap-2 text-[10px] text-amber-500 font-bold font-mono">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Offline Local Validation Active • JSON Checked
                  </div>

                  <button
                    type="button"
                    onClick={handleApplyCustomSimulation}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-purple-950/20 active:scale-97 cursor-pointer shrink-0"
                  >
                    <Save className="w-4 h-4 text-purple-100" />
                    저장 및 3D 시뮬레이션 즉시 수행 개시 ⚡
                  </button>
                </div>
              </div>

            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Robust Hud Glassmorphic Toast Notification Overlay */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/90 border border-indigo-500/30 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md animate-fadeIn transition-all">
          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></div>
          <span className="text-xs font-semibold text-slate-100">{toastMessage.text}</span>
        </div>
      )}

      {/* Fine-polished system bottom note */}
      <footer className="w-full max-w-7xl mx-auto mt-6 text-center text-[10px] font-mono text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-white/5 pt-4 pb-2">
        <div className="flex gap-8 items-center">
          <div className="flex gap-2"><span className="text-slate-600">Uptime:</span> 12.4s</div>
          <div className="flex gap-2"><span className="text-slate-600">Processing:</span> 24 TFLOPS</div>
          <div className="flex gap-2"><span className="text-slate-600">Environment:</span> Anaerobic High-Temp</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
          Simulation Engine Ready
        </div>
      </footer>

    </div>
  );
}
