const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";

export const cookieNames = {
  accessToken: "spotify_access_token",
  refreshToken: "spotify_refresh_token",
  expiresAt: "spotify_expires_at",
};

const thirtyDays = 1000 * 60 * 60 * 24 * 30;

function getCookieOptions(maxAge) {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    signed: true,
    path: "/",
    maxAge,
  };
}

export function setSpotifyCookies(res, tokenResponse) {
  const expiresIn = Number(tokenResponse.expires_in || 3600);
  const expiresAt = Date.now() + expiresIn * 1000;

  res.cookie(
    cookieNames.accessToken,
    tokenResponse.access_token,
    getCookieOptions(expiresIn * 1000),
  );
  res.cookie(
    cookieNames.expiresAt,
    String(expiresAt),
    getCookieOptions(expiresIn * 1000),
  );

  if (tokenResponse.refresh_token) {
    res.cookie(
      cookieNames.refreshToken,
      tokenResponse.refresh_token,
      getCookieOptions(thirtyDays),
    );
  }

  return expiresAt;
}

export function clearSpotifyCookies(res) {
  Object.values(cookieNames).forEach((cookieName) => {
    res.clearCookie(cookieName, getCookieOptions(0));
  });
}

function getAuthorizationHeader() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw Object.assign(new Error("Spotify credentials are not configured."), {
      status: 500,
    });
  }

  return `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
}

async function requestSpotifyToken(params) {
  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: getAuthorizationHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params).toString(),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw Object.assign(
      new Error(payload.error_description || "Spotify token request failed."),
      { status: response.status },
    );
  }

  return payload;
}

export async function exchangeAuthorizationCode({ code, codeVerifier, redirectUri }) {
  return requestSpotifyToken({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri || process.env.REDIRECT_URI,
    code_verifier: codeVerifier,
  });
}

export async function refreshSpotifyAccessToken(refreshToken) {
  return requestSpotifyToken({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
}

export async function fetchSpotifyProfile(accessToken) {
  const response = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const payload = await response.json();

  if (!response.ok) {
    throw Object.assign(
      new Error(payload.error?.message || "Unable to fetch Spotify profile."),
      { status: response.status },
    );
  }

  return payload;
}
