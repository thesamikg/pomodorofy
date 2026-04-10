import { useEffect, useMemo, useRef, useState } from "react";

import { readStoredJSON, writeStoredJSON } from "../lib/storage";

const storageKey = "pomodorofy-sound-system";
const bufferDurationSeconds = 4;

const soundDefinitions = {
  rain: {
    label: "Rain",
    description: "Steady rainfall with soft top-end detail for long focus blocks.",
    outputScale: 0.48,
    lfo: { rate: 0.09, depth: 0.025, wave: "sine" },
    layers: [
      {
        buffer: "white",
        playbackRate: 0.96,
        gain: 0.38,
        filters: [
          { type: "highpass", frequency: 130 },
          { type: "lowpass", frequency: 2600 },
        ],
      },
      {
        buffer: "white",
        playbackRate: 1.08,
        gain: 0.09,
        filters: [
          { type: "highpass", frequency: 3200 },
          { type: "lowpass", frequency: 7200 },
        ],
      },
      {
        buffer: "brown",
        playbackRate: 0.86,
        gain: 0.045,
        filters: [{ type: "lowpass", frequency: 180 }],
      },
    ],
  },
  oceanWaves: {
    label: "Ocean Waves",
    description: "Low, slow swells with a brighter surf edge that ebbs in and out.",
    outputScale: 0.52,
    lfo: { rate: 0.042, depth: 0.2, wave: "sine" },
    layers: [
      {
        buffer: "pink",
        playbackRate: 0.8,
        gain: 0.34,
        filters: [{ type: "lowpass", frequency: 900 }],
      },
      {
        buffer: "white",
        playbackRate: 0.72,
        gain: 0.08,
        filters: [
          { type: "bandpass", frequency: 620, q: 0.35 },
          { type: "lowpass", frequency: 1700 },
        ],
      },
      {
        buffer: "brown",
        playbackRate: 0.88,
        gain: 0.08,
        filters: [{ type: "lowpass", frequency: 240 }],
      },
    ],
  },
  brownNoise: {
    label: "Brown Noise",
    description: "A dense low-frequency bed that masks chatter without motion.",
    outputScale: 0.55,
    lfo: { rate: 0.018, depth: 0.01, wave: "sine" },
    layers: [
      {
        buffer: "brown",
        playbackRate: 1,
        gain: 0.62,
        filters: [{ type: "lowpass", frequency: 1500 }],
      },
      {
        buffer: "pink",
        playbackRate: 0.95,
        gain: 0.08,
        filters: [{ type: "lowpass", frequency: 900 }],
      },
    ],
  },
  coffeeShop: {
    label: "Coffee Shop Ambience",
    description: "Room tone and soft midrange murmur without distracting peaks.",
    outputScale: 0.44,
    lfo: { rate: 0.14, depth: 0.05, wave: "triangle" },
    layers: [
      {
        buffer: "pink",
        playbackRate: 1.01,
        gain: 0.18,
        filters: [
          { type: "highpass", frequency: 170 },
          { type: "lowpass", frequency: 2500 },
        ],
      },
      {
        buffer: "brown",
        playbackRate: 0.94,
        gain: 0.12,
        filters: [
          { type: "bandpass", frequency: 420, q: 0.55 },
          { type: "lowpass", frequency: 920 },
        ],
      },
      {
        buffer: "white",
        playbackRate: 1.18,
        gain: 0.04,
        filters: [
          { type: "bandpass", frequency: 1900, q: 0.7 },
          { type: "lowpass", frequency: 3200 },
        ],
      },
    ],
  },
  fireplace: {
    label: "Fireplace",
    description: "Warm low crackle with a brighter flicker on top.",
    outputScale: 0.46,
    lfo: { rate: 0.82, depth: 0.09, wave: "triangle" },
    layers: [
      {
        buffer: "brown",
        playbackRate: 0.84,
        gain: 0.13,
        filters: [{ type: "lowpass", frequency: 420 }],
      },
      {
        buffer: "white",
        playbackRate: 1.28,
        gain: 0.11,
        filters: [
          { type: "highpass", frequency: 1150 },
          { type: "lowpass", frequency: 5200 },
        ],
      },
      {
        buffer: "white",
        playbackRate: 0.76,
        gain: 0.05,
        filters: [{ type: "bandpass", frequency: 900, q: 0.55 }],
      },
    ],
  },
};

const defaultState = {
  muted: false,
  mixEnabled: false,
  selectedSoundId: "rain",
  secondarySoundId: null,
  volume: 0.42,
};

