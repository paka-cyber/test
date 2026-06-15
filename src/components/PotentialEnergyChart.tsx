/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  CartesianGrid,
} from "recharts";
import { Zap, TrendingUp, Sparkles } from "lucide-react";

interface PotentialEnergyChartProps {
  potentialEnergy: number[]; // e.g. [20, 85, 10]
  activePhaseId: "reactant" | "intermediate" | "product";
  chemicalEquation: string;
}

export default function PotentialEnergyChart({
  potentialEnergy,
  activePhaseId,
  chemicalEquation,
}: PotentialEnergyChartProps) {
  // Ensure we have exactly 3 energy points (fallback to defaults if parsing fails)
  const energies = potentialEnergy && potentialEnergy.length >= 3 
    ? potentialEnergy 
    : [20, 75, 15];

  const rEnergy = energies[0];
  const iEnergy = energies[1];
  const pEnergy = energies[2];

  // Interpolate points to build a continuous sleek thermodynamic curve (Spline interpolation)
  // Let's create 15 points to make a extremely smooth hill/bell curve
  const data: Array<{ xName: string; coordinate: number; energy: number; phase?: string }> = [];
  const stepsCount = 18;

  for (let i = 0; i <= stepsCount; i++) {
    const t = i / stepsCount;
    let val = 0;
    let label = "";
    let phaseCode = "";

    // Bezier/Quadratic spline interpolation to show a smooth activation mountain
    if (t < 0.5) {
      // reactant to transition state curve
      const localT = t * 2;
      val = rEnergy + (iEnergy - rEnergy) * (3 * localT * localT - 2 * localT * localT * localT);
    } else {
      // transition state to product curve
      const localT = (t - 0.5) * 2;
      val = iEnergy + (pEnergy - iEnergy) * (3 * localT * localT - 2 * localT * localT * localT);
    }

    if (i === 0) {
      label = "반응물 (R)";
      phaseCode = "reactant";
    } else if (i === Math.round(stepsCount / 2)) {
      label = "전이 장벽 (TS)";
      phaseCode = "intermediate";
    } else if (i === stepsCount) {
      label = "생상물 (P)";
      phaseCode = "product";
    }

    data.push({
      xName: label || `지점 ${i}`,
      coordinate: Math.round(t * 100),
      energy: Math.round(val),
      phase: phaseCode || undefined,
    });
  }

  // Find exact index coordinate of current phase marker on curve
  let highlightedIndex = 0;
  if (activePhaseId === "intermediate") {
    highlightedIndex = Math.round(stepsCount / 2);
  } else if (activePhaseId === "product") {
    highlightedIndex = stepsCount;
  }

  const activeDataPoint = data[highlightedIndex];

  // Calculate activation energy (E_a = Transition Energy - Reactant Energy)
  const activationEnergy = Math.max(0, iEnergy - rEnergy);
  // Calculate reaction enthalpy delta (dH = Product Energy - Reactant Energy)
  const enthalpyDelta = pEnergy - rEnergy;
  const isExothermic = enthalpyDelta < 0;

  return (
    <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 backdrop-blur-md flex flex-col h-full justify-between shadow-lg shadow-slate-950/20">
      <div>
        <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Zap className="text-indigo-400 w-5 h-5 animate-pulse" />
            <div>
              <h3 className="text-[10px] font-mono tracking-widest text-[#818CF8] uppercase">Potential Energy Surface</h3>
              <h4 className="text-sm font-sans font-semibold text-slate-200 mt-0.5">열역학적 포텐셜 에너지 곡선</h4>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-indigo-400 font-extrabold uppercase font-mono block">Ea = {activationEnergy} PE</span>
            <span className="text-[9px] font-mono text-slate-500">Scale: 0 ~ 100 PE</span>
          </div>
        </div>


        {/* Real-time Enthalpy metadata readout */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/5 border border-white/5 rounded-xl p-2.5">
            <span className="text-[10px] uppercase font-mono text-zinc-500 block">활성화 에너지 (Activation Eₐ)</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-base font-mono font-bold text-indigo-400">+{activationEnergy}</span>
              <span className="text-[10px] font-mono text-slate-500">PE</span>
            </div>
          </div>
          <div className="bg-white/5 border border-white/5 rounded-xl p-2.5">
            <span className="text-[10px] uppercase font-mono text-zinc-500 block">반응 엔탈피 변화 (ΔH)</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className={`text-base font-mono font-bold ${isExothermic ? "text-emerald-400" : "text-rose-400"}`}>
                {enthalpyDelta > 0 ? `+${enthalpyDelta}` : enthalpyDelta}
              </span>
              <span className="text-[10px] font-mono text-slate-500">PE</span>
              <span className="text-[9px] font-sans text-slate-400 ml-1">
                ({isExothermic ? "발열" : "흡열"})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SVG Chart display space */}
      <div className="h-[180px] w-full relative mt-1 bg-slate-950/20 rounded-xl p-1 border border-white/5">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 15, right: 15, left: -25, bottom: -5 }}>
            <defs>
              <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#818CF8" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#818CF8" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.3} />
            <XAxis
              dataKey="coordinate"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748B", fontSize: 10, fontFamily: "JetBrains Mono" }}
              tickFormatter={(val) => `${val}%`}
            />
            <YAxis
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748B", fontSize: 10, fontFamily: "JetBrains Mono" }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const pNode = payload[0].payload;
                  return (
                    <div className="bg-zinc-900 border border-white/10 p-2 rounded-lg shadow-xl text-[10px] font-mono">
                      <p className="text-slate-400">진행도: {pNode.coordinate}%</p>
                      <p className="text-indigo-400 font-bold">포텐셜: {pNode.energy} PE</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="energy"
              stroke="#6366F1"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorEnergy)"
            />

            {/* Render flashing current phase dot inside chart */}
            {activeDataPoint && (
              <ReferenceDot
                x={activeDataPoint.coordinate}
                y={activeDataPoint.energy}
                r={6}
                fill="#FBBF24"
                stroke="#0F172A"
                strokeWidth={2}
                className="animate-pulse"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>

        {/* Pulse radar for current position mapping */}
        {activeDataPoint && (
          <div
            className="absolute pointer-events-none w-3.5 h-3.5 rounded-full bg-amber-400/40 animate-ping"
            style={{
              left: `${15 + (activeDataPoint.coordinate / 100) * 80}%`,
              bottom: `${15 + (activeDataPoint.energy / 100) * 75}%`,
              transform: "translate(-50%, 50%)"
            }}
          ></div>
        )}
      </div>

      {/* Footer explanation note */}
      <div className="mt-4 flex items-center gap-2 bg-zinc-900/40 rounded-xl p-2.5 border border-white/5 text-[11px] text-zinc-400 font-sans leading-relaxed">
        <TrendingUp className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        <span>
          현재 진행 단계: <b>{activePhaseId === "reactant" ? "반응물 기질" : activePhaseId === "intermediate" ? "전이상태 분열(TS)" : "정립 안정물"}</b> 영역 관전 중. 활성화 산을 한결 부드럽게 활강할 수록 발열 속도가 급격해집니다.
        </span>
      </div>
    </div>
  );
}
