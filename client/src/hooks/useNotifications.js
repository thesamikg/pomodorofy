import { useEffect, useRef, useState } from "react";

const alarmPatterns = {
  aurora: [
    [587.33, 0.18],
    [739.99, 0.18],
    [880.0, 0.26],
  ],
  pulse: [
    [440.0, 0.12],
    [554.37, 0.12],
    [659.25, 0.2],
    [880.0, 0.24],
  ],
  glass: [
    [783.99, 0.16],
    [987.77, 0.14],
    [1174.66, 0.28],
  ],
};

export function useNotifications() {
  const [permission, setPermission] = useState(
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "unsupported",
  );
  const audioContextRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setPermission(Notification.permission);
    }, 1500);

    return () => window.clearInterval(intervalId);
  }, []);

  const requestPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "unsupported";
    }

    const nextPermission = await Notification.requestPermission();
    setPermission(nextPermission);
    return nextPermission;
  };

  const playAlarm = async ({ enabled, volume, sound }) => {
    if (!enabled) {
      return;
    }

    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
      return;
    }

    const audioContext =
      audioContextRef.current || new AudioContextClass();

    audioContextRef.current = audioContext;

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    let currentTime = audioContext.currentTime;
    const pattern = alarmPatterns[sound] || alarmPatterns.aurora;

    pattern.forEach(([frequency, duration], index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const attack = 0.02;
      const release = duration;

      oscillator.type = index % 2 === 0 ? "sine" : "triangle";
      oscillator.frequency.setValueAtTime(frequency, currentTime);

      gainNode.gain.setValueAtTime(0.001, currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        Math.max(0.02, volume * 0.16),
        currentTime + attack,
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        currentTime + release,
      );

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.start(currentTime);
      oscillator.stop(currentTime + release);
      currentTime += duration * 0.92;
    });
  };

  const sendNotification = ({ title, body }) => {
    if (permission !== "granted") {
      return;
    }

    new Notification(title, {
      body,
      silent: true,
    });
  };

  return {
    permission,
    playAlarm,
    requestPermission,
    sendNotification,
  };
}
