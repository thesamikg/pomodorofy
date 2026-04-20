import { useEffect, useMemo, useRef, useState } from "react";

import { readStoredJSON, writeStoredJSON } from "../lib/storage";

const storageKey = "pomodorofy-sound-system";
const bufferDurationSeconds = 24;
const fadeSeconds = 0.25;

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
    description: "Speech-like room murmur with gentle crowd motion and soft HVAC bed.",
    outputScale: 0.44,
    lfo: { rate: 0.09, depth: 0.06, wave: "triangle" },
    layers: [
      {
        buffer: "brown",
        playbackRate: 0.98,
        gain: 0.09,
        filters: [
          { type: "highpass", frequency: 80 },
          { type: "lowpass", frequency: 520 },
        ],
      },
      {
        buffer: "pink",
        playbackRate: 1.02,
        gain: 0.16,
        filters: [
          { type: "highpass", frequency: 140 },
          { type: "bandpass", frequency: 520, q: 0.7 },
          { type: "lowpass", frequency: 1700 },
        ],
      },
      {
        buffer: "pink",
        playbackRate: 0.97,
        gain: 0.11,
        filters: [
          { type: "highpass", frequency: 220 },
          { type: "bandpass", frequency: 1050, q: 0.85 },
          { type: "lowpass", frequency: 2400 },
        ],
      },
      {
        buffer: "white",
        playbackRate: 1.12,
        gain: 0.022,
        filters: [
          { type: "highpass", frequency: 900 },
          { type: "bandpass", frequency: 1700, q: 1.1 },
          { type: "lowpass", frequency: 3800 },
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

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function connectParamLfo(audioContext, param, { rate, depth, wave = "sine" }) {
  const oscillator = audioContext.createOscillator();
  oscillator.type = wave;
  oscillator.frequency.value = rate;

  const gain = audioContext.createGain();
  gain.gain.value = depth;

  oscillator.connect(gain);
  gain.connect(param);
  oscillator.start();

  return { oscillator, gain };
}

async function ensureNoiseWorklet(audioContext, workletState) {
  if (!audioContext?.audioWorklet) {
    return false;
  }

  if (workletState.loaded) {
    return true;
  }

  if (!workletState.loading) {
    workletState.loading = audioContext.audioWorklet
      .addModule(new URL("../audio/noiseWorklet.js", import.meta.url))
      .then(() => {
        workletState.loaded = true;
      })
      .catch(() => {
        workletState.loaded = false;
      })
      .finally(() => {
        workletState.loading = null;
      });
  }

  await workletState.loading;
  return workletState.loaded;
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
  const noiseWorkletRef = useRef({ loaded: false, loading: null });
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

    await ensureNoiseWorklet(audioContext, noiseWorkletRef.current);

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

    const audioContext = audioContextRef.current;
    const now = audioContext?.currentTime ?? 0;

    if (graph.master && audioContext) {
      try {
        graph.master.gain.cancelScheduledValues(now);
        graph.master.gain.setTargetAtTime(0.0001, now, Math.max(0.01, fadeSeconds / 3));
      } catch {
        // Ignore scheduling races.
      }
    }

    const stopAt = audioContext ? now + fadeSeconds + 0.02 : 0;

    graph.sources.forEach((source) => {
      if (typeof source.stop === "function") {
        try {
          source.stop(stopAt);
        } catch {
          try {
            source.stop();
          } catch {
            // Ignore stop races.
          }
        }
      }
    });

    if (graph.lfo) {
      try {
        graph.lfo.stop(stopAt);
      } catch {
        // Ignore stop races.
      }
    }

    graph.modulators?.forEach((modulator) => {
      try {
        modulator.oscillator.stop(stopAt);
      } catch {
        // Ignore stop races.
      }
    });

    [
      ...graph.sources,
      ...graph.filters,
      ...graph.layerGains,
      ...(graph.panners || []),
      graph.master,
      graph.lfo,
      graph.lfoGain,
      ...(graph.modulators?.flatMap((modulator) => [modulator.oscillator, modulator.gain]) ||
        []),
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
    const targetMasterGain = nextPreferences.muted
      ? 0.0001
      : Math.max(0.0001, clampVolume(nextPreferences.volume) * sound.outputScale);
    master.gain.value = 0.0001;
    master.connect(audioContext.destination);

    const sources = [];
    const filters = [];
    const layerGains = [];
    const panners = [];
    const modulators = [];

    sound.layers.forEach((layer) => {
      const workletReady = noiseWorkletRef.current.loaded && audioContext.audioWorklet;
      const source = workletReady
        ? new AudioWorkletNode(audioContext, "noise-generator", {
            numberOfInputs: 0,
            numberOfOutputs: 1,
            outputChannelCount: [1],
            processorOptions: { color: layer.buffer },
          })
        : audioContext.createBufferSource();

      if (!workletReady) {
        source.buffer = noiseBuffersRef.current[layer.buffer];
        source.loop = true;
        source.playbackRate.value = layer.playbackRate;
      }

      const { currentNode, nodes } = createFilterChain(audioContext, source, layer.filters);
      const gainNode = audioContext.createGain();
      gainNode.gain.value = layer.gain;

      const pannerNode = audioContext.createStereoPanner?.();
      let outputNode = gainNode;

      if (pannerNode) {
        pannerNode.pan.value = randomBetween(-0.18, 0.18);
        gainNode.connect(pannerNode);
        outputNode = pannerNode;
        panners.push(pannerNode);

        modulators.push(
          connectParamLfo(audioContext, pannerNode.pan, {
            rate: randomBetween(0.01, 0.03),
            depth: randomBetween(0.02, 0.08),
            wave: "sine",
          }),
        );
      }

      currentNode.connect(gainNode);
      outputNode.connect(master);

      modulators.push(
        connectParamLfo(audioContext, gainNode.gain, {
          rate: randomBetween(0.02, 0.06),
          depth: layer.gain * randomBetween(0.02, 0.06),
          wave: "sine",
        }),
      );

      const filterTarget = nodes[nodes.length - 1];
      if (filterTarget?.frequency) {
        modulators.push(
          connectParamLfo(audioContext, filterTarget.frequency, {
            rate: randomBetween(0.005, 0.02),
            depth: Math.max(3, filterTarget.frequency.value * randomBetween(0.002, 0.01)),
            wave: "sine",
          }),
        );
      }

      if (!workletReady) {
        const startOffset = source.buffer
          ? randomBetween(0, Math.max(0, source.buffer.duration - 0.05))
          : 0;
        source.start(0, startOffset);
      }

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

    const now = audioContext.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setTargetAtTime(targetMasterGain, now, Math.max(0.01, fadeSeconds / 3));

    graphsRef.current.set(soundId, {
      sources,
      filters,
      layerGains,
      panners,
      modulators,
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
