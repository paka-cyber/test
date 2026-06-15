import { SimulationResponse, ElementNode, ChemicalLink } from "./types";

export const LOCAL_PRESETS: { [key: string]: SimulationResponse } = {
  "baking-soda-vinegar": {
    usedAI: false,
    validation: {
      isValidReaction: true,
      chemicalEquation: "NaHCO₃ + CH₃COOH ⟶ CH₃COONa + H₂O + CO₂",
      potentialEnergy: [20, 75, 10],
      alternativeRecommendations: [
        { reactant: "HCl + NaOH", reason: "강한 산-염기 중화반응으로서 더 급격한 퍼텐셜 에너지 낙하폭을 보여주는 반응성 대표 모델입니다." },
        { reactant: "CH₄ + O₂", reason: "극적인 에너지를 수반하는 Combustion(연소) 메커니즘을 경험할 수 있는 대표적 발열 반응입니다." }
      ]
    },
    phases: [
      {
        phaseId: "reactant",
        title: "기질 및 초기 반응계 (Reactants)",
        description: "고체 탄산수소나트륨(NaHCO3) 염 결정과 수용액 상의 아세트산(CH3COOH)이 접근합니다. 수용액 환경에서 아세트산 분자는 카복실기 수소 이온(H+) 해리를 개시하고 있습니다.",
        nodes: [
          // NaHCO3
          { id: "na_1", symbol: "Na", x: 20, y: 30, z: -10, color: "#A855F7", size: 1.4 },
          { id: "h_1", symbol: "H", x: 15, y: 45, z: 10, color: "#FFFFFF", size: 0.9 },
          { id: "c_1", symbol: "C", x: 25, y: 45, z: 0, color: "#475569", size: 1.2 },
          { id: "o_1", symbol: "O", x: 25, y: 60, z: -15, color: "#EF4444", size: 1.1 },
          { id: "o_2", symbol: "O", x: 38, y: 40, z: 10, color: "#EF4444", size: 1.1 },
          { id: "o_3", symbol: "O", x: 12, y: 35, z: -5, color: "#EF4444", size: 1.1 },
          // CH3COOH
          { id: "c_2", symbol: "C", x: 65, y: 55, z: 15, color: "#475569", size: 1.2 },
          { id: "h_2", symbol: "H", x: 55, y: 50, z: 25, color: "#FFFFFF", size: 0.9 },
          { id: "h_3", symbol: "H", x: 70, y: 45, z: 10, color: "#FFFFFF", size: 0.9 },
          { id: "h_4", symbol: "H", x: 65, y: 65, z: 30, color: "#FFFFFF", size: 0.9 },
          { id: "c_3", symbol: "C", x: 80, y: 60, z: -5, color: "#475569", size: 1.2 },
          { id: "o_4", symbol: "O", x: 85, y: 50, z: -15, color: "#EF4444", size: 1.1 },
          { id: "o_5", symbol: "O", x: 85, y: 75, z: 5, color: "#EF4444", size: 1.1 },
          { id: "h_5", symbol: "H", x: 95, y: 75, z: 0, color: "#FFFFFF", size: 0.9 }
        ],
        links: [
          // NaHCO3 internal bonds
          { id: "l_na_o3", source: "na_1", target: "o_3", bondType: "coordination" },
          { id: "l_c1_o1", source: "c_1", target: "o_1", bondType: "double" },
          { id: "l_c1_o2", source: "c_1", target: "o_2", bondType: "single" },
          { id: "l_c1_o3", source: "c_1", target: "o_3", bondType: "single" },
          { id: "l_o2_h1", source: "o_2", target: "h_1", bondType: "single" },
          // CH3COOH internal
          { id: "l_c2_h2", source: "c_2", target: "h_2", bondType: "single" },
          { id: "l_c2_h3", source: "c_2", target: "h_3", bondType: "single" },
          { id: "l_c2_h4", source: "c_2", target: "h_4", bondType: "single" },
          { id: "l_c2_c3", source: "c_2", target: "c_3", bondType: "single" },
          { id: "l_c3_o4", source: "c_3", target: "o_4", bondType: "double" },
          { id: "l_c3_o5", source: "c_3", target: "o_5", bondType: "single" },
          { id: "l_o5_h5", source: "o_5", target: "h_5", bondType: "single" }
        ]
      },
      {
        phaseId: "intermediate",
        title: "활성화 장벽 및 전이 중간체 (Activated Intermediate)",
        description: "양성자(H+)가 아세트산에서 떨어져 탄산수소염 유래 산소 원자로 이동합니다. 결합 거리가 늘어나면서 탄산(H2CO3) 중간 구조와 불안정도가 극대화되는 전이 상태를 형성합니다.",
        nodes: [
          { id: "na_1", symbol: "Na", x: 25, y: 25, z: -5, color: "#A855F7", size: 1.4 },
          { id: "h_1", symbol: "H", x: 30, y: 55, z: 12, color: "#FFFFFF", size: 0.9 },
          { id: "c_1", symbol: "C", x: 40, y: 50, z: -2, color: "#475569", size: 1.2 },
          { id: "o_1", symbol: "O", x: 35, y: 65, z: -10, color: "#EF4444", size: 1.1 },
          { id: "o_2", symbol: "O", x: 50, y: 45, z: 12, color: "#EF4444", size: 1.1 },
          { id: "o_3", symbol: "O", x: 42, y: 35, z: -8, color: "#EF4444", size: 1.1 },
          { id: "h_5", symbol: "H", x: 45, y: 40, z: 5, color: "#FFFFFF", size: 0.9 },
          { id: "c_2", symbol: "C", x: 70, y: 50, z: 10, color: "#475569", size: 1.2 },
          { id: "h_2", symbol: "H", x: 62, y: 45, z: 20, color: "#FFFFFF", size: 0.9 },
          { id: "h_3", symbol: "H", x: 75, y: 40, z: 5, color: "#FFFFFF", size: 0.9 },
          { id: "h_4", symbol: "H", x: 72, y: 60, z: 22, color: "#FFFFFF", size: 0.9 },
          { id: "c_3", symbol: "C", x: 82, y: 55, z: -5, color: "#475569", size: 1.2 },
          { id: "o_4", symbol: "O", x: 86, y: 45, z: -15, color: "#EF4444", size: 1.1 },
          { id: "o_5", symbol: "O", x: 88, y: 68, z: 0, color: "#EF4444", size: 1.1 }
        ],
        links: [
          { id: "l_c1_o1", source: "c_1", target: "o_1", bondType: "double" },
          { id: "l_c1_o2", source: "c_1", target: "o_2", bondType: "single" },
          { id: "l_c1_o3", source: "c_1", target: "o_3", bondType: "single" },
          { id: "l_o2_h1", source: "o_2", target: "h_1", bondType: "single" },
          { id: "l_o3_h5", source: "o_3", target: "h_5", bondType: "coordination" }, 
          { id: "l_c2_h2", source: "c_2", target: "h_2", bondType: "single" },
          { id: "l_c2_h3", source: "c_2", target: "h_3", bondType: "single" },
          { id: "l_c2_h4", source: "c_2", target: "h_4", bondType: "single" },
          { id: "l_c2_c3", source: "c_2", target: "c_3", bondType: "single" },
          { id: "l_c3_o4", source: "c_3", target: "o_4", bondType: "double" },
          { id: "l_c3_o5", source: "c_3", target: "o_5", bondType: "single" },
          { id: "l_na_o4", source: "na_1", target: "o_4", bondType: "coordination" }
        ]
      },
      {
        phaseId: "product",
        title: "에너지 자가 안정 및 최종 생성물 (Products)",
        description: "탈양성자화된 아세트산염 음이온은 나트륨 이온과 이온쌍을 이루어 아세트산나트륨(CH3COONa)을 촉발합니다. 동시에 불안정한 탄산 분자는 자발적 탈수 메커니즘을 거쳐 물(H2O)과 이산화탄소(CO2) 가스로 완전히 분해 안정화됩니다.",
        nodes: [
          // CH3COONa
          { id: "na_1", symbol: "Na", x: 20, y: 30, z: -10, color: "#A855F7", size: 1.4 },
          { id: "o_5", symbol: "O", x: 30, y: 30, z: 0, color: "#EF4444", size: 1.1 },
          { id: "c_3", symbol: "C", x: 42, y: 35, z: 10, color: "#475569", size: 1.2 },
          { id: "o_4", symbol: "O", x: 45, y: 45, z: 20, color: "#EF4444", size: 1.1 },
          { id: "c_2", symbol: "C", x: 52, y: 25, z: 5, color: "#475569", size: 1.2 },
          { id: "h_2", symbol: "H", x: 48, y: 15, z: 10, color: "#FFFFFF", size: 0.9 },
          { id: "h_3", symbol: "H", x: 62, y: 25, z: 12, color: "#FFFFFF", size: 0.9 },
          { id: "h_4", symbol: "H", x: 54, y: 27, z: -5, color: "#FFFFFF", size: 0.9 },
          // H2O
          { id: "o_2", symbol: "O", x: 20, y: 70, z: 10, color: "#EF4444", size: 1.1 },
          { id: "h_1", symbol: "H", x: 12, y: 78, z: 20, color: "#FFFFFF", size: 0.9 },
          { id: "h_5", symbol: "H", x: 28, y: 78, z: 5, color: "#FFFFFF", size: 0.9 },
          // CO2
          { id: "c_1", symbol: "C", x: 75, y: 75, z: 0, color: "#475569", size: 1.2 },
          { id: "o_1", symbol: "O", x: 65, y: 70, z: -10, color: "#EF4444", size: 1.1 },
          { id: "o_3", symbol: "O", x: 85, y: 80, z: 10, color: "#EF4444", size: 1.1 }
        ],
        links: [
          { id: "l_na_o5", source: "na_1", target: "o_5", bondType: "coordination" },
          { id: "l_c3_o5", source: "c_3", target: "o_5", bondType: "single" },
          { id: "l_c3_o4", source: "c_3", target: "o_4", bondType: "double" },
          { id: "l_c2_c3", source: "c_2", target: "c_3", bondType: "single" },
          { id: "l_c2_h2", source: "c_2", target: "h_2", bondType: "single" },
          { id: "l_c2_h3", source: "c_2", target: "h_3", bondType: "single" },
          { id: "l_c2_h4", source: "c_2", target: "h_4", bondType: "single" },
          { id: "l_o2_h1", source: "o_2", target: "h_1", bondType: "single" },
          { id: "l_o2_h5", source: "o_2", target: "h_5", bondType: "single" },
          { id: "l_c1_o1", source: "c_1", target: "o_1", bondType: "double" },
          { id: "l_c1_o3", source: "c_1", target: "o_3", bondType: "double" }
        ]
      }
    ]
  },
  "methane-combustion": {
    usedAI: false,
    validation: {
      isValidReaction: true,
      chemicalEquation: "CH₄ + 2O₂ ⟶ CO₂ + 2H₂O",
      potentialEnergy: [15, 85, 5],
      alternativeRecommendations: [
        { reactant: "NaHCO₃ + CH₃COOH", reason: "아세트산 염을 생성하며 탄산 가스가 기포화되는 흡열 기각의 대표적인 모범 산성-염기 반응입니다." }
      ]
    },
    phases: [
      {
        phaseId: "reactant",
        title: "연소 전 탄화수소 및 산소 격자 (Reactants)",
        description: "메탄 분자(CH4) 하나와 2개의 산소(O2) 분자가 고에너지 연소 반응을 위해 대각 접근합니다. 결합 부위가 완전한 비대칭 평형 구조를 이룹니다.",
        nodes: [
          // CH4
          { id: "c_1", symbol: "C", x: 25, y: 50, z: 0, color: "#475569", size: 1.2 },
          { id: "h_1", symbol: "H", x: 25, y: 30, z: 15, color: "#FFFFFF", size: 0.9 },
          { id: "h_2", symbol: "H", x: 10, y: 55, z: -10, color: "#FFFFFF", size: 0.9 },
          { id: "h_3", symbol: "H", x: 40, y: 55, z: -10, color: "#FFFFFF", size: 0.9 },
          { id: "h_4", symbol: "H", x: 25, y: 65, z: 15, color: "#FFFFFF", size: 0.9 },
          // O2 (pair 1)
          { id: "o_1", symbol: "O", x: 65, y: 30, z: -5, color: "#EF4444", size: 1.1 },
          { id: "o_2", symbol: "O", x: 80, y: 30, z: 10, color: "#EF4444", size: 1.1 },
          // O2 (pair 2)
          { id: "o_3", symbol: "O", x: 65, y: 70, z: 5, color: "#EF4444", size: 1.1 },
          { id: "o_4", symbol: "O", x: 80, y: 70, z: -10, color: "#EF4444", size: 1.1 }
        ],
        links: [
          { id: "l_c1_h1", source: "c_1", target: "h_1", bondType: "single" },
          { id: "l_c1_h2", source: "c_1", target: "h_2", bondType: "single" },
          { id: "l_c1_h3", source: "c_1", target: "h_3", bondType: "single" },
          { id: "l_c1_h4", source: "c_1", target: "h_4", bondType: "single" },
          { id: "l_o1_o2", source: "o_1", target: "o_2", bondType: "double" },
          { id: "l_o3_o4", source: "o_3", target: "o_4", bondType: "double" }
        ]
      },
      {
        phaseId: "intermediate",
        title: "라디칼 전이 구조 및 배위 상태 (Radical Transition State)",
        description: "점화 열(Activation Energy)에 의해 이중 O=O 결합과 C-H 단일 결합이 자발적으로 균열 분열되며, 메탄 유래 탄소 원자 주위로 산소 원자와 해리 도약 중인 양성자들의 일시적 중간 결합 장벽이 형성됩니다.",
        nodes: [
          { id: "c_1", symbol: "C", x: 45, y: 50, z: 2, color: "#475569", size: 1.2 },
          { id: "h_1", symbol: "H", x: 38, y: 32, z: 18, color: "#FFFFFF", size: 0.9 },
          { id: "h_2", symbol: "H", x: 25, y: 52, z: -8, color: "#FFFFFF", size: 0.9 },
          { id: "h_3", symbol: "H", x: 65, y: 48, z: -8, color: "#FFFFFF", size: 0.9 },
          { id: "h_4", symbol: "H", x: 48, y: 68, z: 20, color: "#FFFFFF", size: 0.9 },
          { id: "o_1", symbol: "O", x: 55, y: 30, z: -8, color: "#EF4444", size: 1.1 },
          { id: "o_2", symbol: "O", x: 75, y: 34, z: 8, color: "#EF4444", size: 1.1 },
          { id: "o_3", symbol: "O", x: 52, y: 70, z: 8, color: "#EF4444", size: 1.1 },
          { id: "o_4", symbol: "O", x: 74, y: 66, z: -8, color: "#EF4444", size: 1.1 }
        ],
        links: [
          { id: "l_c1_h2", source: "c_1", target: "h_2", bondType: "single" },
          { id: "l_c1_h4", source: "c_1", target: "h_4", bondType: "single" },
          { id: "l_c1_o1", source: "c_1", target: "o_1", bondType: "coordination" },
          { id: "l_c1_o3", source: "c_1", target: "o_3", bondType: "coordination" },
          { id: "l_o2_h1", source: "o_2", target: "h_1", bondType: "coordination" },
          { id: "l_o4_h3", source: "o_4", target: "h_3", bondType: "coordination" }
        ]
      },
      {
        phaseId: "product",
        title: "이산화탄소와 수증기 분할 배열 (Products)",
        description: "안정한 선형 결합구조를 지닌 이산화탄소(CO2) 분자 하나와 구부러진 극성 결합의 물(H2O) 분자 2개가 다량의 반응열을 방출한 채 완벽하게 형성되었습니다.",
        nodes: [
          // CO2
          { id: "c_1", symbol: "C", x: 50, y: 50, z: 0, color: "#475569", size: 1.2 },
          { id: "o_1", symbol: "O", x: 32, y: 50, z: -8, color: "#EF4444", size: 1.1 },
          { id: "o_3", symbol: "O", x: 68, y: 50, z: 8, color: "#EF4444", size: 1.1 },
          // H2O (1)
          { id: "o_2", symbol: "O", x: 20, y: 25, z: 12, color: "#EF4444", size: 1.1 },
          { id: "h_1", symbol: "H", x: 10, y: 15, z: 22, color: "#FFFFFF", size: 0.9 },
          { id: "h_2", symbol: "H", x: 15, y: 38, z: 2, color: "#FFFFFF", size: 0.9 },
          // H2O (2)
          { id: "o_4", symbol: "O", x: 80, y: 75, z: -10, color: "#EF4444", size: 1.1 },
          { id: "h_3", symbol: "H", x: 75, y: 62, z: -2, color: "#FFFFFF", size: 0.9 },
          { id: "h_4", symbol: "H", x: 90, y: 82, z: -18, color: "#FFFFFF", size: 0.9 }
        ],
        links: [
          { id: "l_c1_o1", source: "c_1", target: "o_1", bondType: "double" },
          { id: "l_c1_o3", source: "c_1", target: "o_3", bondType: "double" },
          { id: "l_o2_h1", source: "o_2", target: "h_1", bondType: "single" },
          { id: "l_o2_h2", source: "o_2", target: "h_2", bondType: "single" },
          { id: "l_o4_h3", source: "o_4", target: "h_3", bondType: "single" },
          { id: "l_o4_h4", source: "o_4", target: "h_4", bondType: "single" }
        ]
      }
    ]
  },
  "hcl-naoh": {
    usedAI: false,
    validation: {
      isValidReaction: true,
      chemicalEquation: "HCl + NaOH ⟶ NaCl + H₂O",
      potentialEnergy: [10, 65, 5],
      alternativeRecommendations: [
        { reactant: "AgNO₃ + NaCl", reason: "극적인 이온 교환을 통한 염화은(AgCl) 고체 결정 형성을 눈으로 확인할 수 있는 백색 침전 반응성 최고 대표 모델입니다." }
      ]
    },
    phases: [
      {
        phaseId: "reactant",
        title: "초기 극성 전해 분리 (Reactants)",
        description: "염화이온과 수소이온이 결합된 염산(HCl)과 나트륨 양이온 및 수산화 음이온이 이온 해리 직전 상태로 대향하고 있습니다.",
        nodes: [
          // HCl
          { id: "h_1", symbol: "H", x: 25, y: 40, z: 0, color: "#FFFFFF", size: 0.9 },
          { id: "cl_1", symbol: "Cl", x: 15, y: 40, z: 10, color: "#22C55E", size: 1.3 },
          // NaOH
          { id: "na_1", symbol: "Na", x: 75, y: 40, z: -10, color: "#A855F7", size: 1.4 },
          { id: "o_1", symbol: "O", x: 85, y: 50, z: 5, color: "#EF4444", size: 1.1 },
          { id: "h_2", symbol: "H", x: 92, y: 45, z: 5, color: "#FFFFFF", size: 0.9 }
        ],
        links: [
          { id: "l_cl1_h1", source: "cl_1", target: "h_1", bondType: "single" },
          { id: "l_na1_o1", source: "na_1", target: "o_1", bondType: "coordination" },
          { id: "l_o1_h2", source: "o_1", target: "h_2", bondType: "single" }
        ]
      },
      {
        phaseId: "intermediate",
        title: "중화 열 촉발 전이계 (Neutralization High-Energy Intermediate)",
        description: "해리된 수소 양이온(H+)과 수산화 이온(OH-)이 강한 정전기력 인력에 이끌려 조밀하게 합쳐지기 시작하는 에너지 활성화 장벽 구간입니다.",
        nodes: [
          { id: "cl_1", symbol: "Cl", x: 20, y: 45, z: 5, color: "#22C55E", size: 1.3 },
          { id: "h_1", symbol: "H", x: 45, y: 48, z: 5, color: "#FFFFFF", size: 0.9 },
          { id: "o_1", symbol: "O", x: 55, y: 52, z: -5, color: "#EF4444", size: 1.1 },
          { id: "h_2", symbol: "H", x: 62, y: 45, z: -5, color: "#FFFFFF", size: 0.9 },
          { id: "na_1", symbol: "Na", x: 80, y: 50, z: -8, color: "#A855F7", size: 1.4 }
        ],
        links: [
          { id: "l_cl_h1", source: "cl_1", target: "h_1", bondType: "coordination" },
          { id: "l_h1_o1", source: "h_1", target: "o_1", bondType: "coordination" },
          { id: "l_o1_h2", source: "o_1", target: "h_2", bondType: "single" },
          { id: "l_na1_o1", source: "na_1", target: "o_1", bondType: "coordination" }
        ]
      },
      {
        phaseId: "product",
        title: "해리된 식탁 염 결정과 물 (Products)",
        description: "강한 에너지 포텐셜 낙하 후 매우 안정한 수계 환경의 물(H2O)과 해리 또는 결정 상태의 이온쌍 전해염(NaCl)이 완벽하게 정리 배열되었습니다.",
        nodes: [
          // H2O
          { id: "o_1", symbol: "O", x: 50, y: 50, z: 0, color: "#EF4444", size: 1.1 },
          { id: "h_1", symbol: "H", x: 38, y: 55, z: 8, color: "#FFFFFF", size: 0.9 },
          { id: "h_2", symbol: "H", x: 62, y: 55, z: -8, color: "#FFFFFF", size: 0.9 },
          // Na + Cl salt pair
          { id: "na_1", symbol: "Na", x: 20, y: 25, z: -10, color: "#A855F7", size: 1.4 },
          { id: "cl_1", symbol: "Cl", x: 80, y: 25, z: 10, color: "#22C55E", size: 1.3 }
        ],
        links: [
          { id: "l_o1_h1", source: "o_1", target: "h_1", bondType: "single" },
          { id: "l_o1_h2", source: "o_1", target: "h_2", bondType: "single" },
          { id: "l_na1_cl1", source: "na_1", target: "cl_1", bondType: "coordination" }
        ]
      }
    ]
  },
  "propane-combustion": {
    usedAI: false,
    validation: {
      isValidReaction: true,
      chemicalEquation: "C₃H₈ + 5O₂ ⟶ 3CO₂ + 4H₂O",
      potentialEnergy: [12, 90, 3],
      alternativeRecommendations: [
        { reactant: "CH₄ + O₂", reason: "조금 더 경량화된 구조에서 급격하게 진행되는 탄화수소 연소 활성화 작용 모델입니다." }
      ]
    },
    phases: [
      {
        phaseId: "reactant",
        title: "연소 전 탄소수소 사슬 격자 및 조밀 산소계 (Reactants)",
        description: "프로판(C3H8) 사슬 모델 하나와 5개의 산소(O2) 연소 조력 분자 쌍이 고에너지 연소 반응을 수행하기 위해 임계점에 도달합니다.",
        nodes: [
          { id: "c_1", symbol: "C", x: 10, y: 35, z: 0, color: "#475569", size: 1.2 },
          { id: "c_2", symbol: "C", x: 25, y: 35, z: 5, color: "#475569", size: 1.2 },
          { id: "c_3", symbol: "C", x: 40, y: 35, z: 0, color: "#475569", size: 1.2 },
          { id: "h_1", symbol: "H", x: 5, y: 20, z: -5, color: "#FFFFFF", size: 0.9 },
          { id: "h_2", symbol: "H", x: 5, y: 50, z: 5, color: "#FFFFFF", size: 0.9 },
          { id: "h_3", symbol: "H", x: 10, y: 35, z: -15, color: "#FFFFFF", size: 0.9 },
          { id: "h_4", symbol: "H", x: 25, y: 20, z: 15, color: "#FFFFFF", size: 0.9 },
          { id: "h_5", symbol: "H", x: 25, y: 50, z: -10, color: "#FFFFFF", size: 0.9 },
          { id: "h_6", symbol: "H", x: 45, y: 20, z: -5, color: "#FFFFFF", size: 0.9 },
          { id: "h_7", symbol: "H", x: 45, y: 50, z: 5, color: "#FFFFFF", size: 0.9 },
          { id: "h_8", symbol: "H", x: 40, y: 35, z: 15, color: "#FFFFFF", size: 0.9 },
          { id: "o_1", symbol: "O", x: 60, y: 20, z: 0, color: "#EF4444", size: 1.1 },
          { id: "o_2", symbol: "O", x: 75, y: 20, z: 5, color: "#EF4444", size: 1.1 },
          { id: "o_3", symbol: "O", x: 60, y: 50, z: -15, color: "#EF4444", size: 1.1 },
          { id: "o_4", symbol: "O", x: 75, y: 50, z: -10, color: "#EF4444", size: 1.1 },
          { id: "o_5", symbol: "O", x: 60, y: 80, z: 10, color: "#EF4444", size: 1.1 },
          { id: "o_6", symbol: "O", x: 75, y: 80, z: 15, color: "#EF4444", size: 1.1 },
          { id: "o_7", symbol: "O", x: 80, y: 25, z: -15, color: "#EF4444", size: 1.1 },
          { id: "o_8", symbol: "O", x: 95, y: 25, z: -10, color: "#EF4444", size: 1.1 },
          { id: "o_9", symbol: "O", x: 80, y: 70, z: -5, color: "#EF4444", size: 1.1 },
          { id: "o_10", symbol: "O", x: 95, y: 70, z: 5, color: "#EF4444", size: 1.1 }
        ],
        links: [
          { id: "l_c1_c2", source: "c_1", target: "c_2", bondType: "single" },
          { id: "l_c2_c3", source: "c_2", target: "c_3", bondType: "single" },
          { id: "l_c1_h1", source: "c_1", target: "h_1", bondType: "single" },
          { id: "l_c1_h2", source: "c_1", target: "h_2", bondType: "single" },
          { id: "l_c1_h3", source: "c_1", target: "h_3", bondType: "single" },
          { id: "l_c2_h4", source: "c_2", target: "h_4", bondType: "single" },
          { id: "l_c2_h5", source: "c_2", target: "h_5", bondType: "single" },
          { id: "l_c3_h6", source: "c_3", target: "h_6", bondType: "single" },
          { id: "l_c3_h7", source: "c_3", target: "h_7", bondType: "single" },
          { id: "l_c3_h8", source: "c_3", target: "h_8", bondType: "single" },
          { id: "l_o1_o2", source: "o_1", target: "o_2", bondType: "double" },
          { id: "l_o3_o4", source: "o_3", target: "o_4", bondType: "double" },
          { id: "l_o5_o6", source: "o_5", target: "o_6", bondType: "double" },
          { id: "l_o7_o8", source: "o_7", target: "o_8", bondType: "double" },
          { id: "l_o9_o10", source: "o_9", target: "o_10", bondType: "double" }
        ]
      },
      {
        phaseId: "intermediate",
        title: "탄화수소 균열 라디칼 격자 수렴 구간 (Activated Intermediate)",
        description: "점화에 의해 프로판 사슬의 C-C 단일결합과 C-H 결합들이 일시에 벌어지며, 무수한 산소 음이온들과의 역동적 전하 공유 상태를 돌입합니다.",
        nodes: [
          { id: "c_1", symbol: "C", x: 25, y: 40, z: 5, color: "#475569", size: 1.2 },
          { id: "c_2", symbol: "C", x: 45, y: 45, z: -5, color: "#475569", size: 1.2 },
          { id: "c_3", symbol: "C", x: 65, y: 40, z: 10, color: "#475569", size: 1.2 },
          { id: "h_1", symbol: "H", x: 18, y: 25, z: 0, color: "#FFFFFF", size: 0.9 },
          { id: "h_2", symbol: "H", x: 20, y: 55, z: 10, color: "#FFFFFF", size: 0.9 },
          { id: "h_3", symbol: "H", x: 15, y: 40, z: -10, color: "#FFFFFF", size: 0.9 },
          { id: "h_4", symbol: "H", x: 38, y: 25, z: 10, color: "#FFFFFF", size: 0.9 },
          { id: "h_5", symbol: "H", x: 40, y: 60, z: -8, color: "#FFFFFF", size: 0.9 },
          { id: "h_6", symbol: "H", x: 55, y: 22, z: 5, color: "#FFFFFF", size: 0.9 },
          { id: "h_7", symbol: "H", x: 62, y: 52, z: 15, color: "#FFFFFF", size: 0.9 },
          { id: "h_8", symbol: "H", x: 72, y: 35, z: 5, color: "#FFFFFF", size: 0.9 },
          { id: "o_1", symbol: "O", x: 30, y: 22, z: -5, color: "#EF4444", size: 1.1 },
          { id: "o_2", symbol: "O", x: 35, y: 58, z: 15, color: "#EF4444", size: 1.1 },
          { id: "o_3", symbol: "O", x: 50, y: 20, z: -12, color: "#EF4444", size: 1.1 },
          { id: "o_4", symbol: "O", x: 55, y: 62, z: -8, color: "#EF4444", size: 1.1 },
          { id: "o_5", symbol: "O", x: 70, y: 20, z: 12, color: "#EF4444", size: 1.1 },
          { id: "o_6", symbol: "O", x: 72, y: 62, z: 8, color: "#EF4444", size: 1.1 },
          { id: "o_7", symbol: "O", x: 12, y: 30, z: 8, color: "#EF4444", size: 1.1 },
          { id: "o_8", symbol: "O", x: 80, y: 30, z: -8, color: "#EF4444", size: 1.1 },
          { id: "o_9", symbol: "O", x: 42, y: 33, z: 8, color: "#EF4444", size: 1.1 },
          { id: "o_10", symbol: "O", x: 85, y: 55, z: -5, color: "#EF4444", size: 1.1 }
        ],
        links: [
          { id: "l_c1_c2_d", source: "c_1", target: "c_2", bondType: "coordination" },
          { id: "l_c2_c3_d", source: "c_2", target: "c_3", bondType: "coordination" },
          { id: "l_c1_o1_d", source: "c_1", target: "o_1", bondType: "coordination" },
          { id: "l_c2_o3_d", source: "c_2", target: "o_3", bondType: "coordination" },
          { id: "l_c3_o5_d", source: "c_3", target: "o_5", bondType: "coordination" },
          { id: "l_o2_h1_d", source: "o_2", target: "h_1", bondType: "coordination" },
          { id: "l_o4_h4_d", source: "o_4", target: "h_4", bondType: "coordination" }
        ]
      },
      {
        phaseId: "product",
        title: "이산화탄소 3분자 및 수증기 4분자 자가 평형 (Products)",
        description: "최고 활성화 에너지를 넘어 극도의 열에너지를 동반한 채 CO2 3분자와 H2O 4분자가 높은 무질서도의 안정한 완전 연소 생성계로 정립되었습니다.",
        nodes: [
          { id: "c_1", symbol: "C", x: 15, y: 25, z: 0, color: "#475569", size: 1.2 },
          { id: "o_1", symbol: "O", x: 5, y: 20, z: -5, color: "#EF4444", size: 1.1 },
          { id: "o_2", symbol: "O", x: 25, y: 30, z: 5, color: "#EF4444", size: 1.1 },
          { id: "c_2", symbol: "C", x: 50, y: 25, z: 10, color: "#475569", size: 1.2 },
          { id: "o_3", symbol: "O", x: 40, y: 20, z: 5, color: "#EF4444", size: 1.1 },
          { id: "o_4", symbol: "O", x: 60, y: 30, z: 15, color: "#EF4444", size: 1.1 },
          { id: "c_3", symbol: "C", x: 85, y: 25, z: -5, color: "#475569", size: 1.2 },
          { id: "o_5", symbol: "O", x: 75, y: 20, z: -10, color: "#EF4444", size: 1.1 },
          { id: "o_6", symbol: "O", x: 95, y: 30, z: 0, color: "#EF4444", size: 1.1 },
          { id: "o_7", symbol: "O", x: 15, y: 70, z: 10, color: "#EF4444", size: 1.1 },
          { id: "h_1", symbol: "H", x: 8, y: 78, z: 15, color: "#FFFFFF", size: 0.9 },
          { id: "h_2", symbol: "H", x: 22, y: 78, z: 5, color: "#FFFFFF", size: 0.9 },
          { id: "o_8", symbol: "O", x: 40, y: 70, z: -10, color: "#EF4444", size: 1.1 },
          { id: "h_3", symbol: "H", x: 33, y: 78, z: -15, color: "#FFFFFF", size: 0.9 },
          { id: "h_4", symbol: "H", x: 47, y: 78, z: -5, color: "#FFFFFF", size: 0.9 },
          { id: "o_9", symbol: "O", x: 65, y: 70, z: 15, color: "#EF4444", size: 1.1 },
          { id: "h_5", symbol: "H", x: 58, y: 78, z: 20, color: "#FFFFFF", size: 0.9 },
          { id: "h_6", symbol: "H", x: 72, y: 78, z: 10, color: "#FFFFFF", size: 0.9 },
          { id: "o_10", symbol: "O", x: 90, y: 70, z: -5, color: "#EF4444", size: 1.1 },
          { id: "h_7", symbol: "H", x: 83, y: 78, z: -10, color: "#FFFFFF", size: 0.9 },
          { id: "h_8", symbol: "H", x: 97, y: 78, z: 0, color: "#FFFFFF", size: 0.9 }
        ],
        links: [
          { id: "l_c1_o1", source: "c_1", target: "o_1", bondType: "double" },
          { id: "l_c1_o2", source: "c_1", target: "o_2", bondType: "double" },
          { id: "l_c2_o3", source: "c_2", target: "o_3", bondType: "double" },
          { id: "l_c2_o4", source: "c_2", target: "o_4", bondType: "double" },
          { id: "l_c3_o5", source: "c_3", target: "o_5", bondType: "double" },
          { id: "l_c3_o6", source: "c_3", target: "o_6", bondType: "double" },
          { id: "l_o7_h1", source: "o_7", target: "h_1", bondType: "single" },
          { id: "l_o7_h2", source: "o_7", target: "h_2", bondType: "single" },
          { id: "l_o8_h3", source: "o_8", target: "h_3", bondType: "single" },
          { id: "l_o8_h4", source: "o_8", target: "h_4", bondType: "single" },
          { id: "l_o9_h5", source: "o_9", target: "h_5", bondType: "single" },
          { id: "l_o9_h6", source: "o_9", target: "h_6", bondType: "single" },
          { id: "l_o10_h7", source: "o_10", target: "h_7", bondType: "single" },
          { id: "l_o10_h8", source: "o_10", target: "h_8", bondType: "single" }
        ]
      }
    ]
  }
};