function clampVolume(value) {
  return Math.max(0, Math.min(1, Number(value) || 0));
}

function buildStoredState() {
  const storedState = readStoredJSON(storageKey, {});
  const fallbackVolume =
    typeof storedState.volume === "number"
      ? clampVolume(storedState.volume)
      : clampVolume(
          storedState.volumes?.[
            storedState.selectedSoundId || defaultState.selectedSoundId
          ] ?? defaultState.volume,
        );

  return {
    ...defaultState,
    ...storedState,
    volume: fallbackVolume,
  };
}

function disconnectNode(node) {
  try {
    node?.disconnect();
  } catch {
    // Ignore teardown races when switching sounds quickly.
  }
}

function createFilterChain(audioContext, source, filters = []) {
  let currentNode = source;
  const nodes = [];

  filters.forEach((filterConfig) => {
    const filterNode = audioContext.createBiquadFilter();
    filterNode.type = filterConfig.type;
    filterNode.frequency.value = filterConfig.frequency;

    if (typeof filterConfig.q === "number") {
      filterNode.Q.value = filterConfig.q;
    }

    currentNode.connect(filterNode);
    currentNode = filterNode;
    nodes.push(filterNode);
  });

  return { currentNode, nodes };
}

function createNoiseBuffer(audioContext, color) {
  const frameCount = audioContext.sampleRate * bufferDurationSeconds;
  const buffer = audioContext.createBuffer(1, frameCount, audioContext.sampleRate);
  const channelData = buffer.getChannelData(0);

  if (color === "brown") {
    let lastSample = 0;

    for (let index = 0; index < frameCount; index += 1) {
      const whiteSample = Math.random() * 2 - 1;
      lastSample = (lastSample + 0.02 * whiteSample) / 1.02;
      channelData[index] = lastSample * 3.5;
    }

    return buffer;
  }

  if (color === "pink") {
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    let b3 = 0;
    let b4 = 0;
    let b5 = 0;
    let b6 = 0;

    for (let index = 0; index < frameCount; index += 1) {
      const whiteSample = Math.random() * 2 - 1;

      b0 = 0.99886 * b0 + whiteSample * 0.0555179;
      b1 = 0.99332 * b1 + whiteSample * 0.0750759;
      b2 = 0.969 * b2 + whiteSample * 0.153852;
      b3 = 0.8665 * b3 + whiteSample * 0.3104856;
      b4 = 0.55 * b4 + whiteSample * 0.5329522;
      b5 = -0.7616 * b5 - whiteSample * 0.016898;

      const pinkSample =
        b0 + b1 + b2 + b3 + b4 + b5 + b6 + whiteSample * 0.5362;

      b6 = whiteSample * 0.115926;
      channelData[index] = pinkSample * 0.11;
    }

    return buffer;
  }

  for (let index = 0; index < frameCount; index += 1) {
    channelData[index] = Math.random() * 2 - 1;
  }

  return buffer;
}

