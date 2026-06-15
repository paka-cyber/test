/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  FlaskConical,
  RotateCcw,
  BookOpen,
  ArrowRightLeft,
  AlertTriangle,
  Lightbulb,
  Trash2,
  Activity,
} from "lucide-react";
import { AlternativeRecommendation } from "../types";

interface ControlPanelProps {
  onSimulate: (reactants: string, forceAI?: boolean) => void;
  isLoading: boolean;
  activePhaseId: "reactant" | "intermediate" | "product";
  onSelectPhase: (phaseId: "reactant" | "intermediate" | "product") => void;
  isValidReaction: boolean;
  alternativeRecommendations?: AlternativeRecommendation[];
  usedAI: boolean;
  modelUsed?: string;
  errorDetail?: string;
  injectedSubstances: any[];
  setInjectedSubstances: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function ControlPanel({
  onSimulate,
  isLoading,
  activePhaseId,
  onSelectPhase,
  isValidReaction,
  alternativeRecommendations,
  usedAI,
  modelUsed,
  errorDetail,
  injectedSubstances,
  setInjectedSubstances,
}: ControlPanelProps) {
  const [customReactants, setCustomReactants] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const playInterval = useRef<NodeJS.Timeout | null>(null);
  const [activeTab, setActiveTab] = useState<"preset" | "custom">("preset");

  // Original CPK Chemical Presets
  const presets = [
    {
      id: "na_vinegar",
      name: "베이킹소다 + 식초",
      formula: "NaHCO3 + CH3COOH",
      desc: "수용액 중화이동 및 자발성 이산화탄소 기출 탈수",
    },
    {
      id: "meth_comb",
      name: "메탄 고열 연소전 가스",
      formula: "CH4 + 2O2",
      desc: "산소 결합을 수반한 에너제틱 극성 발열 반응 메커니즘",
    },
    {
      id: "prop_comb",
      name: "프로판 고열량 완전연소 가스",
      formula: "C3H8 + 5O2",
      desc: "마찰 활성화 및 다량의 이산화탄소와 수증기 방출 연소",
    },
    {
      id: "hcl_b",
      name: "염산 + 수산화나트륨",
      formula: "HCl + NaOH",
      desc: "강산-강염기 전하 장벽 붕괴 및 물염 정지 안정",
    },
  ];

  const [customInputName, setCustomInputName] = useState<string>("");
  const [customInputFormula, setCustomInputFormula] = useState<string>("");

  // Hand-built automated autocomplete chemical matching helper
  const handleNameChange = (val: string) => {
    setCustomInputName(val);
    const trimmed = val.trim();
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
    };
    if (standardMap[trimmed]) {
      setCustomInputFormula(standardMap[trimmed]);
    } else {
      const hasAlphaOnly = /^[a-zA-Z0-9\s()₃₂]+$/.test(trimmed);
      if (hasAlphaOnly) {
        setCustomInputFormula(trimmed);
      }
    }
  };

  // Advanced funny academic quotes for simulator loading HUD
  const [loadingQuote, setLoadingQuote] = useState<string>("");
  const loadingQuotes = [
    "밀리초 단위 아토초 양자 도약 간격 조율 중...",
    "CPK 가이드라인 표준에 기반한 원자 반경 3D 구체 변환 중...",
    "스플라인 포텐셜 에너지 힐-클라임 보간 곡선 매핑 중...",
    "질량 보존의 법칙을 만족하는 노드/링크 배열 보존 검증 중...",
    "제미나이 3.5 모델에 기반한 열역학 양론적 stoichiometry 가중치 계산 중...",
    "반응성 기질과 탄산 탈수 메커니즘 라디칼 분열을 교차 검증 중...",
  ];

  useEffect(() => {
    if (isLoading) {
      setLoadingQuote(loadingQuotes[0]);
      const intv = setInterval(() => {
        const rand = loadingQuotes[Math.floor(Math.random() * loadingQuotes.length)];
        setLoadingQuote(rand);
      }, 2500);
      return () => clearInterval(intv);
    }
  }, [isLoading]);

