
import { TimerMode } from './types';

export const MODE_SETTINGS: Record<TimerMode, { label: string; duration: number; color: string }> = {
  work: {
    label: 'work (25m)',
    duration: 25 * 60,
    color: 'text-emerald-400',
  },
  short_break: {
    label: 'break (5m)',
    duration: 5 * 60,
    color: 'text-blue-400',
  },
  long_break: {
    label: 'long break (20m)',
    duration: 20 * 60,
    color: 'text-cyan-300',
  },
  deep_work: {
    label: 'deep (50m)',
    duration: 50 * 60,
    color: 'text-amber-400',
  },
};

export const COMMANDS = [
  { id: 'work', label: 'start 25:00 work', mode: 'work' },
  { id: 'short', label: 'start 05:00 break', mode: 'short_break' },
  { id: 'long', label: 'start 20:00 long break', mode: 'long_break' },
  { id: 'deep', label: 'start 50:00 deep', mode: 'deep_work' },
  { id: 'reset', label: 'reset timer', mode: null },
];
