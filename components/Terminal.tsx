import React, { useEffect, useState, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { HistoryItem, TimerState, TimerMode } from "../types";
import { MODE_SETTINGS, COMMANDS } from "../constants";

interface TerminalProps {
  state: TimerState;
  history: HistoryItem[];
  onCommand: (mode: TimerMode | "reset") => void;
}

const Terminal: React.FC<TerminalProps> = ({ state, history, onCommand }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAlwaysOnTop, setIsAlwaysOnTop] = useState(false);
  const [decorationsEnabled, setDecorationsEnabled] = useState(false);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, state.isActive]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.code === "KeyB") {
        event.preventDefault();
        const next = !decorationsEnabled;
        setDecorationsEnabled(next);
        invoke("set_decorations", { enabled: next }).catch(() => {});
        return;
      }

      if (event.code === "Digit1") {
        event.preventDefault();
        onCommand("work");
      } else if (event.code === "Digit2") {
        event.preventDefault();
        onCommand("short_break");
      } else if (event.code === "Digit3") {
        event.preventDefault();
        onCommand("deep_work");
      } else if (event.code === "KeyR") {
        event.preventDefault();
        onCommand("reset");
      } else if (event.code === "KeyP") {
        event.preventDefault();
        toggleAlwaysOnTop();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [decorationsEnabled, onCommand]);

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
  const progressColor =
    state.mode === "short_break"
      ? "bg-sky-400"
      : state.mode === "deep_work"
        ? "bg-amber-400"
        : "bg-emerald-400";

  const toggleAlwaysOnTop = () => {
    const next = !isAlwaysOnTop;
    setIsAlwaysOnTop(next);
    invoke("set_always_on_top", { enabled: next }).catch(() => {});
  };

  const toggleDecorations = () => {
    const next = !decorationsEnabled;
    setDecorationsEnabled(next);
    invoke("set_decorations", { enabled: next }).catch(() => {});
  };

  const handleClose = () => {
    const appWindow = getCurrentWindow();
    appWindow.close().catch(() => {});
  };

  const handleOpacityChange = (value: number) => {
    setOpacity(value);
    document.documentElement.style.setProperty("--app-opacity", String(value));
  };

  return (
    <div
      data-tauri-drag-region
      className={`flex flex-col h-full w-full bg-[#121417] ${decorationsEnabled ? "rounded-2xl border border-white/10" : "rounded-none border border-transparent"} shadow-[0_30px_80px_rgba(0,0,0,0.55)] overflow-hidden font-mono transition-all duration-500`}
    >
      {/* Title Bar */}
      <div
        data-tauri-drag-region
        className="flex items-center justify-between px-4 py-2 bg-[#171b21] border-b border-white/5 shrink-0"
      >
        <div data-tauri-drag-region className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${state.isActive ? "bg-emerald-400/90" : "bg-white/40"}`}
          ></div>
          <div className="text-[10px] text-white/60 select-none tracking-[0.25em] uppercase">
            TermiDoro
          </div>
        </div>
        <div className="flex items-center gap-2" data-tauri-drag-region="false">
          <button
            type="button"
            onClick={toggleAlwaysOnTop}
            data-tauri-drag-region="false"
            className={`text-[10px] px-2 py-1 rounded-md border ${isAlwaysOnTop ? "border-cyan-400/50 text-cyan-300" : "border-white/10 text-white/40"} hover:text-white/70 transition`}
          >
            Pin
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              data-tauri-drag-region="false"
              className="text-[10px] px-2 py-1 rounded-md border border-white/10 text-white/50 hover:text-white/80 transition"
            >
              Menu
            </button>
            {isMenuOpen && (
              <div
                data-tauri-drag-region="false"
                className="absolute right-0 mt-2 w-56 bg-[#11151a] border border-white/10 rounded-lg p-3 shadow-xl z-20"
              >
                <div className="text-[9px] text-white/30 uppercase tracking-[0.2em]">
                  Quick Actions
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {COMMANDS.map((cmd) => (
                    <button
                      key={cmd.id}
                      onClick={() => onCommand((cmd.mode as any) || "reset")}
                      data-tauri-drag-region="false"
                      className="px-2 py-1.5 text-[10px] text-left border border-white/10 bg-[#1b2026] hover:bg-[#242a31] hover:border-cyan-400/30 text-gray-300 transition rounded-md group flex items-center gap-2"
                    >
                      <span className="text-cyan-300 font-bold group-hover:scale-110 transition-transform">
                        $
                      </span>
                      <span className="opacity-80 group-hover:opacity-100 font-medium">
                        {cmd.id}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="mt-3 border-t border-white/10 pt-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-[9px] text-white/40 uppercase tracking-[0.2em]">
                      Opacity
                    </div>
                    <div className="text-[9px] text-white/40 tabular-nums">
                      {Math.round(opacity * 100)}%
                    </div>
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
                    data-tauri-drag-region="false"
                    className="w-full h-1 accent-cyan-400 bg-white/10 rounded-full"
                  />
                  <button
                    type="button"
                    onClick={toggleDecorations}
                    data-tauri-drag-region="false"
                    className="w-full px-2 py-1.5 text-[10px] text-left border border-white/10 bg-[#1b2026] hover:bg-[#242a31] hover:border-cyan-400/30 text-gray-300 transition rounded-md"
                  >
                    {decorationsEnabled
                      ? "Hide Window Border"
                      : "Show Window Border"}
                  </button>
                  <div className="text-[9px] text-white/25">Hotkey: B</div>
                </div>
              </div>
            )}
          </div>
          <div className="text-[9px] text-white/35 select-none tracking-[0.2em] uppercase">
            {state.isActive ? "Running" : "Idle"}
          </div>
          <button
            type="button"
            onClick={handleClose}
            data-tauri-drag-region="false"
            className="text-[10px] px-2 py-1 rounded-md border border-white/10 text-white/50 hover:text-white/80 hover:border-rose-400/40 transition ml-1"
          >
            Close
          </button>
        </div>
      </div>

      {/* Terminal Content Area (Internal Scrolling) */}
      <div
        ref={scrollRef}
        className="flex-1 flex flex-col justify-center p-5 pb-3 overflow-y-auto space-y-4 scrollbar-hide"
      >
        {history.slice(-1).map((item, idx) => (
          <div key={idx} className="space-y-1 animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <span className="text-cyan-400 font-bold text-lg leading-none">
                ❯
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
        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-3">
            <span className="text-cyan-400 font-bold text-lg leading-none">
              ❯
            </span>
            <span className="text-gray-300 text-sm tracking-wide">
              {state.isActive
                ? `executing ${state.mode.replace("_", " ")}...`
                : "awaiting task..."}
              <span className="cursor ml-2"></span>
            </span>
          </div>

          <div className="space-y-3">
            <div
              className={`text-[11px] font-bold uppercase tracking-[0.2em] ${MODE_SETTINGS[state.mode].color}`}
            >
              {MODE_SETTINGS[state.mode].label}
            </div>

            <div className="text-2xl font-light text-gray-200 flex items-center gap-3">
              <span className="tabular-nums opacity-70 text-[18px]">
                {formatClock(currentTime).split(" ")[0]}
              </span>
              <span className="text-white/10 text-xl font-thin">—</span>
              <div className="flex items-baseline gap-1.5 tabular-nums">
                <span className="font-medium text-white">
                  {formatTimer(state.remainingSeconds)}
                </span>
                <span className="text-white/20 text-xs">
                  / {formatTimer(state.totalSeconds)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-1">
              <div className="relative h-[6px] flex-1 bg-white/[0.03] rounded-full overflow-hidden border border-white/10">
                <div
                  className={`h-full transition-all duration-1000 ease-linear ${progressColor}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="text-[10px] font-bold text-white/30 tabular-nums w-8">
                {progressPercent}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-2 bg-[#121417] border-t border-white/5 text-[9px] text-white/30 tracking-[0.2em] uppercase flex items-center justify-between">
        <span>Hotkeys: [1] Work [2] Short [3] Deep [R] Reset [P] Pin</span>
        <div className="flex items-center gap-4">
          <span>B Border</span>
          <span className="byline">made by Wilsman</span>
        </div>
      </div>
    </div>
  );
};

export default Terminal;