  // Handle Step Player auto play interval
  useEffect(() => {
    if (isPlaying) {
      playInterval.current = setInterval(() => {
        if (activePhaseId === "reactant") {
          onSelectPhase("intermediate");
        } else if (activePhaseId === "intermediate") {
          onSelectPhase("product");
        } else {
          onSelectPhase("reactant");
        }
      }, 3000); // 3 seconds interval for visual ease
    } else {
      if (playInterval.current) {
        clearInterval(playInterval.current);
      }
    }

    return () => {
      if (playInterval.current) clearInterval(playInterval.current);
    };
  }, [isPlaying, activePhaseId, onSelectPhase]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    setIsPlaying(false);
    if (activePhaseId === "reactant") onSelectPhase("intermediate");
    else if (activePhaseId === "intermediate") onSelectPhase("product");
    else onSelectPhase("reactant");
  };

  const handlePrev = () => {
    setIsPlaying(false);
    if (activePhaseId === "product") onSelectPhase("intermediate");
    else if (activePhaseId === "intermediate") onSelectPhase("reactant");
    else onSelectPhase("product");
  };

  // Sync formula string when items change
  const syncFormula = (subs: any[]) => {
    const validSubs = (subs || []).filter((s): s is any => !!s && typeof s === "object" && typeof s.formula === "string");
    const joined = validSubs.map(s => s.formula).join(" + ");
    setCustomReactants(joined);
  };

  // Build reactants when injectedSubstances props update
  useEffect(() => {
    if (Array.isArray(injectedSubstances)) {
      syncFormula(injectedSubstances);
    }
  }, [injectedSubstances]);

  // Set up loader helpers for preset selections
  const loadFormulaIntoBeaker = (formula: string) => {
    const parts = (formula || "").split(/[+\s⟶→↛]+/).map(p => p.trim()).filter(Boolean);
    const standardLabelMap: { [key: string]: string } = {
      "H2O": "물",
      "CH3COOH": "식초(아세트산)",
      "NaHCO3": "베이킹 소다",
      "HCl": "염산",
      "NaOH": "수산화나트륨",
      "C2H5OH": "에탄올 (알코올)",
      "CH4": "메탄 (가스)",
      "O2": "산소",
      "2O2": "산소 (2분자)",
      "CO2": "이산화탄소",
      "Vb": "비브라늄 (가상)",
      "Ad": "아다만티움 (가상)",
      "Elx": "마법 비약 (가상)",
    };

    const parsed = parts.map((part, idx) => {
      const cleaned = part.replace(/^\d+/, ""); // remove coefficients e.g. 2O2 -> O2
      const name = standardLabelMap[part] || standardLabelMap[cleaned] || `${part}`;
      return {
        id: `auto_${idx}_${Date.now()}_${Math.random()}`,
        name,
        formula: part
      };
    }).filter(p => !!p && typeof p.formula === "string");

    setInjectedSubstances(parsed);
    setCustomReactants(formula);
    onSimulate(formula);
  };

  const handlePresetSelect = (formula: string) => {
    loadFormulaIntoBeaker(formula);
  };

  // Handle direct addition of typed substances
  const handleAddCustomSubstance = () => {
    if (!customInputName.trim() || injectedSubstances.length >= 5) return;
    
    let name = customInputName.trim();
    let formula = customInputFormula.trim();
    
    if (!formula) {
      const standardMap: { [key: string]: { label: string, formula: string } } = {
        "물": { label: "물", formula: "H2O" },
        "식초": { label: "식초(아세트산)", formula: "CH3COOH" },
        "아세트산": { label: "식초(아세트산)", formula: "CH3COOH" },
        "베이킹 소다": { label: "베이킹 소다", formula: "NaHCO3" },
        "베이킹소다": { label: "베이킹 소다", formula: "NaHCO3" },
        "염산": { label: "염산", formula: "HCl" },
        "수산화나트륨": { label: "수산화나트륨", formula: "NaOH" },
        "에탄올": { label: "에탄올 (알코올)", formula: "C2H5OH" },
        "알코올": { label: "에탄올 (알코올)", formula: "C2H5OH" },
        "메탄": { label: "메탄 (가스)", formula: "CH4" },
        "메탄가스": { label: "메탄 (가스)", formula: "CH4" },
        "메탄 가스": { label: "메탄 (가스)", formula: "CH4" },
        "프로판": { label: "프로판 (가스)", formula: "C3H8" },
        "프로판가스": { label: "프로판 (가스)", formula: "C3H8" },
        "프로판 가스": { label: "프로판 (가스)", formula: "C3H8" },
        "propane": { label: "프로판 (가스)", formula: "C3H8" },
        "산소": { label: "산소", formula: "O2" },
        "이산화탄소": { label: "이산화탄소", formula: "CO2" },
        "비브라늄": { label: "비브라늄 (가상)", formula: "Vb" },
        "아다만티움": { label: "아다만티움 (가상)", formula: "Ad" },
        "마법 비약": { label: "마법 비약 (가상)", formula: "Elx" },
        "마법비약": { label: "마법 비약 (가상)", formula: "Elx" },
      };

      const matched = standardMap[name];
      if (matched) {
        name = matched.label;
        formula = matched.formula;
      } else {
        const hasAlpha = /[a-zA-Z]/g.test(name);
        if (!hasAlpha) {
          formula = name.substring(0, 3) + "_Mol";
        } else {
          formula = name;
        }
      }
    }

    const next = [
      ...injectedSubstances,
      { id: `custom_${Date.now()}_${Math.random()}`, name, formula }
    ];
    setInjectedSubstances(next);
    syncFormula(next);
    setCustomInputName("");
    setCustomInputFormula("");
  };

