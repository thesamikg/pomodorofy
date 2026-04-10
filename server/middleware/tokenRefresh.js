import {
  clearSpotifyCookies,
  cookieNames,
  refreshSpotifyAccessToken,
  setSpotifyCookies,
} from "../utils/spotify.js";

export async function ensureSpotifyAccess(req, res, next) {
  try {
    const accessToken = req.signedCookies[cookieNames.accessToken];
    const refreshToken = req.signedCookies[cookieNames.refreshToken];
    const expiresAt = Number(req.signedCookies[cookieNames.expiresAt] || 0);
    const shouldRefresh =
      !accessToken || !expiresAt || Date.now() >= expiresAt - 60 * 1000;

    if (!refreshToken && !accessToken) {
      res.status(401).json({ error: "Spotify is not connected." });
      return;
    }

    if (shouldRefresh) {
      if (!refreshToken) {
        clearSpotifyCookies(res);
        res.status(401).json({ error: "Spotify session expired." });
        return;
      }

      const refreshedTokens = await refreshSpotifyAccessToken(refreshToken);
      setSpotifyCookies(res, refreshedTokens);
      req.spotifyAccessToken = refreshedTokens.access_token;
      next();
      return;
    }

    req.spotifyAccessToken = accessToken;
    next();
  } catch (error) {
    clearSpotifyCookies(res);
    next(
      Object.assign(new Error("Unable to refresh your Spotify session."), {
        status: 401,
      }),
    );
  }
}
