import {
  AudioWaveform,
  CloudRain,
  Coffee,
  Flame,
  Pause,
  Play,
  Volume2,
  VolumeX,
  Waves,
} from "lucide-react";

const soundIcons = {
  rain: CloudRain,
  oceanWaves: Waves,
  brownNoise: AudioWaveform,
  coffeeShop: Coffee,
  fireplace: Flame,
};

function SoundSystem({
  activeSoundIds,
  error,
  mixEnabled,
  muted,
  onSetMixEnabled,
  onSetVolume,
  onStopAll,
  onToggleMuteAll,
  onToggleSound,
  soundOptions,
  volume,
}) {
  return (
    <section className="glass-panel p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-brand/50">
            Sound System
          </p>
          <h2 className="mt-2 font-heading text-3xl text-brand">
            Ambient layers that stay out of your way
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-brand/65">
            Choose one focus texture or turn on mix mode to blend two together.
            The last selected setup returns automatically when a focus session starts.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <label className="inline-flex items-center gap-3 rounded-full border border-brand/10 bg-surface px-4 py-3 text-sm text-brand">
            <input
              aria-label="Enable sound mixing"
              checked={mixEnabled}
              className="h-4 w-4 accent-accent"
              onChange={(event) => onSetMixEnabled(event.target.checked)}
              type="checkbox"
            />
            Mix 2 sounds
          </label>
          <button
            className={muted ? "button-primary gap-2" : "button-secondary gap-2"}
            onClick={onToggleMuteAll}
            type="button"
          >
            <VolumeX className="h-4 w-4" />
            {muted ? "Muted" : "Mute all"}
          </button>
          <button className="button-secondary gap-2" onClick={onStopAll} type="button">
            Stop all
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {soundOptions.map((sound) => {
          const Icon = soundIcons[sound.id] || AudioWaveform;
          const active = activeSoundIds.includes(sound.id);

          return (
            <article
              key={sound.id}
              className={`rounded-[24px] border px-4 py-4 transition ${
                active
                  ? "border-panel/35 bg-[rgba(75,128,144,0.1)] shadow-[0_16px_36px_rgba(39,75,120,0.08)]"
                  : "border-brand/10 bg-surface"
              }`}
            >
              <div className="flex flex-col gap-4 sm:gap-5">
                <div className="flex min-w-0 items-center gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                      active
                        ? "bg-brand text-white"
                        : "border border-brand/10 bg-[rgba(75,128,144,0.08)] text-panel"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="min-w-0 text-lg font-medium leading-tight text-brand">
                    {sound.label}
                  </h3>
                </div>
                <button
                  aria-label={active ? `Pause ${sound.label}` : `Play ${sound.label}`}
                  className={`h-11 w-full justify-center gap-2 sm:w-auto sm:self-start ${
                    active ? "button-primary px-5" : "button-secondary px-5"
                  }`}
                  onClick={() => onToggleSound(sound.id)}
                  type="button"
                >
                  {active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {active ? "Pause" : "Play"}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-6 rounded-[24px] border border-brand/10 bg-surface px-4 py-4">
        <label className="flex items-center gap-3 text-sm text-brand/70">
          <Volume2 className="h-4 w-4 shrink-0 text-panel" />
          <span className="min-w-[76px] text-brand">Volume</span>
          <input
            aria-label="Ambient sound volume"
            className="h-1.5 w-full appearance-none rounded-full bg-brand/15 accent-[var(--accent)]"
            max="1"
            min="0"
            onChange={(event) => onSetVolume(Number(event.target.value))}
            step="0.01"
            type="range"
            value={volume}
          />
          <span className="w-10 text-right text-xs text-brand/55">
            {Math.round(volume * 100)}%
          </span>
        </label>
      </div>

      {mixEnabled ? (
        <p className="mt-5 text-sm text-brand/58">
          Mix mode lets two sounds run together. Starting a third sound replaces the
          current secondary layer automatically.
        </p>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-[20px] border border-brand/12 bg-[rgba(75,128,144,0.08)] px-4 py-3 text-sm text-brand/72">
          {error}
        </div>
      ) : null}
    </section>
  );
}

export default SoundSystem;
