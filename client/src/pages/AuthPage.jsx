import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
  Headphones,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { readStoredJSON, writeStoredJSON } from "../lib/storage";

const authContent = {
  login: {
    badge: "Welcome back",
    title: "Log in and slide straight into your next focus block.",
    description:
      "Reconnect with your playlists, session history, and the routines that keep your workday moving.",
    submitLabel: "Log In",
    helperLabel: "New here?",
    helperAction: "Create an account",
    helperPath: "/signup",
    successTitle: "You are signed in locally.",
    successBody:
      "This preview stores a local session in the browser until a full account API is connected.",
  },
  signup: {
    badge: "Create your account",
    title: "Build a focus ritual that remembers your rhythm.",
    description:
      "Create your Pomodorofy profile, save your setup, and keep the same timer energy across every session.",
    submitLabel: "Create Account",
    helperLabel: "Already have an account?",
    helperAction: "Log in",
    helperPath: "/login",
    successTitle: "Your account preview is ready.",
    successBody:
      "This demo saves a local account preview in the browser until a production auth backend is added.",
  },
};

const trustPoints = [
  {
    icon: Headphones,
    title: "Music-aware workflow",
    description: "Queue focus playlists, preserve your pace, and keep the right sound at the center of each session.",
  },
  {
    icon: Clock3,
    title: "Fast daily reset",
    description: "Jump back into timing, task labels, and your familiar session rhythm without setup friction.",
  },
  {
    icon: ShieldCheck,
    title: "Simple account shell",
    description: "The UI is built and validated now, with room to connect a real auth provider cleanly later.",
  },
];

const statCards = [
  { label: "Focus streak avg", value: "9 days" },
  { label: "Saved rituals", value: "24 presets" },
  { label: "Spotify-ready", value: "1 click" },
];

function getInitialForm(mode) {
  const stored = readStoredJSON("pomodorofy-auth-preview", {});

  return {
    fullName: mode === "signup" ? stored.fullName || "" : "",
    email: stored.email || "",
    password: "",
    confirmPassword: "",
    rememberMe: mode === "login",
    agreeToTerms: false,
  };
}

