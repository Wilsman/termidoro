import React, { useEffect, useState, useRef, useCallback } from "react";
import { HistoryItem, TimerState, TimerMode } from "../types";
import { MODE_SETTINGS, COMMANDS } from "../constants";
import "../electron.d.ts";

interface TerminalProps {
  state: TimerState;
  history: HistoryItem[];
  onCommand: (mode: TimerMode | "reset" | "pause") => void;
}

function SegmentedProgressBar({ percent }: { percent: number }) {
  return (
    <div className="progress-bar-container">
      <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
      <div className="progress-bar-dots" />
    </div>
  );
}

const Terminal: React.FC<TerminalProps> = ({ state, history, onCommand }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAlwaysOnTop, setIsAlwaysOnTop] = useState(true);
  const [decorationsEnabled, setDecorationsEnabled] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const [isSuperCompact, setIsSuperCompact] = useState(true);
  const compactSizeRef = useRef<{ width: number; height: number } | null>(null);

  const MIN_WINDOW_WIDTH = 520;
  const MIN_WINDOW_HEIGHT = 240;
  const SUPER_COMPACT_HEIGHT = 240;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    window.electronAPI?.setAlwaysOnTop(true).catch(() => {});
    window.electronAPI?.setDecorations(false).catch(() => {});
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, state.isActive]);

  const formatClock = (date: Date) => {
    return date
      .toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
      .toUpperCase();
  };

  const formatEndTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const progressPercent =
    Math.round(
      ((state.totalSeconds - state.remainingSeconds) / state.totalSeconds) *
        100,
    ) || 0;

  const endTime = new Date(
    currentTime.getTime() + state.remainingSeconds * 1000,
  );
  const endTimeLabel = formatEndTime(endTime);
  const progressColor =
    state.mode === "short_break"
      ? "bg-sky-400"
      : state.mode === "long_break"
        ? "bg-cyan-300"
        : state.mode === "deep_work"
          ? "bg-amber-400"
          : "bg-emerald-400";

  const toggleAlwaysOnTop = () => {
    const next = !isAlwaysOnTop;
    setIsAlwaysOnTop(next);
    window.electronAPI?.setAlwaysOnTop(next).catch(() => {});
  };

  const toggleDecorations = () => {
    const next = !decorationsEnabled;
    setDecorationsEnabled(next);
    window.electronAPI?.setDecorations(next).catch(() => {});
  };

  const toggleSuperCompact = useCallback(async () => {
    if (!isSuperCompact) {
      try {
        const currentSize = await window.electronAPI?.getWindowSize();
        if (currentSize) {
          compactSizeRef.current = currentSize;
          const targetWidth = Math.max(Math.round(currentSize.width * 0.7), 1);
          const targetHeight = Math.min(
            currentSize.height,
            SUPER_COMPACT_HEIGHT,
          );
          await window.electronAPI?.setMinSize(targetWidth, targetHeight);
          await window.electronAPI?.setWindowSize(targetWidth, targetHeight);
        }
      } catch {}
    } else {
      try {
        if (compactSizeRef.current) {
          await window.electronAPI?.setWindowSize(
            compactSizeRef.current.width,
            compactSizeRef.current.height,
          );
        }
        await window.electronAPI?.setMinSize(
          MIN_WINDOW_WIDTH,
          MIN_WINDOW_HEIGHT,
        );
        compactSizeRef.current = null;
      } catch {}
    }

    setIsSuperCompact((prev) => !prev);
  }, [isSuperCompact]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.code === "KeyB") {
        event.preventDefault();
        const next = !decorationsEnabled;
        setDecorationsEnabled(next);
        window.electronAPI?.setDecorations(next).catch(() => {});
        return;
      }

      if (event.code === "Digit1") {
        event.preventDefault();
        onCommand("work");
      } else if (event.code === "Digit2") {
        event.preventDefault();
        onCommand("short_break");
      } else if (event.code === "Digit4") {
        event.preventDefault();
        onCommand("long_break");
      } else if (event.code === "Digit3") {
        event.preventDefault();
        onCommand("deep_work");
      } else if (event.code === "KeyR") {
        event.preventDefault();
        onCommand("reset");
      } else if (event.code === "KeyP") {
        event.preventDefault();
        onCommand("pause");
      } else if (event.code === "KeyT") {
        event.preventDefault();
        toggleAlwaysOnTop();
      } else if (event.code === "KeyC") {
        event.preventDefault();
        toggleSuperCompact();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [decorationsEnabled, onCommand, toggleSuperCompact]);

  const handleClose = () => {
    window.electronAPI?.closeWindow().catch(() => {});
  };

  const handleOpacityChange = (value: number) => {
    setOpacity(value);
    document.documentElement.style.setProperty("--app-opacity", String(value));
  };

  return (
    <div
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
      className={`flex flex-col h-full w-full bg-[#121417] ${decorationsEnabled ? "rounded-2xl border border-white/10" : "rounded-none border border-transparent"} ${isSuperCompact ? "shadow-[0_20px_50px_rgba(0,0,0,0.45)]" : "shadow-[0_30px_80px_rgba(0,0,0,0.55)]"} overflow-hidden font-mono transition-all duration-500`}
    >
      {/* Title Bar */}
      <div
        style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
        className={`flex items-center justify-between ${isSuperCompact ? "px-3 py-1.5" : "px-4 py-2"} bg-[#171b21] border-b border-white/5 shrink-0`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`h-2 w-2 rounded-full transition-colors ${state.isActive ? "bg-emerald-400 animate-pulse" : "bg-white/30"}`}
          />
          <span className="text-[10px] text-white/50 select-none tracking-[0.2em] uppercase">
            {state.isActive ? "Running" : "Paused"}
          </span>
        </div>
        <div
          className="flex items-center gap-1"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          <button
            type="button"
            onClick={toggleAlwaysOnTop}
            className={`w-7 h-7 flex items-center justify-center rounded transition-all ${isAlwaysOnTop ? "text-cyan-400 bg-cyan-400/10" : "text-white/30 hover:text-white/60 hover:bg-white/5"}`}
            title="Pin on top (T)"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L10 6.477V16h2a1 1 0 110 2H8a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onCommand("pause")}
            className="w-7 h-7 flex items-center justify-center rounded text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
            title="Pause/Resume (P)"
          >
            {state.isActive ? (
              <svg
                className="w-3.5 h-3.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-3.5 h-3.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
          <button
            type="button"
            onClick={() => onCommand("reset")}
            className="w-7 h-7 flex items-center justify-center rounded text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
            title="Reset (R)"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <div className="w-px h-4 bg-white/10 mx-1" />
          <button
            type="button"
            onClick={toggleSuperCompact}
            className={`w-7 h-7 flex items-center justify-center rounded transition-all ${!isSuperCompact ? "text-amber-400 bg-amber-400/10" : "text-white/30 hover:text-white/60 hover:bg-white/5"}`}
            title="Toggle view (C)"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              {isSuperCompact ? (
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 011.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 011.414-1.414L15 13.586V12a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              ) : (
                <path
                  fillRule="evenodd"
                  d="M5 10a1 1 0 011-1h3V6a1 1 0 112 0v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              )}
            </svg>
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className={`w-7 h-7 flex items-center justify-center rounded transition-all ${isMenuOpen ? "text-white/60 bg-white/5" : "text-white/30 hover:text-white/60 hover:bg-white/5"}`}
              title="Menu"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
            {isMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-48 bg-[#11151a] border border-white/10 rounded-lg p-2 shadow-xl z-20"
                style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
              >
                <div className="text-[9px] text-white/30 uppercase tracking-[0.15em] px-2 py-1">
                  Timer
                </div>
                {COMMANDS.map((cmd) => (
                  <button
                    key={cmd.id}
                    onClick={() => {
                      onCommand((cmd.mode as any) || "reset");
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-2 py-1.5 text-[11px] text-left text-white/60 hover:text-white hover:bg-white/5 transition rounded flex items-center justify-between"
                  >
                    <span>{cmd.id}</span>
                    <span className="text-[9px] text-white/25">
                      {cmd.mode === "work"
                        ? "1"
                        : cmd.mode === "short_break"
                          ? "2"
                          : cmd.mode === "deep_work"
                            ? "3"
                            : "4"}
                    </span>
                  </button>
                ))}
                <div className="border-t border-white/10 my-2" />
                <div className="text-[9px] text-white/30 uppercase tracking-[0.15em] px-2 py-1">
                  Settings
                </div>
                <div className="px-2 py-1.5">
                  <div className="flex items-center justify-between text-[10px] text-white/50 mb-1">
                    <span>Opacity</span>
                    <span className="tabular-nums">
                      {Math.round(opacity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.75}
                    max={1}
                    step={0.01}
                    value={opacity}
                    onChange={(event) =>
                      handleOpacityChange(Number(event.target.value))
                    }
                    className="w-full h-1 accent-cyan-400 bg-white/10 rounded-full"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    toggleDecorations();
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-2 py-1.5 text-[11px] text-left text-white/60 hover:text-white hover:bg-white/5 transition rounded"
                >
                  {decorationsEnabled ? "Hide border" : "Show border"}
                </button>
              </div>
            )}
          </div>
          <div className="w-px h-4 bg-white/10 mx-1" />
          <button
            type="button"
            onClick={handleClose}
            className="w-7 h-7 flex items-center justify-center rounded text-white/30 hover:text-rose-400 hover:bg-rose-400/10 transition-all"
            title="Close"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Terminal Content Area (Internal Scrolling) */}
      <div
        ref={scrollRef}
        className={`flex-1 flex flex-col justify-center overflow-y-auto scrollbar-hide ${isSuperCompact ? "px-3 py-2 space-y-2" : "p-5 pb-3 space-y-4"}`}
      >
        {!isSuperCompact &&
          history.slice(-1).map((item, idx) => (
            <div
              key={idx}
              className="space-y-1 animate-in fade-in duration-300"
            >
              <div className="flex items-center gap-3">
                <span className="text-cyan-400 font-bold text-lg leading-none">
                  &gt;
                </span>
                <span className="text-gray-200/80 text-sm tracking-wide">
                  {item.command}
                </span>
              </div>
              {item.output && (
                <div
                  className={`pl-7 text-xs ${item.type === "success" ? "text-emerald-400/90" : "text-white/35"} font-medium`}
                >
                  {item.output}
                </div>
              )}
            </div>
          ))}

        {/* Focus Area */}
        <div className={`${isSuperCompact ? "space-y-2" : "space-y-3 pt-1"}`}>
          {!isSuperCompact && (
            <div className="flex items-center gap-3">
              <span className="text-cyan-400 font-bold text-lg leading-none">
                &gt;
              </span>
              <span className="text-gray-300 text-sm tracking-wide">
                {state.isActive
                  ? `executing ${state.mode.replace("_", " ")}...`
                  : "awaiting task..."}
                <span className="cursor ml-2"></span>
              </span>
            </div>
          )}

          <div className={`${isSuperCompact ? "space-y-2" : "space-y-3"}`}>
            <div
              className={`text-[11px] font-bold uppercase tracking-[0.2em] ${MODE_SETTINGS[state.mode].color}`}
            >
              {MODE_SETTINGS[state.mode].label}
            </div>

            <div
              className={`${isSuperCompact ? "text-3xl" : "text-2xl"} font-light text-gray-200 flex items-center gap-3 ${state.isActive ? "drop-shadow-[0_0_16px_rgba(52,211,153,0.35)]" : ""}`}
            >
              {!isSuperCompact && (
                <>
                  <span className="tabular-nums opacity-70 text-[18px]">
                    {formatClock(currentTime).split(" ")[0]}
                  </span>
                  <span className="text-white/10 text-xl font-thin">-</span>
                </>
              )}
              <div className="flex items-baseline gap-1.5 tabular-nums">
                <span
                  className={`font-medium text-white ${state.isActive ? "animate-pulse" : ""}`}
                >
                  {formatTimer(state.remainingSeconds)}
                </span>
                <span className="text-white/20 text-xs">
                  / {formatTimer(state.totalSeconds)}
                </span>
              </div>
            </div>

            <div
              className={`text-[9px] uppercase tracking-[0.25em] ${state.isActive ? "text-emerald-300/70" : "text-white/30"}`}
            >
              Ends {endTimeLabel}
            </div>

            <div className="flex items-center gap-3 mt-1">
              <SegmentedProgressBar percent={progressPercent} />
              <div
                className={`${isSuperCompact ? "text-[9px]" : "text-[10px]"} font-bold text-white/30 tabular-nums w-8`}
              >
                {progressPercent}%
              </div>
            </div>

            {isSuperCompact && (
              <div className="flex items-center justify-between text-[10px] text-white/40 tracking-[0.2em] uppercase">
                <span>{state.isActive ? "Running" : "Idle"}</span>
                <span className="tabular-nums">{formatClock(currentTime)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {!isSuperCompact ? (
        <div className="px-5 py-2 bg-[#121417] border-t border-white/5 text-[9px] text-white/30 tracking-[0.2em] uppercase flex items-center justify-between">
          <span>
            Hotkeys: [1] Work [2] Short [3] Deep [4] Long [R] Reset [P] Pause
            [T] Pin [C] Compact
          </span>
          <div className="flex items-center gap-4">
            <span>B Border</span>
            <span className="byline">made by Wilsman</span>
          </div>
        </div>
      ) : (
        <div className="px-3 py-1.5 bg-[#121417] border-t border-white/5 text-[9px] text-white/35 tracking-[0.2em] uppercase flex items-center justify-between">
          <span>Hotkeys: [C] Full [R] Reset</span>
          <span className="byline">made by Wilsman</span>
        </div>
      )}
    </div>
  );
};

export default Terminal;
