
import React, { useState, useEffect, useCallback } from 'react';
import Terminal from './components/Terminal';
import { TimerState, TimerMode, HistoryItem } from './types';
import { MODE_SETTINGS } from './constants';

const App: React.FC = () => {
  const [state, setState] = useState<TimerState>({
    remainingSeconds: MODE_SETTINGS.work.duration,
    totalSeconds: MODE_SETTINGS.work.duration,
    isActive: false,
    mode: 'work',
    completedCycles: 0,
  });

  const [history, setHistory] = useState<HistoryItem[]>([
    { 
      timestamp: new Date().toISOString(), 
      command: 'system initialize', 
      output: 'TermiDoro v1.0.4 loaded successfully.', 
      type: 'success' 
    }
  ]);

  const addHistory = useCallback((command: string, output: string, type: HistoryItem['type'] = 'info') => {
    setHistory(prev => [...prev, { timestamp: new Date().toISOString(), command, output, type }]);
  }, []);

  const handleCommand = useCallback((action: TimerMode | 'reset') => {
    if (action === 'reset') {
      setState(prev => ({
        ...prev,
        remainingSeconds: MODE_SETTINGS[prev.mode].duration,
        isActive: false,
      }));
      addHistory('reset', 'Timer state flushed. Awaiting new instructions.', 'info');
      return;
    }

    const newDuration = MODE_SETTINGS[action].duration;
    setState(prev => ({
      ...prev,
      mode: action,
      totalSeconds: newDuration,
      remainingSeconds: newDuration,
      isActive: true,
    }));
    addHistory(`${action}`, `Sequence started. Duration set to ${MODE_SETTINGS[action].duration / 60}m.`, 'command');
  }, [addHistory]);

  useEffect(() => {
    let interval: number | undefined;

    if (state.isActive && state.remainingSeconds > 0) {
      interval = window.setInterval(() => {
        setState(prev => ({
          ...prev,
          remainingSeconds: prev.remainingSeconds - 1,
        }));
      }, 1000);
    } else if (state.remainingSeconds === 0 && state.isActive) {
      const completedMode = state.mode;
      const nextCycles = (completedMode === 'work' || completedMode === 'deep_work') 
        ? state.completedCycles + 1 
        : state.completedCycles;
      
      addHistory(`task_finish --id ${completedMode}`, 'Objective reached. System idling.', 'success');
      
      setState(prev => ({
        ...prev,
        isActive: false,
        completedCycles: nextCycles,
      }));

      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play();
      } catch (e) {
        console.warn("Audio playback failed");
      }
    }

    return () => clearInterval(interval);
  }, [state.isActive, state.remainingSeconds, state.mode, state.completedCycles, addHistory]);

  return (
    <div className="app-shell">
      <div className="bg-layer" />
      <div className="grid-layer pointer-events-none" />
      <div className="window-frame">
        <Terminal 
          state={state} 
          history={history} 
          onCommand={handleCommand} 
        />
      </div>
    </div>
  );
};

export default App;
