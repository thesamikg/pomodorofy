import { useEffect, useRef, useState } from "react";

import {
  beginSpotifyLogin,
  consumePkceVerifier,
  getSpotifyRedirectUri,
} from "../lib/spotify";
import { readStoredJSON, writeStoredJSON } from "../lib/storage";

const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
let spotifySdkPromise;

function normalizeSpotifyError(message = "") {
  const lower = message.toLowerCase();

  if (lower.includes("premium") || lower.includes("account")) {
    return "Spotify Premium is required for browser playback. Upgrade your account to stream inside Pomodorofy.";
  }

  if (lower.includes("authentication")) {
    return "Spotify authentication expired. Reconnect your account to keep playback working.";
  }

  return message || "Spotify playback hit a problem. Try reconnecting or choosing another playlist.";
}

function loadSpotifySdk() {
  if (window.Spotify) {
    return Promise.resolve(window.Spotify);
  }

  if (!spotifySdkPromise) {
    spotifySdkPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector('script[src="https://sdk.scdn.co/spotify-player.js"]');

      window.onSpotifyWebPlaybackSDKReady = () => {
        resolve(window.Spotify);
      };

      if (existingScript) {
        return;
      }

      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;
      script.onerror = () => reject(new Error("Unable to load the Spotify Web Playback SDK."));
      document.body.appendChild(script);
    });
  }

  return spotifySdkPromise;
}

