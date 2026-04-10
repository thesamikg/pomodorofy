# Pomodorofy

Pomodorofy is a full-stack Pomodoro productivity app with Spotify integration: a conversion-focused landing page on `/` and a functional timer/player workspace on `/app`.

## Stack

- Frontend: React + Vite + Tailwind CSS + Framer Motion
- Backend: Node.js + Express
- Spotify: Authorization Code Flow with PKCE + Web Playback SDK
- Charts: Recharts

## Features

- Conversion-oriented landing page with hero, feature grid, pricing, testimonials, and newsletter capture
- Focus timer with Pomodoro, short break, and long break modes
- Editable durations, auto-start toggle, task labels, keyboard shortcuts, and end-of-session alerts
- Spotify OAuth with PKCE, secure token storage in signed httpOnly cookies, and automatic access-token refresh
- Spotify playlist browser, in-browser playback, current track display, play/pause/skip, and volume control
- Auto-pause during breaks and auto-resume when focus restarts
- Inline stats dashboard for today, streaks, recent sessions, and weekly totals
- Slide-in settings panel for timer behavior and notification preferences

## Project structure

```text
client/
  src/
    components/
    hooks/
    pages/
    styles/
server/
  routes/
  middleware/
  utils/
.env.example
README.md
```

## 1. Register a Spotify app

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Create a new app.
3. Add these redirect URIs:
   - `http://127.0.0.1:5173/app`
   - Your production app callback, for example `https://your-domain.com/app`
4. Copy the Client ID and Client Secret.
5. Make sure the Spotify account used for playback is Premium. The Web Playback SDK does not support browser playback on Free plans.

## 2. Configure environment variables

Use the root `.env.example` as the source of truth.

- Copy the `VITE_...` variables into `client/.env`
- Copy the server variables into `server/.env`

Example:

```bash
cp .env.example client/.env.example.copy
cp .env.example server/.env.example.copy
```

Then create real environment files with the correct values:

### `client/.env`

```env
VITE_API_URL=http://localhost:3001
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_SPOTIFY_REDIRECT_URI=http://127.0.0.1:5173/app
```

### `server/.env`

```env
PORT=3001
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
REDIRECT_URI=http://127.0.0.1:5173/app
SESSION_SECRET=replace_with_a_long_random_secret
CLIENT_ORIGINS=http://127.0.0.1:5173,http://localhost:5173,https://your-production-domain.com
```

## 3. Install dependencies

From the repo root:

```bash
npm install
```

## 4. Run locally

```bash
npm run dev
```

This starts:

- Vite client on `http://127.0.0.1:5173`
- Express backend on `http://localhost:3001`

## 5. Production build

```bash
npm run build
```

This builds the client and runs a syntax check on the server files.

## Spotify auth and playback notes

- The frontend creates the PKCE verifier and challenge, then redirects to Spotify.
- The backend exchanges the authorization code for tokens and stores access, refresh, and expiry values in signed httpOnly cookies.
- The frontend requests short-lived access tokens from `/auth/refresh` when the SDK or Spotify Web API needs them.
- Playlist data and playback controls use the Spotify Web API with in-memory access tokens only. Tokens are never written to local storage.

## Keyboard shortcuts

- `Space`: start or pause timer
- `R`: reset current session
- `S`: skip to the next session

## Deployment notes

- Set `CLIENT_ORIGINS` to include your production frontend origin.
- Set `REDIRECT_URI` and `VITE_SPOTIFY_REDIRECT_URI` to the deployed `/app` callback URL.
- Cookies are marked `secure` automatically when `NODE_ENV=production`.
- If you deploy frontend and backend on separate domains, keep CORS credentials enabled and make sure the cookie domain strategy matches your hosting setup.
