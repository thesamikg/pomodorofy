import { useEffect, useState } from "react";

const defaultDurations = {
  focus: 25,
  shortBreak: 5,
  longBreak: 15,
};

function clampDuration(value, fallback) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.max(1, Math.min(60, Math.round(parsed)));
}

function durationForMode(mode, durations) {
  return clampDuration(durations[mode], defaultDurations[mode]);
}

function nextModeAfterFocus(completedFocusSessions) {
  return completedFocusSessions % 4 === 0 ? "longBreak" : "shortBreak";
}

export function useTimer({
  durations,
  autoStartNext,
  onModeTransition,
  onSessionComplete,
}) {
  const [currentMode, setCurrentMode] = useState("focus");
  const [isRunning, setIsRunning] = useState(false);
  const [completedFocusSessions, setCompletedFocusSessions] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(
    durationForMode("focus", durations) * 60,
  );
  const [taskLabel, setTaskLabel] = useState("");

  useEffect(() => {
    setRemainingSeconds(durationForMode(currentMode, durations) * 60);
  }, [currentMode, durations.focus, durations.shortBreak, durations.longBreak]);

  useEffect(() => {
    if (!isRunning) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setRemainingSeconds((seconds) => {
        if (seconds > 1) {
          return seconds - 1;
        }

        return 0;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isRunning]);

  useEffect(() => {
    if (remainingSeconds > 0 || !isRunning) {
      return;
    }

    if (currentMode === "focus") {
      const nextCompletedCount = completedFocusSessions + 1;
      const nextMode = nextModeAfterFocus(nextCompletedCount);

      setCompletedFocusSessions(nextCompletedCount);
      onSessionComplete?.({
        id: crypto.randomUUID(),
        label: taskLabel.trim() || "Deep work",
        durationMinutes: durationForMode("focus", durations),
        completedAt: new Date().toISOString(),
        dateKey: new Date().toISOString().slice(0, 10),
      });
      onModeTransition?.({ previousMode: "focus", nextMode });
      setCurrentMode(nextMode);
      setRemainingSeconds(durationForMode(nextMode, durations) * 60);
      setIsRunning(autoStartNext);
      return;
    }

    onModeTransition?.({ previousMode: currentMode, nextMode: "focus" });
    setCurrentMode("focus");
    setRemainingSeconds(durationForMode("focus", durations) * 60);
    setIsRunning(autoStartNext);
  }, [
    autoStartNext,
    completedFocusSessions,
    currentMode,
    durations,
    isRunning,
    onModeTransition,
    onSessionComplete,
    remainingSeconds,
    taskLabel,
  ]);

  const switchMode = (mode) => {
    setCurrentMode(mode);
    setIsRunning(false);
    setRemainingSeconds(durationForMode(mode, durations) * 60);
  };

  const skipSession = () => {
    const nextMode = currentMode === "focus" ? "shortBreak" : "focus";

    onModeTransition?.({ previousMode: currentMode, nextMode });
    setCurrentMode(nextMode);
    setIsRunning(false);
    setRemainingSeconds(durationForMode(nextMode, durations) * 60);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setRemainingSeconds(durationForMode(currentMode, durations) * 60);
  };

  const toggleTimer = () => {
    setIsRunning((running) => !running);
  };

  const totalSeconds = durationForMode(currentMode, durations) * 60;
  const sessionInCycle =
    currentMode === "focus"
      ? (completedFocusSessions % 4) + 1
      : Math.max(1, completedFocusSessions % 4 || 4);

  return {
    currentMode,
    isRunning,
    remainingSeconds,
    sessionInCycle,
    taskLabel,
    totalSeconds,
    completedFocusSessions,
    setTaskLabel,
    switchMode,
    skipSession,
    resetTimer,
    toggleTimer,
  };
}
