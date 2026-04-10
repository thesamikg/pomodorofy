import { AlertTriangle, Pause, Play, SkipForward, Volume2 } from "lucide-react";

function Player({
  currentTrack,
  deviceId,
  isConnected,
  isPlaying,
  onConnectSpotify,
  onNextTrack,
  onTogglePlayback,
  onVolumeChange,
  playerReady,
  premiumRequired,
  spotifyError,
  user,
  volume,
}) {
  return (
    <section className="glass-panel p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-brand/50">
            Spotify Player
          </p>
          <h2 className="mt-2 font-heading text-3xl text-brand">
            Music that follows your session
          </h2>
        </div>
        {user ? (
          <div className="flex items-center gap-3 rounded-full border border-brand/10 bg-surface px-3 py-2">
            {user.images?.[0]?.url ? (
              <img
                alt={`${user.display_name} avatar`}
                className="h-10 w-10 rounded-full object-cover"
                src={user.images[0].url}
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand font-heading text-sm text-white">
                {user.display_name?.[0] || "S"}
              </div>
            )}
            <div className="hidden text-right sm:block">
              <p className="text-sm text-brand">{user.display_name}</p>
              <p className="text-xs uppercase tracking-[0.22em] text-brand/45">
                {user.product}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {!isConnected ? (
        <div className="mt-6 rounded-[24px] border border-dashed border-panel/20 bg-[rgba(75,128,144,0.08)] p-5">
          <p className="text-brand/72">
            Connect Spotify to stream playlists, auto-pause on breaks, and keep
            playback inside the app.
          </p>
          <button className="button-primary mt-5" onClick={onConnectSpotify} type="button">
            Connect Spotify
          </button>
        </div>
      ) : null}

      {premiumRequired ? (
        <div className="mt-6 rounded-[24px] border border-brand/12 bg-[rgba(75,128,144,0.08)] p-5 text-brand">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-1 h-5 w-5 shrink-0" />
            <div>
              <p className="font-medium">Spotify Premium required for playback</p>
              <p className="mt-2 text-sm text-brand/70">
                You can still use the timer, stats, and settings, but browser
                playback requires a Premium Spotify account.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {spotifyError ? (
        <div className="mt-6 rounded-[24px] border border-brand/12 bg-[rgba(75,128,144,0.08)] p-4 text-sm text-brand">
          {spotifyError}
        </div>
      ) : null}

      <div className="mt-6 rounded-[28px] border border-brand/10 bg-surface p-5">
        <div className="flex items-center gap-4">
          {currentTrack?.albumArt ? (
            <img
              alt={`${currentTrack.name} cover art`}
              className="h-20 w-20 rounded-2xl object-cover"
              src={currentTrack.albumArt}
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-brand/10 bg-[rgba(75,128,144,0.12)] text-sm text-brand/65">
              Waiting
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm uppercase tracking-[0.24em] text-brand/45">
              Now playing
            </p>
            <p className="mt-2 truncate text-lg font-medium text-brand">
              {currentTrack?.name || "Choose a playlist and start a focus block"}
            </p>
            <p className="mt-1 truncate text-sm text-brand/55">
              {currentTrack?.artist || "Playback controls appear here when Spotify is active"}
            </p>
            <p className="mt-3 text-xs uppercase tracking-[0.24em] text-brand/45">
              {playerReady && deviceId ? "Browser player ready" : "Initializing device"}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              aria-label={isPlaying ? "Pause track" : "Play track"}
              className="button-primary h-12 w-12 rounded-full p-0"
              disabled={!isConnected || premiumRequired}
              onClick={onTogglePlayback}
              type="button"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <button
              aria-label="Next track"
              className="button-secondary h-12 w-12 rounded-full p-0"
              disabled={!isConnected || premiumRequired}
              onClick={onNextTrack}
              type="button"
            >
              <SkipForward className="h-4 w-4" />
            </button>
          </div>

          <label className="flex w-full max-w-xs items-center gap-3 text-brand/70">
            <Volume2 className="h-4 w-4 shrink-0" />
            <input
              aria-label="Playback volume"
              className="h-1.5 w-full appearance-none rounded-full bg-brand/20 accent-[var(--accent)]"
              max="1"
              min="0"
              onChange={(event) => onVolumeChange(Number(event.target.value))}
              step="0.01"
              type="range"
              value={volume}
            />
          </label>
        </div>
      </div>
    </section>
  );
}

export default Player;
