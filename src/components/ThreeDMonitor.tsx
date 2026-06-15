/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ElementNode, ChemicalLink, SimulationPhase } from "../types";
import { Rotate3d, Compass, Maximize2, ShieldAlert, Play, Pause, ZoomIn, ZoomOut, LayoutGrid, Layers } from "lucide-react";

interface AtomHoverDetails {
  name: string;
  config: string;
  valence: string;
  stateExplanation: string;
  chargeIndicator?: string;
}

const getCPKColor = (symbol: string): string => {
  switch (symbol) {
    case "H": return "#FFFFFF";
    case "C": return "#475569";
    case "O": return "#EF4444";
    case "N": return "#3B82F6";
    case "Na": return "#A855F7";
    case "Cl": return "#22C55E";
    case "Mg": return "#A8A29E";
    case "Ag": return "#94A3B8";
    case "Ca": return "#10B981";
    case "Fe": return "#EA580C";
    case "Cu": return "#06B6D4";
    case "Vb": return "#818CF8";
    default: return "#94A3B8";
  }
};

const getAtomSpecsByPhase = (symbol: string, phase: "reactant" | "intermediate" | "product"): AtomHoverDetails => {
  let name = "";
  let config = "";
  let valence = "";
  let stateExplanation = "";
  let chargeIndicator = "";

  switch (symbol) {
    case "H":
      name = "수소 (H)";
      config = "1s¹";
      if (phase === "reactant") {
        valence = "공유 원자가: 1";
        stateExplanation = "기저 상태. 강하게 공존하는 아세트산 수소에 포획 결합되어 있음.";
        chargeIndicator = "δ+ 부분 전하";
      } else if (phase === "intermediate") {
        valence = "전이 탈리 양성자화";
        stateExplanation = "고열 분해 전이구조 내 극성 오비탈 간섭 및 양성자 이동 중.";
        chargeIndicator = "동적 전하 요동";
      } else {
        valence = "공유 원자가: 1";
        stateExplanation = "환원 평형 상태. 최종 물/수증기 결합 기하 안착.";
        chargeIndicator = "δ+ 대칭 분극";
      }
      break;

    case "C":
      name = "탄소 (C)";
      config = "[He] 2s² 2p²";
      if (phase === "reactant") {
        valence = "공유 원자가: 4";
        stateExplanation = "sp³ 하이브리드 탄소 고리 사슬의 정밀한 삼각/사면체 분극 골격.";
        chargeIndicator = "완전 배위 무극성 골격";
      } else if (phase === "intermediate") {
        valence = "전이상태 탄소 라디칼";
        stateExplanation = "결합 오비탈 균열로 배위 각도가 수시로 바뀌며 활성화 장벽 최고점 통과.";
        chargeIndicator = "불포화 일시 전극 편향";
      } else {
        valence = "공유 원자가: 4";
        stateExplanation = "극도로 안정화된 완전 분해 생성물(CO₂ 등)의 sp 배형 대칭성 정렬.";
        chargeIndicator = "대칭 구핵 결합수";
      }
      break;

    case "O":
      name = "산소 (O)";
      config = "[He] 2s² 2p⁴";
      if (phase === "reactant") {
        valence = "공유 원자가: 2";
        stateExplanation = "2세대 p-구역의 풍부한 자유 음전하 결합 쌍 배치.";
        chargeIndicator = "δ- 강한 구극성 편향";
      } else if (phase === "intermediate") {
        valence = "친핵성 극대 반응장 유동";
        stateExplanation = "인접 유리 양성자 해리를 강한 정전기력으로 끌어당겨 가역적 결합 시도.";
        chargeIndicator = "음이온 라디칼 중심";
      } else {
        valence = "공유 원자가: 2";
        stateExplanation = "가장 완벽한 8전자 옥텟 규칙 수성 및 대각 전하 평형 도달.";
        chargeIndicator = "δ- 완벽 평형 배위";
      }
      break;

    case "N":
      name = "질소 (N)";
      config = "[He] 2s² 2p³";
      if (phase === "reactant") {
        valence = "공유 원자가: 3";
        stateExplanation = "안정화 최외외각 혼성 배위 형태의 전자에 포진.";
        chargeIndicator = "약한 정전 수렴";
      } else if (phase === "intermediate") {
        valence = "비공유 분산 결합 해리";
        stateExplanation = "전이상태 촉매 매커니즘 간 극성화 유도 결합 활성화 관장.";
        chargeIndicator = "가역 전하 매개체";
      } else {
        valence = "공유 원자가: 3";
        stateExplanation = "분기 결합 에너지가 완전히 상쇄된 질화 오비탈 바닥 안착.";
        chargeIndicator = "완벽 배인 평형";
      }
      break;

    case "Na":
      name = "나트륨 (Na)";
      config = "[Ne] 3s¹";
      if (phase === "reactant") {
        valence = "이온 활성가: +1";
        stateExplanation = "이온 구정 내 정전력에 묶여 조밀 표면 격자 성형 중.";
        chargeIndicator = "Na⁺ 완전 이온화";
      } else if (phase === "intermediate") {
        valence = "정전용매 분산 장벽 완화";
        stateExplanation = "촉매 활성화장 내부에서 산염기 해리 속도를 보조하는 상간 이동 보증.";
        chargeIndicator = "용매 이온 분산 상태";
      } else {
        valence = "이온 활성가: +1";
        stateExplanation = "최종 생성염 상태로 안정한 격자 지지체 상부 이온 결정화 성사.";
        chargeIndicator = "Na⁺ 최종 기저 안정성";
      }
      break;

    case "Cl":
      name = "염소 (Cl)";
      config = "[Ne] 3s² 3p⁵";
      if (phase === "reactant") {
        valence = "공유/이온가: -1";
        stateExplanation = "정전 격자 표면에서 매우 높은 전자친화도를 유지 및 관측 구역 유지.";
        chargeIndicator = "Cl⁻ 기저 상태";
      } else if (phase === "intermediate") {
        valence = "활성 이탈 배위 및 친핵 공격";
        stateExplanation = "중심 결합을 끊고 탈리하는 강력한 전기음성적 고에너지 중간체 구동.";
        chargeIndicator = "고전하 국소 전자 축적";
      } else {
        valence = "공유/이온가: -1";
        stateExplanation = "반응 중심에서 완벽 분리 해리되어 독립된 완전 상태의 자유 이온 보존.";
        chargeIndicator = "Cl⁻ 무손실 기저 완결";
      }
      break;

    case "Vb":
      name = "비브라늄 (Vb)";
      config = "[Quantum] 5d¹⁰ 6s² 6p⁶";
      if (phase === "reactant") {
        valence = "자가 공명가: 무제한";
        stateExplanation = "진동 오비탈 격자를 통한 역동적 가상 위상 결합체.";
        chargeIndicator = "에너지 축적 영점 상태";
      } else if (phase === "intermediate") {
        valence = "가상 공간 오비탈 요동";
        stateExplanation = "외부 연출 열에너지를 파동 공명 격자로 분산해 순간 엔트로피 감소 유치.";
        chargeIndicator = "영도 무산 파동 상태";
      } else {
        valence = "자가 공명가: 무제한";
        stateExplanation = "비가역 상전이 후 격자 탄성 복원 완료. 최고 강도의 결정 위상.";
        chargeIndicator = "완벽한 정지 장벽 보호";
      }
      break;

    default:
      name = `${symbol} 원소`;
      config = "추적 중";
      valence = "양자 오비탈";
      stateExplanation = "제미나이 3D 기하 계산 엔진에 의한 가상 오비탈 추적 모형.";
      chargeIndicator = "계산 세그먼트";
      break;
  }

  return { name, config, valence, stateExplanation, chargeIndicator };
};

