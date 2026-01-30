
export enum MoonPhase {
  NEW = 'New Moon',
  WAXING_CRESCENT = 'Waxing Crescent',
  FIRST_QUARTER = 'First Quarter',
  WAXING_GIBBOUS = 'Waxing Gibbous',
  FULL = 'Full Moon',
  WANING_GIBBOUS = 'Waning Gibbous',
  LAST_QUARTER = 'Last Quarter',
  WANING_CRESCENT = 'Waning Crescent',
}

export interface TarotCard {
  id: string;
  name: string;
  imageUrl: string;
  keywords: string[];
  meaning: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface PracticeSession {
  id: string;
  scenarioId: string;
  scenarioTitle: string;
  durationSeconds: number;
  totalDuration: number;
  energyScore: number; // 0-100 based on completion
  completed: boolean;
  timestamp: number;
}

// 3-Stage Daily Data Structure
export interface DayEntry {
  date: string; // ISO String YYYY-MM-DD
  moonPhase: MoonPhase;
  
  // Stage 1: Past Review (of previous day's seed)
  yesterdayReview?: {
    completed: boolean;
    reflection: string; // User's reflection if not completed, or celebration
    status: 'pending' | 'done';
  };

  // Stage 2: Today's Awareness (The main chat)
  todayAwareness?: {
    cardId: string;
    chatHistory: Message[];
    selectedTitle?: string;
    complexityScore: number; // For mood curve (0-100)
    energyLevel?: number; // 0-100 User defined energy level
    status: 'locked' | 'pending' | 'done';
  };

  // Stage 3: Tomorrow's Seed (Preparation)
  tomorrowSeed?: {
    cardId: string;
    blessingCompleted: boolean; // Long press ritual
    energySeed: string; // The goal text
    aiSuggestion: string;
    status: 'locked' | 'pending' | 'done';
    
    // New fields for interaction
    isCompleted?: boolean;
    completionMessage?: string; 
  };

  // New: Practice History
  practices?: PracticeSession[];
}

export type Tab = 'divination' | 'calendar' | 'trends' | 'practice' | 'soul';