function AuthPage({ mode = "login" }) {
  const content = authContent[mode] || authContent.login;
  const [form, setForm] = useState(() => getInitialForm(mode));
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    setForm(getInitialForm(mode));
    setError("");
    setSuccess("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [mode]);

  const primaryAction = useMemo(
    () => (
      <Link className="button-primary gap-2" to="/app">
        Continue to app
        <ArrowRight className="h-4 w-4" />
      </Link>
    ),
    [],
  );

  const handleFieldChange = (event) => {
    const { checked, name, type, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const normalizedEmail = form.email.trim().toLowerCase();
    const trimmedName = form.fullName.trim();

    if (mode === "signup" && !trimmedName) {
      setError("Enter your full name to create the account.");
      setSuccess("");
      return;
    }

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      setError("Enter a valid email address.");
      setSuccess("");
      return;
    }

    if (!form.password || form.password.length < 8) {
      setError("Use a password with at least 8 characters.");
      setSuccess("");
      return;
    }

    if (mode === "signup" && form.password !== form.confirmPassword) {
      setError("Password confirmation does not match.");
      setSuccess("");
      return;
    }

    if (mode === "signup" && !form.agreeToTerms) {
      setError("Accept the terms to continue.");
      setSuccess("");
      return;
    }

    const existingPreview = readStoredJSON("pomodorofy-auth-preview", {});
    const nextPreview = {
      ...existingPreview,
      email: normalizedEmail,
      fullName: trimmedName || existingPreview.fullName || "Pomodorofy User",
      mode,
      rememberMe: form.rememberMe,
      updatedAt: new Date().toISOString(),
    };

    if (mode === "signup" && !nextPreview.createdAt) {
      nextPreview.createdAt = new Date().toISOString();
    }

    writeStoredJSON("pomodorofy-auth-preview", nextPreview);
    setError("");
    setSuccess(
      `${content.successTitle} ${content.successBody}`,
    );
  };

  return (
    <div className="page-shell bg-[linear-gradient(180deg,#f7fbfc_0%,#ffffff_30%,#fbfdff_100%)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-9rem] top-14 h-72 w-72 rounded-full bg-panel/8 blur-[110px]" />
        <div className="absolute right-[-5rem] top-[-3rem] h-80 w-80 rounded-full bg-brand/8 blur-[130px]" />
        <div className="absolute bottom-[-7rem] left-1/4 h-80 w-80 rounded-full bg-panel/8 blur-[140px]" />
      </div>

      <div className="section-shell relative z-10 pt-5">
        <header className="glass-panel flex flex-col gap-4 px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <Link className="flex items-center gap-3" to="/">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="font-heading text-xl text-brand">Pomodorofy</p>
              <p className="text-sm text-brand/55">
                Focus, timed to the soundtrack
              </p>
            </div>
          </Link>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link className="button-secondary" to="/">
              Back to home
            </Link>
            <Link className="button-secondary" to="/app">
              Open app
            </Link>
          </div>
        </header>
      </div>

      <main className="section-shell relative z-10 pb-14 pt-8 sm:pt-10">
        <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:gap-8">
          <section className="glass-panel relative overflow-hidden bg-[linear-gradient(180deg,rgba(246,251,253,0.98),rgba(255,255,255,0.94)_38%,#ffffff_100%)] px-6 py-7 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(39,75,120,0.12),transparent_42%),radial-gradient(circle_at_88%_18%,rgba(75,128,144,0.12),transparent_22%),linear-gradient(180deg,rgba(39,75,120,0.05),rgba(255,255,255,0)_36%)]" />
            <div className="absolute left-[-5rem] top-8 h-40 w-40 rounded-full bg-brand/6 blur-[90px]" />
            <div className="absolute right-8 top-20 h-24 w-24 rounded-full bg-panel/10 blur-[45px]" />
            <div className="relative">
              <div className="tag-pill gap-2">
                <Sparkles className="h-4 w-4 text-accent" />
                Ritual-first account experience
              </div>
              <h1 className="mt-6 max-w-2xl font-heading text-4xl leading-tight text-brand sm:text-5xl">
                Your timer, playlists, and session energy belong in one place.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-brand/72 sm:text-lg">
                This auth experience is built to feel like the rest of the
                product: calm surfaces, strong hierarchy, and zero color drift
                from the existing brand system.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {statCards.map((card) => (
                  <div
                    className="rounded-[24px] border border-brand/10 bg-white/85 px-4 py-4 shadow-[0_14px_32px_rgba(39,75,120,0.08)] backdrop-blur"
                    key={card.label}
                  >
                    <p className="text-sm text-brand/55">{card.label}</p>
                    <p className="mt-2 font-heading text-3xl text-brand">
                      {card.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-4">
                {trustPoints.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      className="flex gap-4 rounded-[26px] border border-brand/10 bg-white px-5 py-5"
                      key={item.title}
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-heading text-xl text-brand">
                          {item.title}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-brand/68">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 rounded-[28px] bg-brand px-6 py-6 text-white shadow-[0_20px_50px_rgba(39,75,120,0.22)]">
                <p className="text-sm uppercase tracking-[0.28em] text-white/60">
                  Why it works
                </p>
                <p className="mt-3 font-heading text-3xl leading-tight">
                  A sharp login flow should feel like the first calm minute of a
                  good focus session.
                </p>
                <div className="mt-5 flex items-center gap-3 text-sm text-white/78">
                  <CheckCircle2 className="h-4 w-4" />
                  Reused palette, spacing, typography, and surface treatment from
                  the live site
                </div>
              </div>
            </div>
          </section>

          <section className="glass-panel px-6 py-7 sm:px-8 sm:py-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-brand/48">
                  {content.badge}
                </p>
                <h2 className="mt-3 font-heading text-3xl leading-tight text-brand sm:text-[2.5rem]">
                  {content.title}
                </h2>
              </div>
            </div>

            <p className="mt-4 max-w-xl text-base leading-7 text-brand/68">
              {content.description}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-2 rounded-full border border-brand/10 bg-brand/5 p-1">
              <Link
                className={`rounded-full px-4 py-3 text-center text-sm font-medium transition ${
                  mode === "login"
                    ? "bg-brand text-white shadow-[0_8px_18px_rgba(39,75,120,0.16)]"
                    : "text-brand/72"
                }`}
                to="/login"
              >
                Log In
              </Link>
              <Link
                className={`rounded-full px-4 py-3 text-center text-sm font-medium transition ${
                  mode === "signup"
                    ? "bg-brand text-white shadow-[0_8px_18px_rgba(39,75,120,0.16)]"
                    : "text-brand/72"
                }`}
                to="/signup"
              >
                Sign Up
              </Link>
            </div>

            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
              {mode === "signup" ? (
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-brand">
                    Full name
                  </span>
                  <input
                    className="input-shell w-full"
                    name="fullName"
                    onChange={handleFieldChange}
                    placeholder="Aarav Sharma"
                    type="text"
                    value={form.fullName}
                  />
                </label>
              ) : null}

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-brand">
                  Email address
                </span>
                <input
                  autoComplete="email"
                  className="input-shell w-full"
                  name="email"
                  onChange={handleFieldChange}
                  placeholder="you@example.com"
                  type="email"
                  value={form.email}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-brand">
                  Password
                </span>
                <div className="relative">
                  <input
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    className="input-shell w-full pr-12"
                    name="password"
                    onChange={handleFieldChange}
                    placeholder="At least 8 characters"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                  />
                  <button
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-brand/45 transition hover:text-brand"
                    onClick={() => setShowPassword((previous) => !previous)}
                    type="button"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </label>

              {mode === "signup" ? (
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-brand">
                    Confirm password
                  </span>
                  <div className="relative">
                    <input
                      autoComplete="new-password"
                      className="input-shell w-full pr-12"
                      name="confirmPassword"
                      onChange={handleFieldChange}
                      placeholder="Repeat your password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={form.confirmPassword}
                    />
                    <button
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirmation password"
                          : "Show confirmation password"
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-brand/45 transition hover:text-brand"
                      onClick={() =>
                        setShowConfirmPassword((previous) => !previous)
                      }
                      type="button"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </label>
              ) : null}

              <div className="space-y-3 rounded-[26px] border border-brand/10 bg-brand/5 px-4 py-4">
                <label className="flex items-start gap-3 text-sm text-brand/72">
                  <input
                    checked={form.rememberMe}
                    className="mt-1 h-4 w-4 rounded border-brand/20 text-brand focus:ring-brand/20"
                    name="rememberMe"
                    onChange={handleFieldChange}
                    type="checkbox"
                  />
                  <span>Keep me signed in on this device.</span>
                </label>

                {mode === "signup" ? (
                  <label className="flex items-start gap-3 text-sm text-brand/72">
                    <input
                      checked={form.agreeToTerms}
                      className="mt-1 h-4 w-4 rounded border-brand/20 text-brand focus:ring-brand/20"
                      name="agreeToTerms"
                      onChange={handleFieldChange}
                      type="checkbox"
                    />
                    <span>
                      I agree to the terms and privacy policy for this demo
                      account flow.
                    </span>
                  </label>
                ) : (
                  <div className="text-sm text-brand/60">
                    Need a test account? Use the sign up tab to create one
                    locally.
                  </div>
                )}
              </div>

              {error ? (
                <div className="rounded-[22px] border border-[#b94b5c]/18 bg-[#fff4f6] px-4 py-3 text-sm text-[#9d3750]">
                  {error}
                </div>
              ) : null}

              {success ? (
                <div className="rounded-[24px] border border-panel/18 bg-[rgba(75,128,144,0.08)] px-4 py-4 text-sm leading-6 text-brand">
                  <p className="font-medium text-brand">{success}</p>
                  <div className="mt-4">{primaryAction}</div>
                </div>
              ) : null}

              <button className="button-primary w-full gap-2" type="submit">
                {content.submitLabel}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <p className="mt-6 text-sm text-brand/60">
              {content.helperLabel}{" "}
              <Link className="font-medium text-brand" to={content.helperPath}>
                {content.helperAction}
              </Link>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

export default AuthPage;
