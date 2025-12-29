# Project Specification: Coffee Lab (Angular Web App) v5 (Final)

## 1. Project Overview

Build a static Single Page Application (SPA) named "Coffee Lab" hosted on GitHub Pages. The app is a comprehensive coffee brewing companion that acts as a "Smart Brewer" and "Digital Logbook". It manages coffee bean inventory, equipment profiles, custom brewing recipes (with step-by-step timers), and saves detailed records to Google Sheets.

## 2. Tech Stack & Environment

- **Framework:** Angular 17+ (Standalone Components, Signals, RxJS).
- **Language:** TypeScript (Strict mode).
- **Styling:** Tailwind CSS (Dark mode default).
- **State Management:** RxJS BehaviorSubjects or Angular Signals.
- **Routing:** Angular Router with **`HashLocationStrategy`** (Crucial for GitHub Pages compatibility).
- **Backend:** Serverless (Google Sheets via Google Apps Script) acting as a multi-tab relational database.
- **Deployment:** GitHub Pages (`ng deploy --base-href=/repo-name/`).

## 3. Data Models (Interfaces)

### A. Core Entities

```typescript
// 1. Brew Step (Recipe Logic)
// Defines a single action in a recipe timeline
export interface BrewStep {
  name: string; // e.g., "Bloom (悶蒸)", "First Pour"
  type: 'pour' | 'wait'; // Action type
  waterEndTarget?: number; // Cumulative target weight (e.g., reach 30g, then 150g...)
  duration: number; // Seconds for this step
  description?: string; // Tips (e.g., "Pour in circles")
}

// 2. Brew Method (Recipe Template)
// Stored in Sheet: 'Methods' tab
export interface BrewMethod {
  id: string; // UUID
  name: string; // e.g., "V60 4:6 Method"
  category: 'drip' | 'immersion' | 'espresso' | 'hybrid';
  recommendedTemp: number; // e.g., 92 (°C)
  recommendedRatio: number; // e.g., 15 (1:15)
  steps: BrewStep[]; // Array of steps. *NOTE: Stored as JSON string in Google Sheets.*
  description?: string;
}

// 3. Coffee Bean (Inventory)
// Stored in Sheet: 'Beans' tab
export interface CoffeeBean {
  id: string;
  name: string; // e.g., "Ethiopia Yirgacheffe"
  roastLevel: 'light' | 'medium' | 'dark';
  shop?: string; // e.g., "Simple Kaffa"
  purchaseDate: string; // ISO Date
  weight: number; // Total weight in grams
  flavorNotes: string[]; // e.g., ["Floral", "Citrus"]
  isActive: boolean; // True = In stock
}

// 4. Grinder Profile (Equipment)
// Stored in Sheet: 'Grinders' tab
export interface GrinderProfile {
  id: string;
  name: string; // e.g., "Timemore S3"
  defaultSetting: number; // User's preferred default
  minSetting: number; // e.g., 0
  maxSetting: number; // e.g., 9
  step: number; // e.g., 0.1
}

// 5. Sensory Profile (Rating)
export interface SensoryProfile {
  aroma: number; // 1-5
  acidity: number; // 1-5
  sweetness: number; // 1-5
  body: number; // 1-5
  aftertaste: number; // 1-5
  balance: number; // 1-5
  overall: number; // 1-5
}

// 6. Brew Log (The Record)
// Stored in Sheet: 'Logs' tab
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
  totalTime: string; // "MM:SS"

  // Outcome
  sensory: SensoryProfile;
  notes?: string;
}
```