function useLatestRef(value) {
  const ref = useRef(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref;
}

export const soundOptions = Object.entries(soundDefinitions).map(([id, sound]) => ({
  id,
  label: sound.label,
  description: sound.description,
}));

export function useSoundSystem() {
  const [preferences, setPreferences] = useState(buildStoredState);
  const [activeSoundIds, setActiveSoundIds] = useState([]);
  const [error, setError] = useState("");
  const audioContextRef = useRef(null);
  const noiseBuffersRef = useRef({});
  const graphsRef = useRef(new Map());
  const preferencesRef = useLatestRef(preferences);
  const activeSoundIdsRef = useLatestRef(activeSoundIds);

  useEffect(() => {
    writeStoredJSON(storageKey, preferences);
  }, [preferences]);

  const updatePreferences = (updater) => {
    const nextPreferences =
      typeof updater === "function" ? updater(preferencesRef.current) : updater;

    preferencesRef.current = nextPreferences;
    setPreferences(nextPreferences);
    return nextPreferences;
  };

  const ensureAudioContext = async () => {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
      throw new Error("Ambient sounds are not supported in this browser.");
    }

    const audioContext =
      audioContextRef.current || new AudioContextClass();

    audioContextRef.current = audioContext;

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    ["white", "pink", "brown"].forEach((color) => {
      if (!noiseBuffersRef.current[color]) {
        noiseBuffersRef.current[color] = createNoiseBuffer(audioContext, color);
      }
    });

    return audioContext;
  };

  const stopSound = (soundId) => {
    const graph = graphsRef.current.get(soundId);

    if (!graph) {
      return;
    }

    graph.sources.forEach((source) => {
      try {
        source.stop();
      } catch {
        // Ignore stop races.
      }
    });

    if (graph.lfo) {
      try {
        graph.lfo.stop();
      } catch {
        // Ignore stop races.
      }
    }

    [
      ...graph.sources,
      ...graph.filters,
      ...graph.layerGains,
      graph.master,
      graph.lfo,
      graph.lfoGain,
    ].forEach(disconnectNode);

    graphsRef.current.delete(soundId);
  };

  const stopAll = () => {
    Array.from(graphsRef.current.keys()).forEach(stopSound);
    activeSoundIdsRef.current = [];
    setActiveSoundIds([]);
  };

  const destroyAllGraphs = () => {
    Array.from(graphsRef.current.keys()).forEach(stopSound);
    activeSoundIdsRef.current = [];
  };

  const updateGraphGain = (soundId, nextPreferences = preferencesRef.current) => {
    const graph = graphsRef.current.get(soundId);

    if (!graph || !audioContextRef.current) {
      return;
    }

    const targetGain = nextPreferences.muted
      ? 0.0001
      : Math.max(
        0.0001,
        clampVolume(nextPreferences.volume) * graph.outputScale,
      );

    graph.master.gain.cancelScheduledValues(audioContextRef.current.currentTime);
    graph.master.gain.setTargetAtTime(
      targetGain,
      audioContextRef.current.currentTime,
      0.08,
    );
  };

  const startSound = async (soundId, nextPreferences = preferencesRef.current) => {
    if (graphsRef.current.has(soundId)) {
      updateGraphGain(soundId, nextPreferences);
      return;
    }

    const audioContext = await ensureAudioContext();
    const sound = soundDefinitions[soundId];

    if (!sound) {
      throw new Error("The selected soundscape is unavailable.");
    }

    const master = audioContext.createGain();
    master.gain.value = nextPreferences.muted
      ? 0.0001
      : Math.max(0.0001, clampVolume(nextPreferences.volume) * sound.outputScale);
    master.connect(audioContext.destination);

    const sources = [];
    const filters = [];
    const layerGains = [];

    sound.layers.forEach((layer) => {
      const source = audioContext.createBufferSource();
      source.buffer = noiseBuffersRef.current[layer.buffer];
      source.loop = true;
      source.playbackRate.value = layer.playbackRate;

      const { currentNode, nodes } = createFilterChain(audioContext, source, layer.filters);
      const gainNode = audioContext.createGain();
      gainNode.gain.value = layer.gain;

      currentNode.connect(gainNode);
      gainNode.connect(master);
      source.start();

      sources.push(source);
      filters.push(...nodes);
      layerGains.push(gainNode);
    });

    let lfo = null;
    let lfoGain = null;

    if (sound.lfo) {
      lfo = audioContext.createOscillator();
      lfo.type = sound.lfo.wave;
      lfo.frequency.value = sound.lfo.rate;

      lfoGain = audioContext.createGain();
      lfoGain.gain.value = Math.max(
        0.0001,
        clampVolume(nextPreferences.volume) * sound.outputScale * sound.lfo.depth,
      );

      lfo.connect(lfoGain);
      lfoGain.connect(master.gain);
      lfo.start();
    }

    graphsRef.current.set(soundId, {
      sources,
      filters,
      layerGains,
      lfo,
      lfoGain,
      master,
      outputScale: sound.outputScale,
    });
  };

  const syncActiveSounds = async (
    targetSoundIds,
    nextPreferences = preferencesRef.current,
  ) => {
    const uniqueSoundIds = Array.from(new Set(targetSoundIds.filter(Boolean))).slice(
      0,
      nextPreferences.mixEnabled ? 2 : 1,
    );

    Array.from(graphsRef.current.keys()).forEach((soundId) => {
      if (!uniqueSoundIds.includes(soundId)) {
        stopSound(soundId);
      }
    });

    for (const soundId of uniqueSoundIds) {
      await startSound(soundId, nextPreferences);
    }

    activeSoundIdsRef.current = uniqueSoundIds;
    setActiveSoundIds(uniqueSoundIds);
    setError("");
  };

  useEffect(() => {
    activeSoundIds.forEach((soundId) => {
      updateGraphGain(soundId, preferences);
    });
  }, [activeSoundIds, preferences.muted, preferences.volume]);

  useEffect(() => {
    if (preferences.mixEnabled || activeSoundIdsRef.current.length <= 1) {
      return;
    }

    const nextPrimary =
      activeSoundIdsRef.current.find(
        (soundId) => soundId === preferences.selectedSoundId,
      ) || activeSoundIdsRef.current[0];

    const nextPreferences = updatePreferences((currentPreferences) => ({
      ...currentPreferences,
      selectedSoundId: nextPrimary,
      secondarySoundId: null,
    }));

    syncActiveSounds([nextPrimary], nextPreferences).catch((nextError) => {
      setError(nextError.message);
    });
  }, [preferences.mixEnabled]);

  useEffect(() => () => destroyAllGraphs(), []);

  const toggleSound = async (soundId) => {
    const currentlyActive = activeSoundIdsRef.current;

    if (currentlyActive.includes(soundId)) {
      stopSound(soundId);

      const remainingSoundIds = currentlyActive.filter((id) => id !== soundId);
      activeSoundIdsRef.current = remainingSoundIds;
      setActiveSoundIds(remainingSoundIds);

      if (preferencesRef.current.secondarySoundId === soundId) {
        updatePreferences((currentPreferences) => ({
          ...currentPreferences,
          secondarySoundId: null,
        }));
      }

      return;
    }

    const currentPreferences = preferencesRef.current;
    let nextPreferences = currentPreferences;
    let nextActiveSoundIds = [soundId];

    if (!currentPreferences.mixEnabled) {
      nextPreferences = updatePreferences((state) => ({
        ...state,
        selectedSoundId: soundId,
        secondarySoundId: null,
      }));
    } else if (!currentlyActive.length) {
      nextPreferences = updatePreferences((state) => ({
        ...state,
        selectedSoundId: soundId,
        secondarySoundId: null,
      }));
    } else if (currentlyActive.length === 1) {
      const primarySoundId =
        currentlyActive[0] === currentPreferences.secondarySoundId
          ? currentPreferences.selectedSoundId
          : currentlyActive[0];

      nextActiveSoundIds = [primarySoundId, soundId];
      nextPreferences = updatePreferences((state) => ({
        ...state,
        selectedSoundId: primarySoundId,
        secondarySoundId: soundId,
      }));
    } else {
      const primarySoundId =
        currentlyActive.find(
          (activeSoundId) => activeSoundId === currentPreferences.selectedSoundId,
        ) || currentlyActive[0];

      nextActiveSoundIds = [primarySoundId, soundId];
      nextPreferences = updatePreferences((state) => ({
        ...state,
        selectedSoundId: primarySoundId,
        secondarySoundId: soundId,
      }));
    }

    try {
      await syncActiveSounds(nextActiveSoundIds, nextPreferences);
    } catch (nextError) {
      setError(nextError.message);
    }
  };

  const setVolume = (nextVolume) => {
    updatePreferences((currentPreferences) => ({
      ...currentPreferences,
      volume: clampVolume(nextVolume),
    }));
  };

  const toggleMuteAll = () => {
    updatePreferences((currentPreferences) => ({
      ...currentPreferences,
      muted: !currentPreferences.muted,
    }));
  };

  const setMixEnabled = (enabled) => {
    updatePreferences((currentPreferences) => ({
      ...currentPreferences,
      mixEnabled: enabled,
      secondarySoundId: enabled ? currentPreferences.secondarySoundId : null,
    }));
  };

  const autoPlaySelectedSounds = async () => {
    const currentPreferences = preferencesRef.current;

    if (currentPreferences.muted) {
      return;
    }

    const targetSoundIds = currentPreferences.mixEnabled
      ? [currentPreferences.selectedSoundId, currentPreferences.secondarySoundId]
      : [currentPreferences.selectedSoundId];

    try {
      await syncActiveSounds(targetSoundIds, currentPreferences);
    } catch (nextError) {
      setError(nextError.message);
    }
  };

  return {
    activeSoundIds,
    autoPlaySelectedSounds,
    error,
    mixEnabled: preferences.mixEnabled,
    muted: preferences.muted,
    secondarySoundId: preferences.secondarySoundId,
    selectedSoundId: preferences.selectedSoundId,
    setMixEnabled,
    setVolume,
    soundOptions: useMemo(() => soundOptions, []),
    stopAll,
    toggleMuteAll,
    toggleSound,
    volume: preferences.volume,
  };
}
