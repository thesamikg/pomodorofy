const verifierStorageKey = "pomodorofy_pkce_verifier";
const stateStorageKey = "pomodorofy_pkce_state";

export const spotifyScopes = [
  "user-read-email",
  "user-read-private",
  "streaming",
  "user-read-playback-state",
  "user-modify-playback-state",
  "playlist-read-private",
  "playlist-read-collaborative",
  "user-read-currently-playing",
];

export function getSpotifyClientId() {
  return import.meta.env.VITE_SPOTIFY_CLIENT_ID || "";
}

export function getSpotifyRedirectUri() {
  return (
    import.meta.env.VITE_SPOTIFY_REDIRECT_URI ||
    `${window.location.origin}/app`
  );
}

function generateRandomString(length = 64) {
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const randomValues = crypto.getRandomValues(new Uint8Array(length));

  return Array.from(randomValues, (value) => alphabet[value % alphabet.length]).join("");
}

async function sha256(plain) {
  const data = new TextEncoder().encode(plain);
  return crypto.subtle.digest("SHA-256", data);
}

function base64UrlEncode(arrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function generateCodeChallenge(verifier) {
  return base64UrlEncode(await sha256(verifier));
}

export async function beginSpotifyLogin() {
  const clientId = getSpotifyClientId();

  if (!clientId) {
    throw new Error("Missing VITE_SPOTIFY_CLIENT_ID in your client environment.");
  }

  const verifier = generateRandomString(96);
  const state = generateRandomString(24);
  const codeChallenge = await generateCodeChallenge(verifier);
  const redirectUri = getSpotifyRedirectUri();
  const authorizeUrl = new URL("https://accounts.spotify.com/authorize");

  sessionStorage.setItem(verifierStorageKey, verifier);
  sessionStorage.setItem(stateStorageKey, state);

  authorizeUrl.search = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
    state,
    scope: spotifyScopes.join(" "),
  }).toString();

  window.location.assign(authorizeUrl.toString());
}

export function consumePkceVerifier(returnedState) {
  const verifier = sessionStorage.getItem(verifierStorageKey);
  const storedState = sessionStorage.getItem(stateStorageKey);

  sessionStorage.removeItem(verifierStorageKey);
  sessionStorage.removeItem(stateStorageKey);

  if (!verifier || !storedState || storedState !== returnedState) {
    throw new Error("We could not validate the Spotify login response. Please try again.");
  }

  return verifier;
}
