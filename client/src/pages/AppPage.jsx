import { Settings2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import BrandMark from "../components/BrandMark";
import Player from "../components/Player";
import Playlist from "../components/Playlist";
import Settings from "../components/Settings";
import SoundSystem from "../components/SoundSystem";
import Stats from "../components/Stats";
import Timer from "../components/Timer";
import { useNotifications } from "../hooks/useNotifications";
import { useSoundSystem } from "../hooks/useSoundSystem";
import { useSpotify } from "../hooks/useSpotify";
import { useTimer } from "../hooks/useTimer";
import { readStoredJSON, writeStoredJSON } from "../lib/storage";

const defaultSettings = {
  durations: {
    focus: 25,
    shortBreak: 5,
    longBreak: 15,
  },
  autoStartNext: false,
  notificationsEnabled: true,
  notificationVolume: 0.65,
  alarmSound: "aurora",
};

function AppPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const authError = searchParams.get("error");
  const [settings, setSettings] = useState(() => {
    const storedSettings = readStoredJSON("pomodorofy-settings", {});

    return {
      ...defaultSettings,
      ...storedSettings,
      durations: {
        ...defaultSettings.durations,
        ...storedSettings.durations,
      },
    };
  });
  const [history, setHistory] = useState(() =>
    readStoredJSON("pomodorofy-session-history", []),
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [authProcessing, setAuthProcessing] = useState(false);
  const notifications = useNotifications();
  const soundSystem = useSoundSystem();
  const spotify = useSpotify();
  const timer = useTimer({
    durations: settings.durations,
    autoStartNext: settings.autoStartNext,
    onSessionComplete: (session) => {
      setHistory((previous) => {
        const nextHistory = [session, ...previous].slice(0, 250);
        writeStoredJSON("pomodorofy-session-history", nextHistory);
        return nextHistory;
      });

      notifications.playAlarm({
        enabled: settings.notificationsEnabled,
        volume: settings.notificationVolume,
        sound: settings.alarmSound,
      });
      notifications.sendNotification({
        title: "Focus block complete",
        body: `${session.label} finished. ${session.durationMinutes} minutes captured.`,
      });
    },
    onModeTransition: ({ nextMode }) => {
      if (spotify.authState !== "connected" || !spotify.selectedPlaylistId) {
        return;
      }

      if (nextMode === "focus") {
        spotify.resumePlayback().catch((error) => {
          spotify.setSpotifyError(error.message);
        });
        return;
      }

      spotify.pausePlayback().catch(() => {});
    },
  });

  useEffect(() => {
    writeStoredJSON("pomodorofy-settings", settings);
  }, [settings]);

  useEffect(() => {
    if (authError) {
      spotify.setSpotifyError(
        "Spotify login was cancelled before the app could connect your account.",
      );
      navigate("/app", { replace: true });
      return;
    }

    if (!code || !state) {
      return;
    }

    let ignore = false;

    const completeAuth = async () => {
      try {
        setAuthProcessing(true);
        await spotify.completeSpotifyAuth({ code, state });
        if (!ignore) {
          navigate("/app", { replace: true });
        }
      } catch {
        if (!ignore) {
          navigate("/app", { replace: true });
        }
      } finally {
        if (!ignore) {
          setAuthProcessing(false);
        }
      }
    };

    completeAuth();

    return () => {
      ignore = true;
    };
  }, [authError, code, navigate, state]);

  useEffect(() => {
    const handleKeydown = (event) => {
      const tagName = event.target?.tagName;
      const isTyping =
        tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT";

      if (isTyping || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        handleTimerToggle();
      }

      if (event.key.toLowerCase() === "r") {
        timer.resetTimer();
      }

      if (event.key.toLowerCase() === "s") {
        timer.skipSession();
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  });

  const handleTimerToggle = async () => {
    if (!timer.isRunning && timer.currentMode === "focus") {
      await soundSystem.autoPlaySelectedSounds();
    }

    if (
      connected &&
      !timer.isRunning &&
      timer.currentMode === "focus" &&
      spotify.selectedPlaylistId
    ) {
      try {
        await spotify.resumePlayback();
      } catch (error) {
        spotify.setSpotifyError(error.message);
      }
    }

    timer.toggleTimer();
  };

  const connected = spotify.authState === "connected";

  return (
    <div className="page-shell">
      <div className="section-shell pt-5">
        <header className="glass-panel flex flex-col gap-5 px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <Link className="flex min-w-0 items-center gap-3" to="/">
            <BrandMark className="h-11 w-11 shrink-0" />
            <div className="min-w-0">
              <p className="truncate font-heading text-xl text-brand">Pomodorofy</p>
              <p className="truncate text-sm text-brand/55">
                Deep work timer with Spotify playback control
              </p>
            </div>
          </Link>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            {spotify.user ? (
              <div className="flex min-w-0 items-center gap-3 rounded-full border border-brand/10 bg-surface px-3 py-2 sm:max-w-[280px]">
                {spotify.user.images?.[0]?.url ? (
                  <img
                    alt={`${spotify.user.display_name} avatar`}
                    className="h-10 w-10 rounded-full object-cover"
                    src={spotify.user.images[0].url}
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand font-heading text-white">
                    {spotify.user.display_name?.[0] || "S"}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm text-brand">{spotify.user.display_name}</p>
                  <p className="truncate text-xs text-brand/55">Spotify connected</p>
                </div>
              </div>
            ) : null}
            <button
              aria-label="Open settings"
              className="button-secondary w-full gap-2 sm:w-auto"
              onClick={() => setSettingsOpen(true)}
              type="button"
            >
              <Settings2 className="h-4 w-4" />
              Settings
            </button>
            <Link className="button-secondary w-full sm:w-auto" to="/">
              Back to landing
            </Link>
          </div>
        </header>
      </div>

      <main className="section-shell pb-14 pt-8 sm:pt-10">
        <div className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-5">
            <Timer
              currentMode={timer.currentMode}
              isRunning={timer.isRunning}
              onModeSelect={timer.switchMode}
              onReset={timer.resetTimer}
              onSkip={timer.skipSession}
              onToggle={handleTimerToggle}
              remainingSeconds={timer.remainingSeconds}
              sessionInCycle={timer.sessionInCycle}
              setTaskLabel={timer.setTaskLabel}
              taskLabel={timer.taskLabel}
              totalSeconds={timer.totalSeconds}
            />
            <Stats history={history} />
          </div>

          <div className="space-y-5">
            <Player
              currentTrack={spotify.currentTrack}
              deviceId={spotify.deviceId}
              isConnected={connected}
              isPlaying={spotify.isPlaying}
              onConnectSpotify={spotify.connectSpotify}
              onNextTrack={spotify.nextTrack}
              onTogglePlayback={spotify.togglePlayback}
              onVolumeChange={spotify.setVolume}
              playerReady={spotify.playerReady}
              premiumRequired={spotify.premiumRequired}
              spotifyError={spotify.spotifyError}
              user={spotify.user}
              volume={spotify.volume}
            />
            <SoundSystem
              activeSoundIds={soundSystem.activeSoundIds}
              error={soundSystem.error}
              mixEnabled={soundSystem.mixEnabled}
              muted={soundSystem.muted}
              onSetMixEnabled={soundSystem.setMixEnabled}
              onSetVolume={soundSystem.setVolume}
              onStopAll={soundSystem.stopAll}
              onToggleMuteAll={soundSystem.toggleMuteAll}
              onToggleSound={soundSystem.toggleSound}
              soundOptions={soundSystem.soundOptions}
              volume={soundSystem.volume}
            />
            <Playlist
              onPlaySelected={() =>
                spotify.playPlaylist().catch((error) => {
                  spotify.setSpotifyError(error.message);
                })
              }
              onRefresh={() =>
                spotify.fetchPlaylists().catch((error) => {
                  spotify.setSpotifyError(error.message);
                })
              }
              playlists={spotify.playlists}
              selectedPlaylistId={spotify.selectedPlaylistId}
              setSelectedPlaylistId={spotify.setSelectedPlaylistId}
            />
          </div>
        </div>

        {!connected ? (
          <div className="mt-5 rounded-[28px] border border-dashed border-[rgba(75,128,144,0.18)] bg-[rgba(75,128,144,0.08)] px-5 py-4 text-sm text-brand/75">
            {authProcessing
              ? "Finishing Spotify login..."
              : "You can use the timer without Spotify, but connecting unlocks playlist search, browser playback, and auto-pause/resume between sessions."}
          </div>
        ) : null}
      </main>

      <Settings
        notificationPermission={notifications.permission}
        onClose={() => setSettingsOpen(false)}
        onDisconnectSpotify={spotify.disconnectSpotify}
        onRequestPermission={notifications.requestPermission}
        onSettingsChange={setSettings}
        open={settingsOpen}
        settings={settings}
      />
    </div>
  );
}

export default AppPage;
