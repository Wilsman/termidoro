
export type TimerMode = 'work' | 'short_break' | 'deep_work';

export interface TimerState {
  remainingSeconds: number;
  totalSeconds: number;
  isActive: boolean;
  mode: TimerMode;
  completedCycles: number;
}

export interface HistoryItem {
  timestamp: string;
  command: string;
  output: string;
  type: 'info' | 'success' | 'command';
}
