import express from "express";

import { ensureSpotifyAccess } from "../middleware/tokenRefresh.js";
import {
  clearSpotifyCookies,
  cookieNames,
  exchangeAuthorizationCode,
  fetchSpotifyProfile,
  refreshSpotifyAccessToken,
  setSpotifyCookies,
} from "../utils/spotify.js";

const router = express.Router();

router.post("/spotify", async (req, res, next) => {
  try {
    const { code, codeVerifier, redirectUri } = req.body;

    if (!code || !codeVerifier) {
      res.status(400).json({ error: "Missing Spotify authorization details." });
      return;
    }

    const configuredRedirectUri = process.env.REDIRECT_URI;
    if (!configuredRedirectUri) {
      next(
        Object.assign(new Error("Server redirect URI is not configured."), {
          status: 500,
        }),
      );
      return;
    }

    if (redirectUri && redirectUri !== configuredRedirectUri) {
      res.status(400).json({ error: "Invalid redirect URI." });
      return;
    }

    const tokens = await exchangeAuthorizationCode({
      code,
      codeVerifier,
      redirectUri: configuredRedirectUri,
    });

    setSpotifyCookies(res, tokens);
    const user = await fetchSpotifyProfile(tokens.access_token);

    res.json({
      accessToken: tokens.access_token,
      expiresIn: tokens.expires_in,
      user,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/refresh", async (req, res, next) => {
  try {
    const refreshToken = req.signedCookies[cookieNames.refreshToken];

    if (!refreshToken) {
      res.status(401).json({ error: "Spotify is not connected." });
      return;
    }

    const tokens = await refreshSpotifyAccessToken(refreshToken);
    setSpotifyCookies(res, tokens);

    res.json({
      accessToken: tokens.access_token,
      expiresIn: tokens.expires_in,
    });
  } catch (error) {
    clearSpotifyCookies(res);
    next(
      Object.assign(new Error("Unable to refresh your Spotify access token."), {
        status: 401,
      }),
    );
  }
});

router.get("/me", ensureSpotifyAccess, async (req, res, next) => {
  try {
    const user = await fetchSpotifyProfile(req.spotifyAccessToken);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.post("/logout", (_req, res) => {
  clearSpotifyCookies(res);
  res.json({ ok: true });
});

export default router;
