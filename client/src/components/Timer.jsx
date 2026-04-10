import { motion } from "framer-motion";
import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";

const modeLabels = {
  focus: "Focus",
  shortBreak: "Short Break",
  longBreak: "Long Break",
};

function formatTime(seconds) {
  const safeSeconds = Math.max(0, seconds);
  const minutes = String(Math.floor(safeSeconds / 60)).padStart(2, "0");
  const remainder = String(safeSeconds % 60).padStart(2, "0");
  return `${minutes}:${remainder}`;
}

function Timer({
  currentMode,
  isRunning,
  onModeSelect,
  onReset,
  onSkip,
  onToggle,
  remainingSeconds,
  sessionInCycle,
  setTaskLabel,
  taskLabel,
  totalSeconds,
}) {
  const progress = totalSeconds > 0 ? remainingSeconds / totalSeconds : 0;
  const radius = 114;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <section className="glass-panel p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-brand/50">
            Timer
          </p>
          <h2 className="mt-2 font-heading text-3xl text-brand">
            Session {sessionInCycle} of 4
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(modeLabels).map(([mode, label]) => (
            <button
              key={mode}
              aria-pressed={currentMode === mode}
              className={`rounded-full px-4 py-2 text-sm transition ${
                currentMode === mode
                  ? "border border-panel/25 bg-panel text-white"
                  : "border border-brand/10 bg-surface text-brand hover:border-panel/30"
              }`}
              onClick={() => onModeSelect(mode)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
        <div className="mx-auto flex shrink-0 flex-col items-center">
          <div className="relative h-[220px] w-[220px] sm:h-[280px] sm:w-[280px]">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 260 260">
              <circle
                className="stroke-brand/12"
                cx="130"
                cy="130"
                fill="none"
                r={radius}
                strokeWidth="10"
              />
              <motion.circle
                animate={{ strokeDashoffset }}
                className="stroke-panel"
                cx="130"
                cy="130"
                fill="none"
                r={radius}
                strokeLinecap="round"
                strokeWidth="10"
                style={{ strokeDasharray: circumference }}
                transition={{ duration: 0.45, ease: "easeInOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <p className="text-xs uppercase tracking-[0.28em] text-panel/80 sm:text-sm">
                {modeLabels[currentMode]}
              </p>
              <p className="mt-3 font-heading text-5xl leading-none text-brand tabular-nums sm:text-7xl">
                {formatTime(remainingSeconds)}
              </p>
            </div>
          </div>
          <p className="mt-4 text-center text-sm text-brand/50">
            Space start/pause, R reset, S skip
          </p>
        </div>

        <div className="w-full max-w-xl lg:pt-8">
          <label className="block text-sm uppercase tracking-[0.24em] text-brand/50">
            What are you working on?
          </label>
          <input
            className="input-shell mt-4 w-full px-5 py-4 text-base sm:px-6 sm:text-xl"
            maxLength={80}
            onChange={(event) => setTaskLabel(event.target.value)}
            placeholder="Ship onboarding flow, write proposal, debug auth..."
            value={taskLabel}
          />

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <button
              aria-label={isRunning ? "Pause timer" : "Start timer"}
              className="button-primary min-h-[56px] gap-2"
              onClick={onToggle}
              type="button"
            >
              {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isRunning ? "Pause" : "Start"}
            </button>
            <button
              aria-label="Reset timer"
              className="button-secondary min-h-[56px] gap-2"
              onClick={onReset}
              type="button"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
            <button
              aria-label="Skip to next session"
              className="button-secondary min-h-[56px] gap-2"
              onClick={onSkip}
              type="button"
            >
              <SkipForward className="h-4 w-4" />
              Skip
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Timer;
