const isBrowser = typeof window !== "undefined";

export function readStoredJSON(key, fallbackValue) {
  if (!isBrowser) {
    return fallbackValue;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallbackValue;
  } catch {
    return fallbackValue;
  }
}

export function writeStoredJSON(key, value) {
  if (!isBrowser) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getTodayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function getFocusMinutesToday(history) {
  const todayKey = getTodayKey();

  return history
    .filter((entry) => entry.dateKey === todayKey)
    .reduce((total, entry) => total + entry.durationMinutes, 0);
}

export function getSessionsCompletedToday(history) {
  const todayKey = getTodayKey();
  return history.filter((entry) => entry.dateKey === todayKey).length;
}

export function getCurrentStreak(history) {
  if (!history.length) {
    return 0;
  }

  const completionDays = new Set(history.map((entry) => entry.dateKey));
  let streak = 0;
  let currentDate = new Date();

  while (completionDays.has(getTodayKey(currentDate))) {
    streak += 1;
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
}

export function getWeeklyChartData(history) {
  const entriesByDay = new Map();

  for (let index = 6; index >= 0; index -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - index);
    const key = getTodayKey(date);

    entriesByDay.set(key, {
      label: date.toLocaleDateString(undefined, { weekday: "short" }),
      minutes: 0,
    });
  }

  history.forEach((entry) => {
    if (entriesByDay.has(entry.dateKey)) {
      entriesByDay.get(entry.dateKey).minutes += entry.durationMinutes;
    }
  });

  return Array.from(entriesByDay.values());
}
