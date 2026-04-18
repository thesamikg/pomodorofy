import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="section-shell relative pb-20 pt-6 sm:pb-24 sm:pt-8 lg:pb-28 lg:pt-10">
      <div className="glass-panel relative overflow-hidden px-6 py-6 sm:px-10 sm:py-10 lg:px-16 lg:py-14">
        <div className="relative flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="tag-pill mb-6 gap-2">
              <Sparkles className="h-4 w-4 text-accent" />
              Joined by 12,400+ focused builders
            </div>
            <h1 className="headline max-w-3xl">
              Deep Work Meets Deep Music
            </h1>
            <p className="subcopy mt-6 max-w-xl">
              The only Pomodoro timer that plays the right music at the right
              time. Automatically. Lock into a ritual that cues focus, guards
              your breaks, and keeps momentum visible.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link className="button-primary gap-2" to="/signup">
                Start Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link className="button-secondary" to="/login">
                Log In
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-3 text-sm text-brand/60">
              <span className="tag-pill">Spotify-powered playback</span>
              <span className="tag-pill">Inline stats dashboard</span>
              <span className="tag-pill">Keyboard-first timer controls</span>
            </div>
          </div>

          <motion.div
            animate={{ y: [0, -12, 0], rotate: [0, 0.6, -0.6, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="mx-auto w-full max-w-xl"
          >
            <div className="relative mx-auto w-full max-w-[480px] rounded-[34px] border border-[#274b78]/12 bg-[#274b78] p-2.5 shadow-[0_24px_60px_rgba(39,75,120,0.18)]">
              <div className="glass-panel relative rounded-[28px] p-6">
                <div className="flex items-center justify-between text-sm text-brand/60">
                  <span>Today&apos;s ritual</span>
                  <span>Session 2 of 4</span>
                </div>
                <div className="mt-8 flex items-center justify-center">
                  <div className="relative flex h-56 w-56 items-center justify-center rounded-full border border-[#274b78]/15 bg-[#274b78]">
                    <div className="absolute inset-3 rounded-full border border-panel/45" />
                    <div className="text-center">
                      <p className="text-sm uppercase tracking-[0.32em] text-white/80">
                        Focus
                      </p>
                      <p className="mt-2 font-heading text-6xl text-white">
                        24:18
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-panel/30 bg-white p-4">
                    <p className="text-sm text-panel/75">Playlist</p>
                    <p className="mt-2 font-medium text-brand">
                      Flow State Cuts
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#274b78]/30 bg-white p-4">
                    <p className="text-sm text-brand/70">Track</p>
                    <p className="mt-2 font-medium text-brand">
                      The Difference
                    </p>
                  </div>
                  <div className="rounded-2xl border border-panel/30 bg-white p-4">
                    <p className="text-sm text-panel/75">Streak</p>
                    <p className="mt-2 font-medium text-brand">9 days</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