interface ThreeDMonitorProps {
  phases: SimulationPhase[];
  activePhaseId: "reactant" | "intermediate" | "product";
  onSelectPhase: (phaseId: "reactant" | "intermediate" | "product") => void;
}

export default function ThreeDMonitor({
  phases,
  activePhaseId,
  onSelectPhase,
}: ThreeDMonitorProps) {
  // 3D rotation degrees controlled via mouse drag
  const [rotateX, setRotateX] = useState<number>(-15);
  const [rotateY, setRotateY] = useState<number>(20);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<"grid" | "focused">("grid");
  const [isMorphing, setIsMorphing] = useState<boolean>(false);
  const [zoomLevels, setZoomLevels] = useState<{
    reactant: number;
    intermediate: number;
    product: number;
  }>({
    reactant: 1.0,
    intermediate: 1.0,
    product: 1.0,
  });

  const dragStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Refs for each compartment card to bind wheel scroll zoom interactions
  const cardRefs = {
    reactant: useRef<HTMLDivElement>(null),
    intermediate: useRef<HTMLDivElement>(null),
    product: useRef<HTMLDivElement>(null),
  };

  const [hoveredAtom, setHoveredAtom] = useState<{
    id: string;
    symbol: string;
    x: number;
    y: number;
    scale: number;
    phaseId: "reactant" | "intermediate" | "product";
  } | null>(null);

  // Trigger brief pause & smooth lattice morphing on active phase change
  useEffect(() => {
    setIsMorphing(true);
    const timer = setTimeout(() => {
      setIsMorphing(false);
    }, 1000); // 1s is ideal for spring settles
    return () => clearTimeout(timer);
  }, [activePhaseId]);

  // Auto slow rotate animation when idle and not morphing
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      if (!isDragging && isRotating && !isMorphing) {
        const delta = time - lastTime;
        setRotateY((prev) => (prev + delta * 0.015) % 360);
      }
      lastTime = time;
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isDragging, isRotating, isMorphing]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setRotateY((prev) => (prev + dx * 0.5) % 360);
    setRotateX((prev) => Math.max(-80, Math.min(80, prev - dy * 0.5)));
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetRotation = () => {
    setRotateX(-15);
    setRotateY(20);
  };

  const handleZoom = (phaseId: "reactant" | "intermediate" | "product", delta: number) => {
    setZoomLevels((prev) => ({
      ...prev,
      [phaseId]: Math.max(0.4, Math.min(3.0, Math.round((prev[phaseId] + delta) * 10) / 10)),
    }));
  };

  // Mouse wheel scrolling zoom implementation
  useEffect(() => {
    const handleWheelZoom = (e: WheelEvent, phaseId: "reactant" | "intermediate" | "product") => {
      // Zoom if this phase is currently active
      if (activePhaseId === phaseId) {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.1 : -0.1; // steady zoom increment speed
        handleZoom(phaseId, delta);
      }
    };

    const reactantEl = cardRefs.reactant.current;
    const intermediateEl = cardRefs.intermediate.current;
    const productEl = cardRefs.product.current;

    const onReactantWheel = (e: WheelEvent) => handleWheelZoom(e, "reactant");
    const onIntermediateWheel = (e: WheelEvent) => handleWheelZoom(e, "intermediate");
    const onProductWheel = (e: WheelEvent) => handleWheelZoom(e, "product");

    if (reactantEl) {
      reactantEl.addEventListener("wheel", onReactantWheel, { passive: false });
    }
    if (intermediateEl) {
      intermediateEl.addEventListener("wheel", onIntermediateWheel, { passive: false });
    }
    if (productEl) {
      productEl.addEventListener("wheel", onProductWheel, { passive: false });
    }

    return () => {
      if (reactantEl) {
        reactantEl.removeEventListener("wheel", onReactantWheel);
      }
      if (intermediateEl) {
        intermediateEl.removeEventListener("wheel", onIntermediateWheel);
      }
      if (productEl) {
        productEl.removeEventListener("wheel", onProductWheel);
      }
    };
  }, [activePhaseId, viewMode]);

  // 3D projection matrix conversion
  // Input: scale coordinate 0-100 for x, y. Deep z (-50 to 50)
  // Center is projected relative to each grid column width
  const getCentroid = (nodes: ElementNode[]) => {
    if (!nodes || nodes.length === 0) return { x: 50, y: 50, z: 0 };
    let sumX = 0;
    let sumY = 0;
    let sumZ = 0;
    nodes.forEach((n) => {
      sumX += n.x;
      sumY += n.y;
      sumZ += n.z;
    });
    return {
      x: sumX / nodes.length,
      y: sumY / nodes.length,
      z: sumZ / nodes.length,
    };
  };

  // 모든 위상(페이즈)에 걸쳐 균형 잡힌 정렬을 하도록 통합 공용 중심점(Global Centroid)을 계산하고 보간합니다.
  // 이로써 반응 전-중-후 구조 변경 시 중심 점이 요동쳐 모핑이 튀는 것을 방지하고 3D 격자의 가로/세로 정중앙에 고정되도록 제어합니다.
  const getGlobalCentroid = (allPhases: SimulationPhase[], activePhase: SimulationPhase) => {
    if (!allPhases || allPhases.length === 0) {
      return getCentroid(activePhase.nodes);
    }
    
    let sumX = 0;
    let sumY = 0;
    let sumZ = 0;
    let totalNodesCount = 0;

    allPhases.forEach((p) => {
      if (p && Array.isArray(p.nodes)) {
        p.nodes.forEach((n) => {
          sumX += n.x;
          sumY += n.y;
          sumZ += n.z;
          totalNodesCount++;
        });
      }
    });

    if (totalNodesCount > 0) {
      return {
        x: sumX / totalNodesCount,
        y: sumY / totalNodesCount,
        z: sumZ / totalNodesCount,
      };
    }
    return getCentroid(activePhase.nodes);
  };

  const getAutoFitScale = (nodes: ElementNode[], centroid: { x: number; y: number; z: number }) => {
    if (!nodes || nodes.length === 0) return 1.0;
    let maxDist = 1.0;
    nodes.forEach((n) => {
      const dx = Math.abs(n.x - centroid.x);
      const dy = Math.abs(n.y - centroid.y);
      const dz = Math.abs(n.z - centroid.z);
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist > maxDist) maxDist = dist;
    });
    const idealRadius = 32; // ideal radius span inside the viewport layout to maximize centering size
    return Math.max(0.18, Math.min(1.0, idealRadius / maxDist));
  };

  // 3D projection matrix conversion
  // Input: scale coordinate 0-100 for x, y. Deep z (-50 to 50)
  // Center is projected relative to each grid column width
  const project3D = (
    node: ElementNode,
    width: number,
    height: number,
    zoom: number = 1.0,
    centroid = { x: 50, y: 50, z: 0 },
    autoFitScale: number = 1.0
  ) => {
    const cx = width / 2;
    const cy = height / 2;

    // Normalize coordinates relative to actual element centroid and apply scale adjustment to guarantee central fit
    // 원자 및 분자 간 간격을 시원시원하게 넓히는 고정밀 팽창 스페이싱 팩터 주입 (가시성 및 원자별 구별력 대폭 개선)
    const spacingFactor = 2.3;
    const scaleFactor = 1.6 * zoom * autoFitScale;
    const px = (node.x - centroid.x) * spacingFactor * scaleFactor;
    const py = (node.y - centroid.y) * spacingFactor * scaleFactor;
    const pz = (node.z - centroid.z) * spacingFactor * scaleFactor;

    const radX = (rotateX * Math.PI) / 180;
    const radY = (rotateY * Math.PI) / 180;

    // Rotate Y-axis (Yaw)
    let x1 = px * Math.cos(radY) - pz * Math.sin(radY);
    let z1 = px * Math.sin(radY) + pz * Math.cos(radY);

    // Rotate X-axis (Pitch)
    let y2 = py * Math.cos(radX) - z1 * Math.sin(radX);
    let z2 = py * Math.sin(radX) + z1 * Math.cos(radX);

    // Perspective factor
    const d = 160; // virtual camera focal distance
    const perspective = d / (d + z2);

    // Map back to screen space centered
    const multiplier = 1.05;
    const screenX = cx + x1 * perspective * multiplier;
    // Y축 수직 편극 오프셋을 세로 정중앙(기존 -70에서 -5로 대폭 완화)에 완벽하게 수렴 정전 시뮬레이션 투영
    const screenY = cy + y2 * perspective * multiplier - 5;

    return {
      x: screenX,
      y: screenY,
      zDepth: z2, // higher z2 means deeper (further back from camera)
      scale: perspective,
    };
  };

  // Uniform grid dimensions to prevent clipping and guarantee responsive ratio fitting in focused view
  const colWidth = 400;
  const colHeight = 360;

  // We want to draw 3 grids. Each column renders its respective phase nodes/links.
  // We join all render objects (both nodes and links) to Sort Z-index correctly!
  const getRenderObjects = (phase: SimulationPhase) => {
    const zoom = zoomLevels[phase.phaseId] || 1.0;
    // 전위상 통합 무게중심값 보정을 적용하여 모핑 이동 시 요동을 완전 차단합니다.
    const centroid = getGlobalCentroid(phases, phase);
    const autoFitScale = getAutoFitScale(phase.nodes, centroid);

    const projectedNodes = phase.nodes.map((node) => ({
      type: "node",
      id: node.id,
      symbol: node.symbol,
      color: node.color,
      size: node.size,
      original: node,
      zoom,
      ...project3D(node, colWidth, colHeight, zoom, centroid, autoFitScale),
    }));

    const projectedLinks = phase.links
      .map((link) => {
        const sourceNode = phase.nodes.find((n) => n.id === link.source);
        const targetNode = phase.nodes.find((n) => n.id === link.target);

        if (!sourceNode || !targetNode) return null;

        const srcProj = project3D(sourceNode, colWidth, colHeight, zoom, centroid, autoFitScale);
        const tgtProj = project3D(targetNode, colWidth, colHeight, zoom, centroid, autoFitScale);

        return {
          type: "link",
          id: link.id,
          sourceId: link.source,
          targetId: link.target,
          bondType: link.bondType,
          x1: srcProj.x,
          y1: srcProj.y,
          x2: tgtProj.x,
          y2: tgtProj.y,
          zoom,
          zDepth: (srcProj.zDepth + tgtProj.zDepth) / 2, // average depth
        };
      })
      .filter((l) => l !== null);

    // Combine and sort by zDepth descending (furthest drawn first, closest last)
    const combined = [...projectedNodes, ...projectedLinks];
    combined.sort((a, b) => b.zDepth - a.zDepth);
    return combined;
  };

  // Mapping columns
  const compartments: Array<{
    id: "reactant" | "intermediate" | "product";
    label: string;
    badge: string;
    colorClasses: string;
  }> = [
    {
      id: "reactant",
      label: "초기 반응물 격자",
      badge: "Reactants",
      colorClasses: "border-white/5 bg-zinc-900/10 hover:border-white/20",
    },
    {
      id: "intermediate",
      label: "전이구조 & 활성화 장벽",
      badge: "Intermediates",
      colorClasses: "border-white/5 bg-indigo-500/5 hover:border-indigo-500/20",
    },
    {
      id: "product",
      label: "최종 안정 생성물",
      badge: "Products",
      colorClasses: "border-white/5 bg-zinc-900/10 hover:border-white/20",
    },
  ];

  return (
    <div className="relative flex flex-col h-full bg-zinc-950/80 border border-white/5 rounded-3xl p-6 overflow-hidden backdrop-blur-md shadow-xl shadow-slate-950/50">
      {/* 3D Header HUD */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-white/5 pb-4 z-10">
        <div>
          <h2 className="text-lg font-sans font-semibold text-slate-200 flex items-center gap-2 tracking-tight">
            <Rotate3d className="w-5 h-5 text-indigo-400 animate-spin-slow" />
            3D 가상 미시 격자 반응 모니터
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            CPK 표준 컬러 기반 3차원 클러스터. 화면을 클릭 후 드래그하여 임의 각도 360° 광학 회전 관측 가능.
          </p>
        </div>
        <div className="flex flex-col gap-2 items-end self-start sm:self-auto shrink-0 z-10 w-full sm:w-auto">
          <div className="flex bg-[#1e293b]/20 p-1 rounded-xl border border-white/5 w-full sm:min-w-[240px] items-center gap-1">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1 px-2.5 text-[10px] sm:text-xs font-sans font-medium rounded-lg cursor-pointer transition-all ${
                viewMode === "grid"
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/35 shadow-sm font-semibold"
                  : "text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              나란히 분석
            </button>
            <button
              type="button"
              onClick={() => setViewMode("focused")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1 px-2.5 text-[10px] sm:text-xs font-sans font-medium rounded-lg cursor-pointer transition-all ${
                viewMode === "focused"
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/35 shadow-sm font-semibold"
                  : "text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              통합 모핑
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetRotation}
              id="btn_reset_rotation"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e293b]/50 hover:bg-[#1e293b]/70 text-[11px] font-mono text-slate-300 rounded-lg border border-white/5 transition-all cursor-pointer active:scale-95"
            >
              <Compass className="w-3.5 h-3.5" />
              각도 초기화
            </button>
            <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-1.5 bg-indigo-500/10 text-xs font-mono text-indigo-400 rounded-lg border border-indigo-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
              Z-Sorting 활성
            </span>
          </div>

          <button
            onClick={() => setIsRotating((prev) => !prev)}
            id="btn_toggle_rotation"
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono rounded-lg border transition-all cursor-pointer active:scale-95 w-full justify-center ${
              isRotating
                ? "bg-amber-500/10 hover:bg-amber-500/25 text-amber-300 border-amber-500/30"
                : "bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/30"
            }`}
          >
            {isRotating ? (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                회전 정지
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                자동 회전 시작
              </>
            )}
          </button>
        </div>
      </div>

      {/* CPK Color Legend Banner (Laid out horizontally above 3D grids) */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 bg-zinc-900/40 border border-white/5 p-2 px-4 rounded-xl mb-4 z-20 shadow-sm w-full">
        <span className="text-[10px] font-sans font-bold text-indigo-400 uppercase tracking-widest shrink-0 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
          CPK 원소 가이드 :
        </span>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
          {(() => {
            const activeSymbols = new Set<string>();
            if (Array.isArray(phases)) {
              phases.forEach((p) => {
                if (p && Array.isArray(p.nodes)) {
                  p.nodes.forEach((n) => {
                    if (n && n.symbol) {
                      activeSymbols.add(n.symbol);
                    }
                  });
                }
              });
            }

            const elementMeta: { [key: string]: { label: string; color: string; isLight?: boolean } } = {
              H: { label: "수소(Hydrogen)", color: "#FFFFFF", isLight: true },
              C: { label: "탄소(Carbon)", color: "#475569" },
              O: { label: "산소(Oxygen)", color: "#EF4444" },
              N: { label: "질소(Nitrogen)", color: "#3B82F6" },
              Na: { label: "나트륨(Sodium)", color: "#A855F7" },
              Cl: { label: "염소(Chlorine)", color: "#22C55E" },
              Mg: { label: "마그네슘(Magnesium)", color: "#A8A29E", isLight: true },
              Ag: { label: "은(Silver)", color: "#94A3B8", isLight: true },
              Ca: { label: "칼슘(Calcium)", color: "#10B981" },
              Fe: { label: "철(Iron)", color: "#EA580C" },
              Cu: { label: "구리(Copper)", color: "#06B6D4" },
              Vb: { label: "비브라늄(Vibranium)", color: "#818CF8" }
            };

            const symbolsToRender = activeSymbols.size > 0 
              ? Array.from(activeSymbols) 
              : ["H", "C", "O", "N", "Mg", "Na", "Cl"];

            return symbolsToRender.map((sym) => {
              const meta = elementMeta[sym] || { label: `${sym}(${sym})`, color: getCPKColor(sym) };
              const bgStyles = { backgroundColor: meta.color };
              const textClass = meta.isLight ? "text-slate-900" : "text-white";
              
              return (
                <div key={sym} className="flex items-center gap-1.5 text-[10px]">
                  <span 
                    style={bgStyles}
                    className={`w-4 h-4 rounded-full flex items-center justify-center font-mono font-bold text-[8px] ${textClass} shadow-sm border border-slate-800/40`}
                  >
                    {sym}
                  </span>
                  <span className="text-slate-300 font-sans text-[10px]">{meta.label}</span>
                </div>
              );
            });
          })()}
        </div>
      </div>

      {/* SVG Container Stage */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`relative flex-1 grid grid-cols-1 ${viewMode === "grid" ? "md:grid-cols-3" : "md:grid-cols-1 max-w-2xl mx-auto w-full"} gap-6 items-center justify-center select-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      >
        {compartments
          .filter((comp) => viewMode === "grid" || activePhaseId === comp.id)
          .map((comp) => {
            const phase = phases.find((p) => p.phaseId === comp.id);
            const isActive = activePhaseId === comp.id;
            const renderObjects = phase ? getRenderObjects(phase) : [];

            const layoutTransition = (isDragging || (isRotating && !isMorphing))
              ? { type: "tween", duration: 0 }
              : { type: "spring", stiffness: 75, damping: 14, mass: 0.7 };

            return (
              <div
                key={comp.id}
                ref={cardRefs[comp.id]}
                onClick={() => onSelectPhase(comp.id)}
                id={`comp_${comp.id}`}
                className={`relative ${viewMode === "focused" ? "h-[450px]" : "h-[400px]"} flex flex-col justify-between border-2 rounded-2xl p-4 transition-all duration-500 ${comp.colorClasses} ${
                  isActive
                    ? "ring-2 ring-indigo-500/40 border-indigo-500/30 bg-indigo-500/10 scale-[1.01] shadow-xl shadow-indigo-500/10"
                    : "opacity-40 hover:opacity-75 blur-[0.2px]"
                } cursor-pointer group`}
              >
                {/* Glassplate Label Overlay */}
                <div className="flex items-center justify-between border-b border-white/5 pb-2 z-10">
                  <div className="flex flex-col">
                    {viewMode === "focused" ? (
                      <span className="text-[10px] font-mono tracking-wider text-indigo-400 uppercase flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                        실시간 분기 위상 연속체 (Active Phase Space)
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono tracking-wider text-indigo-400 uppercase">
                        {comp.badge}
                      </span>
                    )}
                    <span className={`${viewMode === "focused" ? "text-base font-semibold" : "text-sm"} font-sans font-medium text-slate-200 mt-0.5`}>
                      {comp.label}
                    </span>
                  </div>
                  {viewMode === "focused" ? (
                    <div className="flex bg-slate-950/60 p-1 rounded-xl border border-white/10 shrink-0 shadow-inner animate-fade-in" onClick={(e) => e.stopPropagation()}>
                      {compartments.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => onSelectPhase(c.id)}
                          className={`px-3 py-1 rounded-lg text-[9px] uppercase font-mono tracking-widest transition-all cursor-pointer ${
                            activePhaseId === c.id
                              ? "bg-indigo-600 text-white font-bold shadow"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {c.badge}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div
                      className={`px-2 py-0.5 rounded text-[10px] font-mono tracking-widest ${
                        isActive ? "bg-indigo-500/20 text-indigo-300 font-bold" : "bg-white/5 text-slate-500"
                      }`}
                    >
                      {isActive ? "ACTIVE" : "STANDBY"}
                    </div>
                  )}
                </div>

              {/* Render Area */}
              <div className="flex-1 w-full flex items-center justify-center relative mt-2 overflow-visible bg-radial-vortex">
                {/* Visual grid reference matrix */}
                <div className="absolute inset-0 border border-slate-950/40 flex items-center justify-center pointer-events-none opacity-20">
                  <div className="w-full h-[1px] bg-slate-700 dashed"></div>
                  <div className="h-full w-[1px] bg-slate-700 dashed absolute"></div>
                </div>

                {renderObjects.length === 0 ? (
                  <div className="text-center p-3 text-slate-500 text-xs">
                    <ShieldAlert className="w-8 h-8 text-amber-500/60 mx-auto mb-2" />
                    격자 데이터가 존재하지 않습니다.
                  </div>
                ) : (
                  <svg
                     viewBox={`0 0 ${colWidth} ${colHeight}`}
                    className="w-full h-full object-contain overflow-visible"
                  >
                    <defs>
                      {/* Gradient spheres for CPK atoms */}
                      {renderObjects
                        .filter((o) => o.type === "node")
                        .map((node: any) => (
                          <radialGradient
                            key={`grad-${node.id}`}
                            id={`grad-${node.id}`}
                            cx="30%"
                            cy="30%"
                            r="70%"
                          >
                            <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.8} />
                            <stop offset="40%" stopColor={node.color} />
                            <stop offset="100%" stopColor="#050510" />
                          </radialGradient>
                        ))}
                      {/* Shadow filters */}
                      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="1" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.5" />
                      </filter>
                    </defs>

                    {/* SVG projection paths sorted by depth */}
                    {renderObjects.map((obj: any) => {
                      if (obj.type === "link") {
                        const isCoordinated = obj.bondType === "coordination";
                        const isDouble = obj.bondType === "double";
                        const isTriple = obj.bondType === "triple";

                        const dashStyle = isCoordinated ? "5, 5" : undefined;
                        const strokeWidth = isCoordinated ? 1.5 : 3;
                        const strokeColor = isCoordinated ? "#818CF8" : "#94A3B8";

                        if (isDouble) {
                          // Render two slightly offset lines for double bond
                          const dx = obj.x2 - obj.x1;
                          const dy = obj.y2 - obj.y1;
                          const len = Math.sqrt(dx * dx + dy * dy) || 1;
                          const nx = (-dy / len) * 2;
                          const ny = (dx / len) * 2;

                          return (
                            <motion.g
                              key={obj.id}
                              animate={{ opacity: isActive ? 0.8 : 0.4 }}
                              transition={layoutTransition}
                              filter="url(#shadow)"
                            >
                              <motion.line
                                animate={{
                                  x1: obj.x1 + nx,
                                  y1: obj.y1 + ny,
                                  x2: obj.x2 + nx,
                                  y2: obj.y2 + ny,
                                }}
                                transition={layoutTransition}
                                stroke={strokeColor}
                                strokeWidth={2}
                              />
                              <motion.line
                                animate={{
                                  x1: obj.x1 - nx,
                                  y1: obj.y1 - ny,
                                  x2: obj.x2 - nx,
                                  y2: obj.y2 - ny,
                                }}
                                transition={layoutTransition}
                                stroke={strokeColor}
                                strokeWidth={2}
                              />
                            </motion.g>
                          );
                        }

                        if (isTriple) {
                          const dx = obj.x2 - obj.x1;
                          const dy = obj.y2 - obj.y1;
                          const len = Math.sqrt(dx * dx + dy * dy);
                          const nx = (-dy / len) * 3;
                          const ny = (dx / len) * 3;

                          return (
                            <motion.g
                              key={obj.id}
                              animate={{ opacity: isActive ? 0.9 : 0.4 }}
                              transition={layoutTransition}
                              filter="url(#shadow)"
                            >
                              <motion.line
                                animate={{ x1: obj.x1, y1: obj.y1, x2: obj.x2, y2: obj.y2 }}
                                transition={layoutTransition}
                                stroke={strokeColor}
                                strokeWidth={2}
                              />
                              <motion.line
                                animate={{
                                  x1: obj.x1 + nx,
                                  y1: obj.y1 + ny,
                                  x2: obj.x2 + nx,
                                  y2: obj.y2 + ny,
                                }}
                                transition={layoutTransition}
                                stroke={strokeColor}
                                strokeWidth={1.5}
                              />
                              <motion.line
                                animate={{
                                  x1: obj.x1 - nx,
                                  y1: obj.y1 - ny,
                                  x2: obj.x2 - nx,
                                  y2: obj.y2 - ny,
                                }}
                                transition={layoutTransition}
                                stroke={strokeColor}
                                strokeWidth={1.5}
                              />
                            </motion.g>
                          );
                        }

                        // Standard Single or Coordinated bond
                        return (
                          <motion.line
                            key={obj.id}
                            animate={{
                              x1: obj.x1,
                              y1: obj.y1,
                              x2: obj.x2,
                              y2: obj.y2,
                            }}
                            transition={layoutTransition}
                            stroke={strokeColor}
                            strokeWidth={strokeWidth}
                            strokeDasharray={dashStyle}
                            strokeLinecap="round"
                            opacity={isActive ? 0.85 : 0.4}
                            filter="url(#shadow)"
                          />
                        );
                      } else {
                        // Drawing Node Sphere with light gradient
                        const baseRadius = 12.5;
                        const r = baseRadius * obj.size * obj.scale * (obj.zoom || 1.0);

                        return (
                          <motion.g
                            key={obj.id}
                            layout
                            className="cursor-pointer"
                            onMouseEnter={() => {
                              if (isActive) {
                                setHoveredAtom({
                                  id: obj.id,
                                  symbol: obj.symbol,
                                  x: obj.x,
                                  y: obj.y,
                                  scale: obj.scale,
                                  phaseId: comp.id
                                });
                              }
                            }}
                            onMouseLeave={() => {
                              setHoveredAtom(null);
                            }}
                          >
                            {/* Ambient glow around active elements */}
                            {isActive && (
                              <motion.circle
                                animate={{
                                  cx: obj.x,
                                  cy: obj.y,
                                  r: r * 1.25,
                                }}
                                transition={layoutTransition}
                                fill={obj.color}
                                opacity={0.15}
                              />
                            )}
                            {/* CPK Volume sphere */}
                            <motion.circle
                              animate={{
                                cx: obj.x,
                                cy: obj.y,
                                r: r,
                              }}
                              transition={layoutTransition}
                              fill={`url(#grad-${obj.id})`}
                              stroke="#0A0F1D"
                              strokeWidth={0.5}
                            />
                            {/* Text label for element symbol */}
                            <motion.text
                              animate={{
                                x: obj.x,
                                y: obj.y + 3,
                              }}
                              transition={layoutTransition}
                              textAnchor="middle"
                              fill={obj.symbol === "H" ? "#334155" : "#FFFFFF"}
                              fontSize={Math.max(8, 10 * obj.scale * (obj.zoom || 1.0))}
                              fontWeight="bold"
                              fontFamily="JetBrains Mono, monospace"
                              pointerEvents="none"
                            >
                              {obj.symbol}
                            </motion.text>
                          </motion.g>
                        );
                      }
                    })}
                  </svg>
                )}

                {/* Floating Interactive Hover Tooltip Overlay */}
                <AnimatePresence>
                  {hoveredAtom && hoveredAtom.phaseId === comp.id && (() => {
                    const specs = getAtomSpecsByPhase(hoveredAtom.symbol, hoveredAtom.phaseId);
                    const isNearTop = hoveredAtom.y < 100;

                    const themeColor =
                      comp.id === "reactant" ? "text-blue-400" :
                      comp.id === "intermediate" ? "text-indigo-400" : "text-emerald-400";

                    const borderColor =
                      comp.id === "reactant" ? "border-blue-500/30 shadow-blue-500/10" :
                      comp.id === "intermediate" ? "border-indigo-500/30 shadow-indigo-500/10" : "border-emerald-500/30 shadow-emerald-500/10";

                    return (
                      <motion.div
                        key={`tooltip-${hoveredAtom.id}`}
                        initial={{ opacity: 0, scale: 0.92, y: isNearTop ? -5 : 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className={`absolute p-3 rounded-xl bg-slate-950/95 border ${borderColor} shadow-2xl z-30 w-[190px] font-sans text-left pointer-events-none select-none`}
                        style={{
                          left: `${(hoveredAtom.x / colWidth) * 100}%`,
                          top: `${(hoveredAtom.y / colHeight) * 100}%`,
                          transform: isNearTop ? "translate(-50%, 15px)" : "translate(-50%, -108%)",
                        }}
                      >
                        {/* Title of the Atom + Symbol badge */}
                        <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-black/30 shadow-sm"
                              style={{ backgroundColor: getCPKColor(hoveredAtom.symbol) }}
                            />
                            <span className="text-[11px] font-bold text-slate-100">{specs.name}</span>
                          </div>
                          <span className="text-[9px] font-mono font-bold bg-white/5 px-1 py-0.5 rounded text-indigo-300">
                            {hoveredAtom.symbol}
                          </span>
                        </div>

                        {/* Electron Config */}
                        <div className="mb-1.5">
                          <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block">ELECTRON CONFIG</span>
                          <span className="text-[10px] font-mono text-slate-200 block">
                            {specs.config}
                          </span>
                        </div>

                        {/* Valence / Charge state */}
                        <div className="mb-1.5">
                          <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block">VALENCE / STATE</span>
                          <span className={`text-[10px] font-mono ${themeColor} font-semibold block leading-tight`}>
                            {specs.valence}
                          </span>
                          {specs.chargeIndicator && (
                            <span className="text-[9px] text-slate-400 font-sans block opacity-80 mt-0.5">
                              대칭 전위: {specs.chargeIndicator}
                            </span>
                          )}
                        </div>

                        {/* Local Behavior statement */}
                        <div className="border-t border-white/5 pt-1.5 mt-1.5">
                          <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block">PHASE BEHAVIOR</span>
                          <p className="text-[9px] text-slate-400 leading-normal font-sans mt-0.5">
                            {specs.stateExplanation}
                          </p>
                        </div>

                        {/* Tiny dynamic pointing tick/arrow */}
                        <div
                          className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 border bg-slate-950"
                          style={{
                            borderColor: "transparent",
                            ...(!isNearTop
                              ? {
                                  bottom: "-5px",
                                  borderRightColor: "rgba(99, 102, 241, 0.2)",
                                  borderBottomColor: "rgba(99, 102, 241, 0.2)",
                                  backgroundColor: "#020617"
                                }
                              : {
                                  top: "-5px",
                                  borderLeftColor: "rgba(99, 102, 241, 0.2)",
                                  borderTopColor: "rgba(99, 102, 241, 0.2)",
                                  backgroundColor: "#020617"
                                }
                            )
                          }}
                        />
                      </motion.div>
                    );
                  })()}
                </AnimatePresence>

                {/* Floating zoom control layer */}
                <div 
                  className="absolute bottom-2 right-2 flex items-center bg-slate-900/90 border border-white/10 rounded-lg p-1 gap-1 z-20 shadow-md backdrop-blur-sm opacity-80 hover:opacity-100 transition-opacity" 
                  onClick={(e) => {
                    // Prevent card selection trigger when clicking zoom controls
                    e.stopPropagation();
                  }}
                >
                  <button
                    type="button"
                    title="축소 (Zoom Out)"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleZoom(comp.id, -0.1);
                    }}
                    className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors active:scale-90 cursor-pointer flex items-center justify-center"
                  >
                    <ZoomOut className="w-3 h-3" />
                  </button>
                  <span className="text-[9px] font-mono font-bold text-slate-300 min-w-[28px] text-center select-none">
                    {Math.round((zoomLevels[comp.id] || 1.0) * 100)}%
                  </span>
                  <button
                    type="button"
                    title="확대 (Zoom In)"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleZoom(comp.id, 0.1);
                    }}
                    className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors active:scale-90 cursor-pointer flex items-center justify-center"
                  >
                    <ZoomIn className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Mechanism short note */}
              <div className="mt-2 text-center text-[11px] text-slate-500 font-sans line-clamp-2 h-7 group-hover:text-slate-400 transition-colors">
                {phase?.description || "분사 격자 기질 로딩 중..."}
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-2 left-6 right-6 flex items-center justify-between text-[10px] text-slate-600 font-mono select-none pointer-events-none hidden sm:flex">
        <span>X-Rot: {Math.round(rotateX)}° / Y-Rot: {Math.round(rotateY)}°</span>
        <span>POV: ORTHO 3D DEPTH MAP</span>
      </div>
    </div>
  );
}
