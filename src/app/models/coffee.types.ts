export type BrewMethodCategory = 'drip' | 'immersion' | 'espresso' | 'hybrid';

// 1. Brew Step
export interface BrewStep {
  name: string;
  type: 'pour' | 'wait';
  waterEndTarget?: number; // Cumulative (absolute grams)
  waterEndTargetRatio?: number; // Cumulative (ratio multiplier relative to dose, e.g., 2, 6, 12, 15)
  duration: number; // Seconds
  description?: string;
}

// 2. Brew Method
export interface BrewMethod {
  id: string;
  name: string;
  category: BrewMethodCategory;
  recommendedTemp: number;
  recommendedRatio: number; // e.g., 15 for 1:15
  steps: BrewStep[];
  description?: string;
}

// 3. Coffee Bean
export interface CoffeeBean {
  id: string;
  name: string;
  roastLevel: 'extralight' | 'light' | 'medium' | 'mediumdark' | 'dark';
  shop?: string;
  purchaseDate: string; // ISO Date
  weight: number; // Remaining weight
  flavorNotes: string[];
  isActive: boolean;
}

// 4. Grinder Profile
export interface GrinderProfile {
  id: string;
  name: string;
  defaultSetting: number;
  minSetting: number;
  maxSetting: number;
  step: number;
  // Optional extension to keep the "Converter" feature working nicely
  ranges?: {
    espresso?: [number, number];
    pourOver?: [number, number];
    frenchPress?: [number, number];
  };
}

// 5. Sensory Profile
export interface SensoryProfile {
  aroma: number; // 1-5
  acidity: number; // 1-5
  sweetness: number; // 1-5
  body: number; // 1-5
  aftertaste: number; // 1-5
  balance: number; // 1-5
  overall: number; // 1-5
}

// 6. Brew Record
export interface BrewRecord {
  id: string;
  date: string;

  // Relations
  beanId: string;
  beanName: string; // Snapshot
  methodId: string;
  grinderId: string;

  // Parameters
  settingUsed: number;
  beanWeight: number;
  waterWeight: number;
  temperature: number;
  totalTime: string;

  // Outcome
  sensory: SensoryProfile;
  notes?: string;
}