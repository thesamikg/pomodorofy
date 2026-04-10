import {
  BellRing,
  ChartColumnBig,
  ListTodo,
  MoonStar,
  Music2,
  TimerReset,
} from "lucide-react";

const features = [
  {
    title: "Spotify Playback Control",
    description:
      "Play, pause, skip tracks, and dial volume without leaving the timer surface.",
    icon: Music2,
    span: "lg:col-span-2",
  },
  {
    title: "Custom Timer Modes",
    description:
      "Swap between Pomodoro, short break, and long break with editable durations.",
    icon: TimerReset,
    span: "",
  },
  {
    title: "Session History & Stats",
    description:
      "Track minutes focused today, weekly totals, and the streak you're protecting.",
    icon: ChartColumnBig,
    span: "",
  },
  {
    title: "Sound & Desktop Notifications",
    description:
      "Use browser notifications and tune the alarm style and volume to your environment.",
    icon: BellRing,
    span: "",
  },
  {
    title: "Auto Dark Mode",
    description:
      "Built for late sessions, low-light rooms, and distraction-resistant contrast.",
    icon: MoonStar,
    span: "",
  },
  {
    title: "Task Label Per Session",
    description:
      "Tie each focus block to real work so your history reflects output, not just minutes.",
    icon: ListTodo,
    span: "lg:col-span-2",
  },
];

function FeatureGrid() {
  return (
    <section className="section-shell py-16 sm:py-20">
      <div className="mb-10 max-w-2xl">
        <p className="tag-pill">Feature highlights</p>
        <h2 className="mt-4 font-heading text-3xl text-brand sm:text-4xl">
          A timer that behaves like a real focus operating system
        </h2>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <article
              key={feature.title}
              className={`glass-panel p-6 ${feature.span}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-heading text-2xl text-brand">
                    {feature.title}
                  </h3>
                  <p className="mt-3 max-w-xl text-brand/70">
                    {feature.description}
                  </p>
                </div>
                <div className="rounded-2xl border border-[rgba(39,75,120,0.12)] bg-[rgba(75,128,144,0.08)] p-3 text-panel">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default FeatureGrid;
