import { ArrowRight, Github, Instagram, Linkedin } from "lucide-react";
import { useState } from "react";

import { readStoredJSON, writeStoredJSON } from "../lib/storage";

function SiteFooter() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubscribe = (event) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      setMessage("Enter a valid email to get launch notes.");
      return;
    }

    const existing = readStoredJSON("pomodorofy-newsletter", []);

    if (!existing.includes(normalizedEmail)) {
      writeStoredJSON("pomodorofy-newsletter", [...existing, normalizedEmail]);
    }

    setMessage("You're on the list for product updates and release notes.");
    setEmail("");
  };

  return (
    <footer className="section-shell pb-10 pt-6 sm:pb-12">
      <div className="glass-panel flex flex-col gap-10 px-6 py-8 sm:px-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-xl">
          <p className="font-heading text-3xl text-brand">Pomodorofy</p>
          <p className="mt-3 text-brand/70">
            Deep work software for people who want better sessions, better
            breaks, and a soundtrack that knows when to step back.
          </p>
          <div className="mt-6 flex gap-3 text-brand/70">
            <a aria-label="GitHub" className="tag-pill hover:border-brand/20" href="https://github.com" target="_blank" rel="noreferrer">
              <Github className="h-4 w-4" />
            </a>
            <a aria-label="Instagram" className="tag-pill hover:border-brand/20" href="https://instagram.com" target="_blank" rel="noreferrer">
              <Instagram className="h-4 w-4" />
            </a>
            <a aria-label="LinkedIn" className="tag-pill hover:border-brand/20" href="https://linkedin.com" target="_blank" rel="noreferrer">
              <Linkedin className="h-4 w-4" />
            </a>
          </div>
        </div>
        <div className="w-full max-w-md">
          <p className="text-sm uppercase tracking-[0.24em] text-brand/48">
            Join the newsletter
          </p>
          <form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={handleSubscribe}>
            <input
              aria-label="Email address"
              className="input-shell flex-1"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email address"
              type="email"
              value={email}
            />
            <button className="button-primary gap-2" type="submit">
              Subscribe
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
          <p className="mt-3 min-h-6 text-sm text-brand/60">{message}</p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-brand/50">
            <a href="#how-it-works">How it works</a>
            <a href="#pricing">Pricing</a>
            <a href="/app">Web app</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