  const handleSubmitCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customReactants.trim()) return;
    onSimulate(customReactants, true);
  };

  // Safe, sanitized local array of injected substances to prevent runtime crashes
  const safeInjectedSubstances = (injectedSubstances || [])
    .filter((sub): sub is any => !!sub && typeof sub === "object" && typeof sub.id === "string" && typeof sub.formula === "string");

  return (
    <div className="flex flex-col gap-5 h-full justify-between">
      {/* 0. Unified Elegant Tabs for original preset library vs custom beaker */}
      <div className="flex bg-zinc-950/90 border border-white/10 rounded-2xl p-1 shadow-inner shadow-slate-950/60 backdrop-blur-md">
        <button
          type="button"
          onClick={() => setActiveTab("preset")}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === "preset"
              ? "bg-indigo-600/90 text-white shadow shadow-indigo-500/20 border border-white/10"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
          }`}
        >
          학술 권장 화학 프리셋 (CPK)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("custom")}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === "custom"
              ? "bg-indigo-600/90 text-white shadow shadow-indigo-500/20 border border-white/10"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
          }`}
        >
          정밀 커스텀 비커 투약
        </button>
      </div>

      {/* 1. Substance Launcher Beaker Chamber or Academic Recommend Presets */}
      {activeTab === "preset" ? (
        <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 backdrop-blur-md animate-fadeIn">
          <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2.5">
            <h3 className="text-xs font-bold uppercase text-indigo-400 flex items-center gap-2 tracking-wide">
              <FlaskConical className="w-4 h-4 text-indigo-400 animate-pulse" />
              학술 권장 화학 프리셋 라이브러리 (CPK)
            </h3>
          </div>

          <div className="space-y-3">
            {presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetSelect(preset.formula)}
                id={`preset_${preset.id}`}
                className="w-full text-left bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 p-3.5 transition-all cursor-pointer group active:scale-[0.99] flex items-center justify-between shadow-md"
              >
                <div className="flex-1 pr-4">
                  <div className="text-xs font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">
                    {preset.name}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 leading-normal font-sans">{preset.desc}</div>
                </div>
                <div className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1.5 rounded-lg text-[10px] font-mono tracking-wider shrink-0 font-bold shadow-inner">
                  {preset.formula}
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 backdrop-blur-md animate-fadeIn">
          <div className="flex items-center justify-between mb-3.5 border-b border-white/5 pb-2.5">
            <h3 className="text-xs font-bold uppercase text-indigo-400 flex items-center gap-2 tracking-wide">
              <FlaskConical className="w-4 h-4 text-indigo-400 animate-pulse" />
              실험 물질 투약 비커 챔버
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setInjectedSubstances([]);
                }}
                className="text-[10px] font-sans font-semibold text-slate-400 hover:text-rose-400 bg-white/5 hover:bg-rose-500/10 border border-white/5 py-1 px-2.5 rounded-lg flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                모두 지우기
              </button>
              <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/25 px-2.5 py-0.5 rounded-full font-bold">
                ({safeInjectedSubstances.length}/5)
              </span>
            </div>
          </div>

          {/* Display Current Injected list */}
          <div className="space-y-2 mb-4 max-h-[180px] overflow-y-auto pr-1">
            {safeInjectedSubstances.map((sub, idx) => (
              <div
                key={sub.id}
                className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between transition-all hover:bg-white/10 group animate-fadeIn shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-[10px] font-mono font-bold text-indigo-400">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="text-xs font-mono font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">
                      {sub.name}
                    </div>
                    <div className="text-[9px] font-mono text-slate-500 mt-0.5 tracking-wider uppercase">
                      ELEMENT INJECTED • {sub.formula}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (isLoading) return;
                    const next = safeInjectedSubstances.filter((item) => item.id !== sub.id);
                    setInjectedSubstances(next);
                    syncFormula(next);
                  }}
                  className="p-1 px-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer active:scale-90"
                  title="제거"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {safeInjectedSubstances.length === 0 && (
              <div className="text-center py-6 bg-zinc-950/40 border border-dashed border-white/5 rounded-xl text-[10px] text-slate-500 font-sans">
                비커가 비어 있습니다. 아래 선반에서 물질을 투약해 주십시오.
              </div>
            )}
          </div>

          {/* Custom substance registry */}
          <div className="border-t border-white/5 pt-3.5 space-y-2.5">
            <span className="text-[9px] font-mono font-bold text-slate-500 block uppercase tracking-wider">
              + 실험 기질 물질 직접 입력 (화학명 / 분자 화학식)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[8px] font-sans text-slate-400 font-bold uppercase">물질명 (한글/영문)</label>
                <input
                  type="text"
                  value={customInputName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomSubstance();
                    }
                  }}
                  placeholder="예: 물, 에탄올, 소금"
                  className="w-full bg-zinc-950 border border-white/5 hover:border-white/10 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3 py-1.5 text-xs font-sans text-slate-100 placeholder-slate-600 outline-none transition-all shadow-inner text-center"
                  disabled={isLoading}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[8px] font-sans text-indigo-400 font-bold uppercase">화학식 (Formula)</label>
                <input
                  type="text"
                  value={customInputFormula}
                  onChange={(e) => setCustomInputFormula(e.target.value)}
                  placeholder="예: H2O, C2H5OH, NaCl"
                  className="w-full bg-zinc-950 border border-white/5 hover:border-white/10 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3 py-1.5 text-xs font-mono text-indigo-300 placeholder-slate-600 outline-none transition-all shadow-inner text-center"
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomSubstance();
                    }
                  }}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddCustomSubstance}
              disabled={isLoading || !customInputName.trim() || safeInjectedSubstances.length >= 5}
              className="w-full py-2 bg-indigo-600/90 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-all disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed shadow-md hover:shadow-indigo-950/20 active:scale-95 cursor-pointer mt-1"
            >
              + 비커 챔버에 전위 투약하기 ⚡
            </button>
          </div>

          {/* Quick Shelf */}
          <div className="mt-4 border-t border-white/5 pt-3.5">
            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block mb-2">원클릭 간편 투여 물질 선반</span>
            <div className="flex flex-wrap gap-1.5 max-h-[110px] overflow-y-auto pr-1">
              {[
                { label: "물", formula: "H2O", desc: "H₂O" },
                { label: "식초(아세트산)", formula: "CH3COOH", desc: "CH₃COOH" },
                { label: "베이킹 소다", formula: "NaHCO3", desc: "NaHCO₃" },
                { label: "염산", formula: "HCl", desc: "HCl" },
                { label: "수산화나트륨", formula: "NaOH", desc: "NaOH" },
                { label: "에탄올 (알코올)", formula: "C2H5OH", desc: "C₂H₅OH" },
                { label: "메탄 (가스)", formula: "CH4", desc: "CH₄" },
                { label: "프로판", formula: "C3H8", desc: "C₃H₈" },
                { label: "산소", formula: "O2", desc: "O₂" },
                { label: "이산화탄소", formula: "CO2", desc: "CO₂" },
                { label: "비브라늄 (가상)", formula: "Vb", desc: "Vb" },
                { label: "아다만티움 (가상)", formula: "Ad", desc: "Ad" },
                { label: "마법 비약 (가상)", formula: "Elx", desc: "ELx" },
              ].map((item) => {
                const isAlreadyIn = safeInjectedSubstances.some(sub => sub && sub.formula === item.formula);
                return (
                  <button
                    key={item.formula}
                    type="button"
                    disabled={isLoading || safeInjectedSubstances.length >= 5}
                    onClick={() => {
                      if (isLoading || safeInjectedSubstances.length >= 5) return;
                      const next = [
                        ...safeInjectedSubstances,
                        { id: `quick_${Date.now()}_${Math.random()}`, name: item.label, formula: item.formula }
                      ];
                      setInjectedSubstances(next);
                      syncFormula(next);
                    }}
                    className={`px-2 py-1 rounded-lg border text-[10px] font-sans flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed ${
                      isAlreadyIn 
                        ? "bg-indigo-500/15 border-indigo-500/35 text-indigo-400 font-bold shadow-sm" 
                        : "bg-white/5 hover:bg-white/10 text-slate-300 hover:text-indigo-400 border-white/5"
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="text-[9px] font-mono text-slate-500 font-normal">{item.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. Custom Element Compound Formula Preview and Simulation Launcher */}
      <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 backdrop-blur-md">
        <h3 className="text-xs font-bold uppercase text-slate-300 mb-2 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
          반응물 대기열 • 화학 격자 반응 시뮬레이터
        </h3>
        <p className="text-[10px] text-slate-400 mb-3 leading-relaxed">
          대기열에 투약된 화학 물질들이 반응 혼합체를 수립했습니다. START 버튼 클릭 시 제미나이가 분자 궤도 중첩 상태를 계산합니다.
        </p>
        <form onSubmit={handleSubmitCustom} className="flex flex-col gap-2.5">
          <div className="relative">
            <input
              type="text"
              id="input_reactants"
              value={customReactants}
              onChange={(e) => setCustomReactants(e.target.value)}
              placeholder="대기열의 물질 조합식"
              className="w-full bg-zinc-950 border border-white/5 hover:border-white/10 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-100 placeholder-slate-600 outline-none transition-all"
              disabled={isLoading}
            />
            <button
              type="button"
              id="btn_clear_input"
              onClick={() => {
                setInjectedSubstances([]);
                setCustomReactants("");
              }}
              className="absolute right-4 top-3 text-slate-500 hover:text-slate-300 text-[10px] uppercase font-mono active:scale-90"
            >
              CLEAR
            </button>
          </div>

          <button
            type="submit"
            id="btn_start_simulation"
            disabled={isLoading || !customReactants.trim()}
            className={`w-full py-4 text-white rounded-2xl font-bold text-xs sm:text-sm tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 group cursor-pointer ${
              isLoading || !customReactants.trim()
                ? "bg-slate-800/40 text-slate-500 border border-slate-800/60 cursor-not-allowed shadow-none"
                : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20 active:scale-[0.98]"
            }`}
          >
            <Activity className="w-4 h-4 text-slate-100 group-hover:scale-110 transition-transform" />
            <span className="text-orange-500 font-bold">⚡</span>
            <span>{isLoading ? "3D 시뮬레이션 양자화 연산 결합 중..." : "제미나이(GEMINI) 화학반응 시뮬레이션 개시"}</span>
          </button>
        </form>

        {/* Loading Hud */}
        {isLoading && (
          <div className="mt-3.5 bg-indigo-600/10 border border-indigo-500/25 rounded-xl p-3.5 animate-pulse">
            <div className="flex items-center gap-2.5">
              <div className="w-3.5 h-3.5 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin"></div>
              <span className="text-[11px] font-mono text-indigo-300 uppercase tracking-wider">화학 기하구조 매커니즘 도출 중</span>
            </div>
            <p className="text-[10px] font-sans text-indigo-400/90 mt-1.5 leading-normal">
              {loadingQuote || "제미나이 3.5 가상 실험실에 전극을 연결하는 중..."}
            </p>
          </div>
        )}
      </div>

      {/* 3. High Fidelity Stoichiometric Step Player Timeline */}
      <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 backdrop-blur-md">
        <h3 className="text-xs font-bold uppercase text-slate-300 mb-2.5 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
          반응 양론 타임라인 재생 제어기
        </h3>

        {/* Timeline representation nodes */}
        <div className="grid grid-cols-3 gap-2 mb-3.5">
          {(["reactant", "intermediate", "product"] as const).map((pType) => (
            <button
              key={pType}
              onClick={() => {
                setIsPlaying(false);
                onSelectPhase(pType);
              }}
              id={`step_tab_${pType}`}
              className={`py-2 rounded-lg text-[10px] font-mono font-bold transition-all border cursor-pointer uppercase ${
                activePhaseId === pType
                  ? "bg-indigo-500/15 border-indigo-500/35 text-indigo-300 shadow-sm"
                  : "bg-white/5 border border-white/5 text-slate-500 hover:text-slate-400 hover:border-white/10"
              }`}
            >
              {pType === "reactant" ? "1. 반응물" : pType === "intermediate" ? "2. 중간체" : "3. 생성물"}
            </button>
          ))}
        </div>

        {/* Step playback buttons HUD */}
        <div className="bg-zinc-950 rounded-xl border border-white/5 p-2.5 flex items-center justify-between gap-2 shadow-inner">
          <button
            onClick={handlePrev}
            id="btn_player_prev"
            className="p-1 px-2.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-slate-200 transition-all active:scale-90 animate-fadeIn"
            title="이전 단계"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={togglePlay}
            id="btn_player_play"
            className={`flex items-center gap-1.5 py-1.5 px-4 rounded-lg font-mono text-[11px] font-bold transition-all active:scale-95 ${
              isPlaying
                ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/25"
                : "bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/25"
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3 h-3 fill-current" />
                PAUSE
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                AUTO RUN
              </>
            )}
          </button>
          <button
            onClick={handleNext}
            id="btn_player_next"
            className="p-1 px-2.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-slate-200 transition-all active:scale-90"
            title="다음 단계"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4. Validation alert & intelligent recommendations bridge list */}
      <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 backdrop-blur-md flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-2.5">
            <h3 className="text-xs font-bold uppercase text-slate-300 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
              AI 화학 사전 검증 및 지능 대체 지도
            </h3>
            <span className="text-[9px] font-mono bg-zinc-950 border border-white/5 px-2 py-0.5 rounded text-indigo-400 uppercase font-bold">
              {usedAI ? `${modelUsed || "GEMINI AI"}` : "LOCAL PRESET"}
            </span>
          </div>

          {errorDetail && (
            <div className="bg-amber-500/10 border border-amber-500/25 text-amber-300 p-3 rounded-xl mb-3 text-[10.5px] font-sans flex items-start gap-2.5 animate-fadeIn">
              <div className="w-3.5 h-3.5 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
              </div>
              <div>
                <p className="font-bold text-amber-200">AI 모델 트래픽 지연 수용 초과 (503)</p>
                <p className="text-[9.5px] text-slate-300 mt-1 leading-relaxed">
                  실시간 제미나이 API 트래픽 과부하로 인해, <b>고신뢰성 학술 로컬 시뮬레이션 계산 물리 엔진</b>이 활성화되었습니다. 모든 상간 전이 격자 원자들의 갯수와 종류가 100% 보증되었습니다.
                </p>
              </div>
            </div>
          )}

          {!isValidReaction && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-3 rounded-xl mb-3 text-[11px] font-sans flex items-start gap-2.5 animate-fadeIn">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">반응 교환 성립 정지 상황 관측</p>
                <p className="text-[10px] text-red-400 mt-1">
                  기입된 화합물 간에 이온 결합 또는 수소 환원 에너지 전이가 부족하여, 충돌 후에도 단순 물리적 혼합으로 수렴했습니다. 아래 학술 대체 리스트를 권장 드립니다.
                </p>
              </div>
            </div>
          )}

          {isValidReaction && !errorDetail && (
            <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 p-2.5 rounded-xl mb-3 text-[10.5px] font-sans flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></div>
              <span><b>정상 결합 활성 성립:</b> 3D 격자 전이 상태가 보존된 안정 생성물이 도출되었습니다.</span>
            </div>
          )}
        </div>

        {/* Suggestion list */}
        <div className="space-y-2 mt-2">
          <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider block">안정성 추천 기질 리스트</span>
          {alternativeRecommendations && alternativeRecommendations.length > 0 ? (
            alternativeRecommendations.map((rec, idx) => (
              <div
                key={idx}
                className="bg-white/5 hover:bg-white/10 p-2.5 rounded-xl border border-white/10 text-[10px] flex items-center justify-between gap-3 group transition-all"
              >
                <div className="flex-1">
                  <span className="font-mono font-bold text-slate-200 group-hover:text-indigo-400 transition-colors block">
                    {rec.reactant}
                  </span>
                  <span className="text-slate-400 font-sans leading-normal block mt-0.5 text-[9px] line-clamp-1 group-hover:line-clamp-none transition-all">
                    {rec.reason}
                  </span>
                </div>
                <button
                  type="button"
                  id={`btn_load_rec_${idx}`}
                  onClick={() => handlePresetSelect(rec.reactant)}
                  className="px-2 py-1 bg-indigo-500/10 hover:bg-indigo-500 text-[10px] font-mono text-indigo-400 hover:text-white rounded-lg border border-indigo-500/20 shrink-0 transition-all active:scale-90"
                >
                  로드 ⚡
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-2.5 text-slate-600 text-[10px] font-sans">
              대체 후보 목록이 존재하지 않습니다. 프리셋 중 하나를 선택해 주십시오.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