export function matchLocalPreset(reactants: string): string | null {
  const norm = reactants.toLowerCase().trim().replace(/[\s+]+/g, "");
  if (norm.includes("nahco3") || norm.includes("baking") || norm.includes("vinegar") || norm.includes("cooh") || norm.includes("식초") || norm.includes("베이킹")) {
    return "baking-soda-vinegar";
  }
  if (norm.includes("ch4") || norm.includes("methane") || norm.includes("methan") || norm.includes("메탄") || norm.includes("연소")) {
    if (norm.includes("c3h8") || norm.includes("propane") || norm.includes("프로판")) {
      return "propane-combustion";
    }
    return "methane-combustion";
  }
  if (norm.includes("c3h8") || norm.includes("propane") || norm.includes("프로판")) {
    return "propane-combustion";
  }
  if (norm.includes("hcl") || norm.includes("naoh") || norm.includes("염산") || norm.includes("수산화")) {
    return "hcl-naoh";
  }
  return null;
}

export function generateDynamicFallback(input: string): SimulationResponse {
  const norm = input.toLowerCase().replace(/[\s+]+/g, "");
  
  let chemicalEquation = `${input} ⟶ 분자식 재배열 화합체`;
  let isValidReaction = true;
  let potentialEnergy = [25, 75, 12];
  let descriptionReactant = `'${input}' 화학 기질들이 반응 전계에 주입되었습니다. 구성 원자들이 기하학적 대칭을 이루며 접근하고 있습니다.`;
  let descriptionIntermediate = "격자 충돌 에너지 장벽 최고조 상태입니다. C-H 또는 산-염기 극성 수소 결합의 일시적 균열과 교배 배위 결합이 복합적으로 공존합니다.";
  let descriptionProduct = "열역학적 전위 에너지 급락 후 한결 안정하고 새로운 단원소·다원소 분자식 네트워크로 완벽히 정립 보존되었습니다.";

  if (norm.includes("hcl") && norm.includes("naoh")) {
    chemicalEquation = "HCl + NaOH ⟶ NaCl + H₂O";
    potentialEnergy = [10, 65, 5];
  } else if (norm.includes("ch4") && norm.includes("o2")) {
    chemicalEquation = "CH₄ + 2O₂ ⟶ CO₂ + 2H₂O";
    potentialEnergy = [15, 85, 5];
  } else if ((norm.includes("c3h8") || norm.includes("propane") || norm.includes("프로판")) && norm.includes("o2")) {
    chemicalEquation = "C₃H₈ + 5O₂ ⟶ 3CO₂ + 4H₂O";
    potentialEnergy = [12, 90, 3];
  } else if (norm.includes("nahco3") && norm.includes("cooh")) {
    chemicalEquation = "NaHCO₃ + CH₃COOH ⟶ CH₃COONa + H₂O + CO₂";
    potentialEnergy = [20, 75, 10];
  } else {
    if (norm.length < 3 || (!norm.includes("o") && !norm.includes("h") && !norm.includes("cl") && !norm.includes("c"))) {
      isValidReaction = false;
      chemicalEquation = `${input} ↛ 단순 물리적 가중치 분산`;
      potentialEnergy = [30, 42, 30];
      descriptionReactant = `'${input}' 성분들이 단순히 혼합되었습니다. 결합 교환에 필요한 반응 장벽 에너지가 결여되어 분자 상태를 정적으로 유지합니다.`;
      descriptionIntermediate = "열 진동이 가속화되며 원자들이 미미하게 교란 운동하나, 안정한 중간 전이 상태를 촉발하기엔 극성 에너지가 부족합니다.";
      descriptionProduct = "화학적 공유 전이 및 환원 결합을 달성하지 못한 채, 정적 열분산 분산계 안정화 평형에 도착했습니다.";
    }
  }

  const symbolsMatched = input.match(/[A-Z][a-z]*/g) || ["C", "H", "O"];
  let atomSymbols: string[] = [...symbolsMatched];

  if (atomSymbols.length < 5) {
    atomSymbols = [...atomSymbols, "H", "O", "C", "H"];
  }
  if (atomSymbols.length > 12) {
    atomSymbols = atomSymbols.slice(0, 12);
  }

  const cpks: { [key: string]: string } = {
    "H": "#FFFFFF", "C": "#475569", "O": "#EF4444", "N": "#3B82F6",
    "Na": "#A855F7", "Cl": "#22C55E", "S": "#EAB308", "K": "#D946EF",
    "Ag": "#94A3B8", "Fe": "#B8C2CC", "Cu": "#F59E0B"
  };

  const sizes: { [key: string]: number } = {
    "H": 0.85, "C": 1.25, "O": 1.15, "N": 1.15,
    "Na": 1.45, "Cl": 1.35, "S": 1.25, "K": 1.45,
    "Ag": 1.35, "Fe": 1.35, "Cu": 1.35
  };

  const nAtoms = atomSymbols.length;
  const half = Math.floor(nAtoms / 2);

  const reactantNodes: ElementNode[] = [];
  const productNodes: ElementNode[] = [];
  const intermediateNodes: ElementNode[] = [];

  for (let i = 0; i < nAtoms; i++) {
    const symbol = atomSymbols[i];
    const color = cpks[symbol] || "#06B6D4";
    const size = sizes[symbol] || 1.1;
    const id = `da_${i}`;

    let rx = 0, ry = 0, rz = 0;
    if (i < half) {
      const angle = (i * 2 * Math.PI) / half;
      rx = 25 + Math.cos(angle) * 12;
      ry = 45 + Math.sin(angle) * 12;
      rz = -5 + Math.sin(angle * 2) * 5;
    } else {
      const angle = ((i - half) * 2 * Math.PI) / (nAtoms - half);
      rx = 75 + Math.cos(angle) * 12;
      ry = 55 + Math.sin(angle) * 12;
      rz = 5 + Math.cos(angle * 2) * 5;
    }

    let px = 0, py = 0, pz = 0;
    if (!isValidReaction) {
      px = rx + (Math.sin(i * 3) * 4);
      py = ry + (Math.cos(i * 3) * 4);
      pz = rz + (Math.sin(i * 1.5) * 3);
    } else {
      if (i % 2 === 0) {
        const angle = (i * 2 * Math.PI) / nAtoms;
        px = 50 + Math.cos(angle) * 10;
        py = 48 + Math.sin(angle) * 10;
        pz = Math.sin(angle * 3) * 5;
      } else {
        if (i < half) {
          px = 22 + (i * 4);
          py = 75 + (Math.sin(i) * 5);
          pz = 15;
        } else {
          px = 82 - ((i - half) * 4);
          py = 25 + (Math.cos(i) * 5);
          pz = -15;
        }
      }
    }

    const ix = (rx + px) / 2 + Math.cos(i * 1.5) * 6;
    const iy = (ry + py) / 2 + Math.sin(i * 1.5) * 6;
    const iz = (rz + pz) / 2 + Math.sin(i * 3) * 4;

    reactantNodes.push({ id, symbol, x: rx, y: ry, z: rz, color, size });
    intermediateNodes.push({ id, symbol, x: ix, y: iy, z: iz, color, size });
    productNodes.push({ id, symbol, x: px, y: py, z: pz, color, size });
  }

  const reactantLinks: ChemicalLink[] = [];
  const intermediateLinks: ChemicalLink[] = [];
  const productLinks: ChemicalLink[] = [];

  for (let i = 0; i < nAtoms; i++) {
    const id = `l_da_${i}`;
    if (i < half - 1) {
      reactantLinks.push({ id, source: `da_${i}`, target: `da_${i + 1}`, bondType: "single" });
    } else if (i === half - 1 && half > 2) {
      reactantLinks.push({ id, source: `da_${i}`, target: `da_0`, bondType: "double" });
    } else if (i >= half && i < nAtoms - 1) {
      reactantLinks.push({ id, source: `da_${i}`, target: `da_${i + 1}`, bondType: "single" });
    } else if (i === nAtoms - 1 && (nAtoms - half) > 2) {
      reactantLinks.push({ id, source: `da_${i}`, target: `da_${half}`, bondType: "double" });
    }
  }

  for (let i = 0; i < nAtoms; i++) {
    const id = `il_da_${i}`;
    intermediateLinks.push({
      id,
      source: `da_${i}`,
      target: `da_${(i + 1) % nAtoms}`,
      bondType: "coordination"
    });
  }

  if (!isValidReaction) {
    reactantLinks.forEach((link, idx) => {
      productLinks.push({ ...link, id: `pl_da_${idx}` });
    });
  } else {
    for (let i = 0; i < nAtoms; i++) {
      const id = `pl_da_${i}`;
      if (i % 2 === 0) {
        const nextEven = (i + 2) < nAtoms ? i + 2 : (i + 2) % 2 === 0 ? 0 : 2;
        productLinks.push({ id, source: `da_${i}`, target: `da_${nextEven}`, bondType: "double" });
      } else {
        const nextOdd = (i + 2) < nAtoms ? i + 2 : 1;
        productLinks.push({ id, source: `da_${i}`, target: `da_${nextOdd}`, bondType: "single" });
      }
    }
  }

  return {
    usedAI: false,
    validation: {
      isValidReaction,
      chemicalEquation,
      potentialEnergy,
      alternativeRecommendations: [
        { reactant: "NaHCO₃ + CH₃COOH", reason: "이산화탄소 가스가 격하게 전이되어 고도 팽창 거품을 완수하는 탄산염 교과서 반응입니다." },
        { reactant: "CH₄ + O₂", reason: "강렬한 수소 폭발 결합 격자를 눈으로 투영해 볼 수 있는 탄화수소 연소 표준 방정식입니다." },
        { reactant: "HCl + NaOH", reason: "수용핵 전하 밸런스가 한결 유려하게 낙하하여 소금 결정을 정립 보완해 내는 중화 반응입니다." }
      ]
    },
    phases: [
      {
        phaseId: "reactant",
        title: "화학 반응물 기질 정렬 (Reactants)",
        description: descriptionReactant,
        nodes: reactantNodes,
        links: reactantLinks
      },
      {
        phaseId: "intermediate",
        title: "전이 상태 및 활성화 배위 장벽 (Transition Lattice Complex)",
        description: descriptionIntermediate,
        nodes: intermediateNodes,
        links: intermediateLinks
      },
      {
        phaseId: "product",
        title: "기하 자가 안정 생성물 정립 (Products)",
        description: descriptionProduct,
        nodes: productNodes,
        links: productLinks
      }
    ]
  };
}