async function fetchSpotifyJson(path, accessToken, options = {}) {
  const response = await fetch(`https://api.spotify.com/v1${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(payload?.error?.message || "Spotify request failed.");
  }

  return payload;
}

export function useSpotify() {
  const [authState, setAuthState] = useState("checking");
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState("");
  const [expiresAt, setExpiresAt] = useState(0);
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(
    () => readStoredJSON("pomodorofy-selected-playlist", ""),
  );
  const [currentTrack, setCurrentTrack] = useState(null);
  const [deviceId, setDeviceId] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [premiumRequired, setPremiumRequired] = useState(false);
  const [spotifyError, setSpotifyError] = useState("");
  const [volume, setVolume] = useState(0.72);
  const playerRef = useRef(null);
  const tokenRef = useRef("");
  const selectedPlaylistRef = useRef(selectedPlaylistId);

  useEffect(() => {
    tokenRef.current = accessToken;
  }, [accessToken]);

  useEffect(() => {
    selectedPlaylistRef.current = selectedPlaylistId;
    writeStoredJSON("pomodorofy-selected-playlist", selectedPlaylistId);
  }, [selectedPlaylistId]);

  const resetSpotifyState = () => {
    setAuthState("guest");
    setUser(null);
    setAccessToken("");
    setExpiresAt(0);
    setPlaylists([]);
    setCurrentTrack(null);
    setDeviceId("");
    setIsPlaying(false);
    setPlayerReady(false);
    setPremiumRequired(false);
    setSpotifyError("");
  };

  const refreshAccessToken = async (silent = false) => {
    const response = await fetch(`${apiBaseUrl}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      if (!silent) {
        resetSpotifyState();
      }

      throw new Error("Unable to refresh Spotify access.");
    }

    const payload = await response.json();

    setAccessToken(payload.accessToken);
    setExpiresAt(Date.now() + Math.max(30, payload.expiresIn - 90) * 1000);
    return payload.accessToken;
  };

  const fetchProfile = async () => {
    const response = await fetch(`${apiBaseUrl}/auth/me`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("No active Spotify session.");
    }

    const payload = await response.json();

    setUser(payload);
    setPremiumRequired(payload.product !== "premium");
    setAuthState("connected");
    return payload;
  };

  const fetchPlaylists = async (tokenOverride) => {
    const token = tokenOverride || tokenRef.current || (await refreshAccessToken(true));
    const payload = await fetchSpotifyJson("/me/playlists?limit=50", token);
    const items = payload?.items || [];

    setPlaylists(items);

    if (!selectedPlaylistRef.current && items[0]) {
      setSelectedPlaylistId(items[0].id);
    }

    return items;
  };

  useEffect(() => {
    let ignore = false;

    const bootstrap = async () => {
      try {
        await fetchProfile();
        const freshToken = await refreshAccessToken(true);

        if (!ignore) {
          await fetchPlaylists(freshToken);
        }
      } catch {
        if (!ignore) {
          resetSpotifyState();
        }
      }
    };

    bootstrap();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (authState !== "connected" || !expiresAt) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      refreshAccessToken(true).catch(() => {
        resetSpotifyState();
      });
    }, Math.max(15_000, expiresAt - Date.now()));

    return () => window.clearTimeout(timeoutId);
  }, [authState, expiresAt]);

  useEffect(() => {
    if (!playerRef.current) {
      return;
    }

    playerRef.current.setVolume(volume).catch(() => {});
  }, [volume]);

  useEffect(() => {
    if (authState !== "connected" || !accessToken || premiumRequired || playerRef.current) {
      return undefined;
    }

    let cancelled = false;
    let localPlayer;

    loadSpotifySdk()
      .then(async () => {
        if (cancelled || !window.Spotify) {
          return;
        }

        localPlayer = new window.Spotify.Player({
          name: "Pomodorofy",
          volume,
          getOAuthToken: async (callback) => {
            try {
              const token = tokenRef.current || (await refreshAccessToken(true));
              callback(token);
            } catch {
              callback("");
            }
          },
        });

        localPlayer.addListener("ready", ({ device_id: playerDeviceId }) => {
          setDeviceId(playerDeviceId);
          setPlayerReady(true);
          setSpotifyError("");
        });
        localPlayer.addListener("not_ready", () => {
          setPlayerReady(false);
        });
        localPlayer.addListener("initialization_error", ({ message }) => {
          setSpotifyError(normalizeSpotifyError(message));
        });
        localPlayer.addListener("authentication_error", ({ message }) => {
          setSpotifyError(normalizeSpotifyError(message));
        });
        localPlayer.addListener("account_error", ({ message }) => {
          setPremiumRequired(true);
          setSpotifyError(normalizeSpotifyError(message));
        });
        localPlayer.addListener("playback_error", ({ message }) => {
          setSpotifyError(normalizeSpotifyError(message));
        });
        localPlayer.addListener("player_state_changed", (state) => {
          if (!state) {
            return;
          }

          const track = state.track_window.current_track;

          setCurrentTrack(
            track
              ? {
                  id: track.id,
                  name: track.name,
                  artist: track.artists.map((artist) => artist.name).join(", "),
                  albumArt: track.album.images?.[0]?.url,
                  albumName: track.album.name,
                }
              : null,
          );
          setIsPlaying(!state.paused);
        });

        await localPlayer.connect();
        playerRef.current = localPlayer;
      })
      .catch((error) => {
        setSpotifyError(normalizeSpotifyError(error.message));
      });

    return () => {
      cancelled = true;

      if (localPlayer) {
        localPlayer.disconnect();
      }

      if (playerRef.current === localPlayer) {
        playerRef.current = null;
      }
    };
  }, [accessToken, authState, premiumRequired, volume]);

  const connectSpotify = async () => {
    setSpotifyError("");
    await beginSpotifyLogin();
  };

  const completeSpotifyAuth = async ({ code, state }) => {
    try {
      setSpotifyError("");
      const codeVerifier = consumePkceVerifier(state);
      const response = await fetch(`${apiBaseUrl}/auth/spotify`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          codeVerifier,
          redirectUri: getSpotifyRedirectUri(),
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || "Unable to finish Spotify authentication.");
      }

      const payload = await response.json();

      setAuthState("connected");
      setUser(payload.user);
      setPremiumRequired(payload.user.product !== "premium");
      setAccessToken(payload.accessToken);
      setExpiresAt(Date.now() + Math.max(30, payload.expiresIn - 90) * 1000);
      await fetchPlaylists(payload.accessToken);
    } catch (error) {
      resetSpotifyState();
      setSpotifyError(normalizeSpotifyError(error.message));
      throw error;
    }
  };

  const withFreshToken = async () => tokenRef.current || refreshAccessToken(true);

  const ensureActiveDevice = async () => {
    const token = await withFreshToken();

    if (!deviceId) {
      throw new Error("Spotify is still getting ready on this browser.");
    }

    await fetchSpotifyJson("/me/player", token, {
      method: "PUT",
      body: JSON.stringify({
        device_ids: [deviceId],
        play: false,
      }),
    });

    return token;
  };

  const playPlaylist = async (playlistId = selectedPlaylistRef.current) => {
    if (!playlistId) {
      throw new Error("Choose a playlist before starting a focus session.");
    }

    if (premiumRequired) {
      throw new Error("Spotify Premium is required for playback.");
    }

    const token = await ensureActiveDevice();

    await fetchSpotifyJson(`/me/player/play?device_id=${deviceId}`, token, {
      method: "PUT",
      body: JSON.stringify({
        context_uri: `spotify:playlist:${playlistId}`,
      }),
    });

    setIsPlaying(true);
  };

  const resumePlayback = async () => {
    if (premiumRequired) {
      return;
    }

    if (playerRef.current && currentTrack) {
      await playerRef.current.resume();
      return;
    }

    await playPlaylist();
  };

  const pausePlayback = async () => {
    if (!playerRef.current) {
      return;
    }

    await playerRef.current.pause();
    setIsPlaying(false);
  };

  const togglePlayback = async () => {
    if (!playerRef.current) {
      return;
    }

    await playerRef.current.togglePlay();
  };

  const nextTrack = async () => {
    if (!playerRef.current) {
      return;
    }

    await playerRef.current.nextTrack();
  };

  const disconnectSpotify = async () => {
    await fetch(`${apiBaseUrl}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    if (playerRef.current) {
      playerRef.current.disconnect();
      playerRef.current = null;
    }

    resetSpotifyState();
  };

  return {
    authState,
    currentTrack,
    deviceId,
    isPlaying,
    playerReady,
    playlists,
    premiumRequired,
    selectedPlaylistId,
    spotifyError,
    user,
    volume,
    connectSpotify,
    completeSpotifyAuth,
    disconnectSpotify,
    fetchPlaylists,
    nextTrack,
    pausePlayback,
    playPlaylist,
    refreshAccessToken,
    resumePlayback,
    setSelectedPlaylistId,
    setSpotifyError,
    setVolume,
    togglePlayback,
  };
}
