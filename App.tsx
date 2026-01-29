import React, { useState, useEffect, useCallback, useRef } from "react";
import Terminal from "./components/Terminal";
import { TimerState, TimerMode, HistoryItem } from "./types";
import { MODE_SETTINGS } from "./constants";

const LONG_BREAK_AFTER_CYCLES = 4;
const TRANSITION_DELAY_MS = 2200;

const App: React.FC = () => {
  const [state, setState] = useState<TimerState>({
    remainingSeconds: MODE_SETTINGS.work.duration,
    totalSeconds: MODE_SETTINGS.work.duration,
    isActive: false,
    mode: "work",
    completedCycles: 0,
  });

  const [history, setHistory] = useState<HistoryItem[]>([
    {
      timestamp: new Date().toISOString(),
      command: "system initialize",
      output: "TermiDoro v1.0.4 loaded successfully.",
      type: "success",
    },
  ]);

  const addHistory = useCallback(
    (command: string, output: string, type: HistoryItem["type"] = "info") => {
      setHistory((prev) => [
        ...prev,
        { timestamp: new Date().toISOString(), command, output, type },
      ]);
    },
    [],
  );

  const transitionTimeoutRef = useRef<number | null>(null);
  const [transition, setTransition] = useState<null | {
    from: TimerMode;
    to: TimerMode;
    key: number;
  }>(null);

  const clearTransition = useCallback(() => {
    if (transitionTimeoutRef.current !== null) {
      window.clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
    setTransition(null);
  }, []);

  const startMode = useCallback(
    (mode: TimerMode, reason: "manual" | "auto") => {
      const newDuration = MODE_SETTINGS[mode].duration;
      setState((prev) => ({
        ...prev,
        mode,
        totalSeconds: newDuration,
        remainingSeconds: newDuration,
        isActive: true,
      }));
      const prefix = reason === "auto" ? "auto" : "start";
      addHistory(
        `${prefix} ${mode}`,
        `Sequence started. Duration set to ${MODE_SETTINGS[mode].duration / 60}m.`,
        "command",
      );
    },
    [addHistory],
  );

  const handleCommand = useCallback(
    (action: TimerMode | "reset" | "pause") => {
      clearTransition();
      if (action === "reset") {
        setState((prev) => ({
          ...prev,
          remainingSeconds: MODE_SETTINGS[prev.mode].duration,
          isActive: false,
        }));
        addHistory(
          "reset",
          "Timer state flushed. Awaiting new instructions.",
          "info",
        );
        return;
      }

      if (action === "pause") {
        setState((prev) => {
          const newActive = !prev.isActive;
          addHistory(
            newActive ? "resume" : "pause",
            newActive ? "Timer resumed." : "Timer paused.",
            "info",
          );
          return { ...prev, isActive: newActive };
        });
        return;
      }

      startMode(action, "manual");
    },
    [addHistory, clearTransition, startMode],
  );

  useEffect(() => {
    let interval: number | undefined;

    if (state.isActive && state.remainingSeconds > 0) {
      interval = window.setInterval(() => {
        setState((prev) => ({
          ...prev,
          remainingSeconds: prev.remainingSeconds - 1,
        }));
      }, 1000);
    } else if (state.remainingSeconds === 0 && state.isActive) {
      const completedMode = state.mode;
      const nextCycles =
        completedMode === "work" || completedMode === "deep_work"
          ? state.completedCycles + 1
          : state.completedCycles;

      const nextMode: TimerMode =
        completedMode === "work" || completedMode === "deep_work"
          ? nextCycles % LONG_BREAK_AFTER_CYCLES === 0
            ? "long_break"
            : "short_break"
          : "work";

      addHistory(
        `task_finish --id ${completedMode}`,
        `Objective reached. Executing transition sequence to ${MODE_SETTINGS[nextMode].label}.`,
        "success",
      );

      setState((prev) => ({
        ...prev,
        isActive: false,
        completedCycles: nextCycles,
      }));

      setTransition({ from: completedMode, to: nextMode, key: Date.now() });
      transitionTimeoutRef.current = window.setTimeout(() => {
        setTransition(null);
        transitionTimeoutRef.current = null;
        startMode(nextMode, "auto");
      }, TRANSITION_DELAY_MS);

      try {
        const audio = new Audio(
          "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
        );
        audio.play();
      } catch (e) {
        console.warn("Audio playback failed");
      }
    }

    return () => clearInterval(interval);
  }, [
    state.isActive,
    state.remainingSeconds,
    state.mode,
    state.completedCycles,
    addHistory,
    startMode,
  ]);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current !== null) {
        window.clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className={`app-shell ${transition ? `is-transitioning mode-${transition.to}` : ""}`}
      data-transition-key={transition?.key || 0}
    >
      <div className="bg-layer" />
      <div className="celebration-layer" />
      <div className="celebration-streaks" />
      <div className="grid-layer pointer-events-none" />
      <div className="window-frame">
        <Terminal state={state} history={history} onCommand={handleCommand} />
      </div>
    </div>
  );
};

export default App;
