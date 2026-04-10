import { motion } from "framer-motion";
import { ListMusic, PlayCircle, PlugZap } from "lucide-react";

const steps = [
  {
    icon: PlugZap,
    label: "Step 1",
    title: "Connect Spotify",
    description:
      "Secure PKCE auth connects your account once, then Pomodorofy refreshes tokens for you in the background.",
  },
  {
    icon: ListMusic,
    label: "Step 2",
    title: "Choose your focus playlist",
    description:
      "Search your playlists, lock in a sound for deep work, and keep the player within reach without leaving the timer.",
  },
  {
    icon: PlayCircle,
    label: "Step 3",
    title: "Start a session",
    description:
      "Focus blocks start the music. Breaks pause it. Your rhythm stays intact without another tab, click, or context switch.",
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="section-shell py-16 sm:py-20">
      <div className="mb-10 max-w-2xl">
        <p className="tag-pill">How it works</p>
        <h2 className="mt-4 font-heading text-3xl text-brand sm:text-4xl">
          One clean loop from login to lock-in
        </h2>
        <p className="subcopy mt-4">
          Pomodorofy removes the micro-decisions that break attention. Set the
          ritual once, then let the app handle the soundtrack and the pacing.
        </p>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {steps.map((step, index) => {
          const Icon = step.icon;

          return (
            <motion.article
              key={step.title}
              className="glass-panel p-6"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              viewport={{ once: true, amount: 0.3 }}
            >
              <div className="inline-flex rounded-2xl border border-brand/10 bg-brand/5 p-3 text-panel">
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-5 text-sm uppercase tracking-[0.24em] text-brand/45">
                {step.label}
              </p>
              <h3 className="mt-3 font-heading text-2xl text-brand">
                {step.title}
              </h3>
              <p className="mt-3 text-brand/70">{step.description}</p>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

export default HowItWorks;
