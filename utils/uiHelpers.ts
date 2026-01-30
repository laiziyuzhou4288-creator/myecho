
import { MoonPhase } from '../types';
import { Moon, Circle, Sun } from 'lucide-react';

export const getMoonIcon = (phase: MoonPhase) => {
  switch (phase) {
    case MoonPhase.FULL: return Sun; 
    case MoonPhase.NEW: return Circle;
    default: return Moon;
  }
};

/**
 * Calculates the approximate moon phase for a given date.
 * Cycle length: ~29.53059 days.
 * Reference New Moon: January 6, 2000, 12:24 UTC.
 */
export const calculateMoonPhase = (date: Date): MoonPhase => {
    const lp = 2551443; // Lunar cycle in seconds
    const new_moon = new Date(2000, 0, 6, 12, 24, 0); // Known new moon
    const now = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0); // Use noon to avoid timezone edge cases
    
    // Calculate phase difference in seconds
    const diff = (now.getTime() - new_moon.getTime()) / 1000;
    const phaseSecs = diff % lp;
    const ratio = phaseSecs / lp; // 0 to 1

    // Map ratio to 8 phases (0 is New Moon, 0.5 is Full Moon)
    // 0.00 - 0.06: New
    // 0.06 - 0.19: Waxing Crescent
    // 0.19 - 0.31: First Quarter
    // 0.31 - 0.44: Waxing Gibbous
    // 0.44 - 0.56: Full
    // 0.56 - 0.69: Waning Gibbous
    // 0.69 - 0.81: Last Quarter
    // 0.81 - 0.94: Waning Crescent
    // 0.94 - 1.00: New

    if (ratio < 0.06 || ratio >= 0.94) return MoonPhase.NEW;
    if (ratio < 0.19) return MoonPhase.WAXING_CRESCENT;
    if (ratio < 0.31) return MoonPhase.FIRST_QUARTER;
    if (ratio < 0.44) return MoonPhase.WAXING_GIBBOUS;
    if (ratio < 0.56) return MoonPhase.FULL;
    if (ratio < 0.69) return MoonPhase.WANING_GIBBOUS;
    if (ratio < 0.81) return MoonPhase.LAST_QUARTER;
    return MoonPhase.WANING_CRESCENT;
};

export const calculateComplexity = (messages: any[]): number => {
  if (!messages || messages.length === 0) return 0;
  
  const turns = messages.length;
  const combinedText = messages.map(m => m.text).join(' ');
  const totalLength = combinedText.length || 1;

  const emotivePattern = /(feel|happy|sad|anxious|calm|love|hate|hope|lost|pain|grateful|感觉|觉得|开心|难过|焦虑|平静|爱|恨|怕|希望|温柔|痛苦|迷茫|感恩|治愈|释放|沉重)/gi;
  const matches = combinedText.match(emotivePattern);
  const emotionalCount = matches ? matches.length : 0;

  const density = (emotionalCount / totalLength) * 100;

  const rawScore = (turns * 0.4) + (density * 0.6);
  
  return Math.min(100, Math.floor(rawScore * 8));
};