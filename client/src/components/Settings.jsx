import { AnimatePresence, motion } from "framer-motion";
import { Bell, LogOut, SlidersHorizontal, X } from "lucide-react";

const soundOptions = [
  { id: "aurora", label: "Aurora" },
  { id: "pulse", label: "Pulse" },
  { id: "glass", label: "Glass" },
];

function Settings({
  notificationPermission,
  onClose,
  onDisconnectSpotify,
  onRequestPermission,
  onSettingsChange,
  open,
  settings,
}) {
  const updateDuration = (mode, value) => {
    onSettingsChange({
      ...settings,
      durations: {
        ...settings.durations,
        [mode]: Math.max(1, Math.min(60, Number(value) || 1)),
      },
    });
  };

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            aria-label="Close settings"
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            onClick={onClose}
            type="button"
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            aria-label="Settings panel"
            className="fixed right-0 top-0 z-50 h-screen w-full max-w-xl border-l border-brand/10 bg-surface p-5 sm:p-6"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-brand/45">
                  Settings
                </p>
                <h2 className="mt-2 font-heading text-3xl text-brand">
                  Tune the ritual
                </h2>
              </div>
              <button
                aria-label="Close settings panel"
                className="button-secondary h-11 w-11 rounded-full p-0"
                onClick={onClose}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-8 space-y-6 overflow-y-auto pb-10">
              <section className="rounded-[28px] border border-brand/10 bg-surface p-5">
                <div className="flex items-center gap-3">
                  <SlidersHorizontal className="h-4 w-4 text-panel" />
                  <h3 className="font-medium text-brand">Timer durations</h3>
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  {[
                    ["focus", "Focus"],
                    ["shortBreak", "Short Break"],
                    ["longBreak", "Long Break"],
                  ].map(([mode, label]) => (
                    <label key={mode} className="block">
                      <span className="mb-2 block text-sm text-brand/58">{label}</span>
                      <input
                        className="input-shell w-full"
                        max="60"
                        min="1"
                        onChange={(event) => updateDuration(mode, event.target.value)}
                        type="number"
                        value={settings.durations[mode]}
                      />
                    </label>
                  ))}
                </div>
              </section>

              <section className="rounded-[28px] border border-brand/10 bg-surface p-5">
                <div className="flex items-center gap-3">
                  <Bell className="h-4 w-4 text-panel" />
                  <h3 className="font-medium text-brand">Session flow</h3>
                </div>
                <label className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-panel/20 bg-[rgba(75,128,144,0.08)] px-4 py-4">
                  <div>
                    <p className="text-brand">Auto-start next session</p>
                    <p className="mt-1 text-sm text-brand/65">
                      Automatically move into the next focus or break block.
                    </p>
                  </div>
                  <input
                    aria-label="Auto-start next session"
                    checked={settings.autoStartNext}
                    className="h-5 w-5 accent-accent"
                    onChange={(event) =>
                      onSettingsChange({
                        ...settings,
                        autoStartNext: event.target.checked,
                      })
                    }
                    type="checkbox"
                  />
                </label>

                <label className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-panel/20 bg-[rgba(75,128,144,0.08)] px-4 py-4">
                  <div>
                    <p className="text-brand">Notification sound</p>
                    <p className="mt-1 text-sm text-brand/65">
                      Play a short end-of-session chime.
                    </p>
                  </div>
                  <input
                    aria-label="Enable notification sound"
                    checked={settings.notificationsEnabled}
                    className="h-5 w-5 accent-accent"
                    onChange={(event) =>
                      onSettingsChange({
                        ...settings,
                        notificationsEnabled: event.target.checked,
                      })
                    }
                    type="checkbox"
                  />
                </label>

                <div className="mt-4 grid gap-4 sm:grid-cols-[1.05fr_0.95fr]">
                  <label>
                    <span className="mb-2 block text-sm text-brand/58">
                      Alarm sound
                    </span>
                    <select
                      aria-label="Alarm sound"
                      className="input-shell w-full"
                      onChange={(event) =>
                        onSettingsChange({
                          ...settings,
                          alarmSound: event.target.value,
                        })
                      }
                      value={settings.alarmSound}
                    >
                      {soundOptions.map((sound) => (
                        <option key={sound.id} value={sound.id}>
                          {sound.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span className="mb-2 block text-sm text-brand/58">
                      Alarm volume
                    </span>
                    <input
                      aria-label="Alarm volume"
                      className="mt-3 h-2 w-full accent-accent"
                      max="1"
                      min="0"
                      onChange={(event) =>
                        onSettingsChange({
                          ...settings,
                          notificationVolume: Number(event.target.value),
                        })
                      }
                      step="0.01"
                      type="range"
                      value={settings.notificationVolume}
                    />
                  </label>
                </div>
              </section>

              <section className="rounded-[28px] border border-brand/10 bg-surface p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-brand">Desktop notifications</h3>
                    <p className="mt-1 text-sm text-brand/58">
                      Current permission: {notificationPermission}
                    </p>
                  </div>
                  <button className="button-secondary" onClick={onRequestPermission} type="button">
                    Enable alerts
                  </button>
                </div>
              </section>

              <button
                className="button-secondary w-full justify-center gap-2"
                onClick={onDisconnectSpotify}
                type="button"
              >
                <LogOut className="h-4 w-4" />
                Disconnect Spotify
              </button>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}

export default Settings;
