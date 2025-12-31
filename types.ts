export interface CheckIn {
  id: string;
  timestamp: number;
  sensoryLoad: number; // 0-100 (High is bad)
  socialBattery: number; // 0-100 (Low is bad)
  emotionalIntensity: number; // 0-100 (High is intense)
  physicalFatigue: number; // 0-100 (High is tired)
  note?: string;
}

export interface DailySpoons {
  date: string; // YYYY-MM-DD
  total: number;
  remaining: number;
}

export interface Activity {
  id: string;
  name: string;
  cost: number;
  isCritical: boolean; // Si true, on peut le faire même avec peu de cuillères (ex: manger, médicaments)
  isPinned: boolean; // Si true, apparait sur le dashboard principal
  icon?: string;
}

export interface SensoryScanResult {
  id: string;
  timestamp: number;
  thirst: boolean;
  hunger: boolean;
  noise: boolean;
  light: boolean;
  temperature: boolean; // true = uncomfortable
}

export interface UserPreferences {
  name: string;
  sensitivity: 'low' | 'medium' | 'high';
}

export type ViewState = 'auth' | 'onboarding' | 'dashboard' | 'checkin' | 'history' | 'regulation' | 'sensory-scan' | 'recovery';

export enum RegulationType {
  BREATHING = 'BREATHING',
  GROUNDING = 'GROUNDING',
  STIM_VISUAL = 'STIM_VISUAL'
}

export type AppStatus = 'green' | 'orange' | 'red';