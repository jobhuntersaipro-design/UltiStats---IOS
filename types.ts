
export type TeamSide = 'home' | 'away';

export interface Player {
  id: string;
  name: string;
  number: string;
  gender: 'M' | 'F' | 'Matching';
}

export interface Coordinate {
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
}

export enum EventType {
  PULL = 'PULL',
  PICKUP = 'PICKUP', // Added for starting possession
  CATCH = 'CATCH',
  DROP = 'DROP',
  THROWAWAY = 'THROWAWAY',
  GOAL = 'GOAL',
  D_BLOCK = 'D_BLOCK',
  CALLAHAN = 'CALLAHAN',
  TURNOVER = 'TURNOVER', // Generic turnover
  END_OF_QUARTER = 'END_OF_QUARTER'
}

export interface GameEvent {
  id: string;
  type: EventType;
  throwerId?: string;
  receiverId?: string;
  defenderId?: string;
  location: Coordinate;
  timestamp: number;
  possessionSide: TeamSide;
}

export interface GameState {
  events: GameEvent[];
  score: { home: number; away: number };
  currentPossession: TeamSide | null;
  hasDisc: string | null; // Player ID
  isGameActive: boolean;
  activeLineup: {
    home: string[]; // Player IDs
    away: string[]; // Player IDs
  };
}
