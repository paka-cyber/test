/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ElementNode {
  id: string;
  symbol: string;
  x: number; // 0 to 100 representing position in percentage width
  y: number; // 0 to 100 representing position in percentage height
  z: number; // -50 to 50 representing 3D depth layer
  color: string; // Tailwind color classes or hex colors for CPK representation
  size: number; // Diameter/radius multiplier for rendering
}

export interface ChemicalLink {
  id: string;
  source: string; // element node ID
  target: string; // element node ID
  bondType: "single" | "double" | "triple" | "coordination";
}

export interface SimulationPhase {
  phaseId: "reactant" | "intermediate" | "product";
  title: string;
  description: string;
  nodes: ElementNode[];
  links: ChemicalLink[];
}

export interface AlternativeRecommendation {
  reactant: string;
  reason: string;
}

export interface ValidationResult {
  isValidReaction: boolean;
  chemicalEquation: string;
  potentialEnergy: number[]; // Array of at least 3 numbers for Reactant, Activation State peak, and Product levels
  alternativeRecommendations?: AlternativeRecommendation[];
}

export interface SimulationResponse {
  phases: SimulationPhase[];
  validation: ValidationResult;
  usedAI: boolean;
  modelUsed?: string;
  errorDetail?: string;
}
