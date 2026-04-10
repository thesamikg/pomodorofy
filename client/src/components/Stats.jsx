import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

import {
  getCurrentStreak,
  getFocusMinutesToday,
  getSessionsCompletedToday,
  getWeeklyChartData,
} from "../lib/storage";

function Stats({ history }) {
  const focusMinutesToday = getFocusMinutesToday(history);
  const sessionsToday = getSessionsCompletedToday(history);
  const streak = getCurrentStreak(history);
  const weeklyData = getWeeklyChartData(history);
  const recentSessions = history.slice(0, 4);

  return (
    <section className="glass-panel p-5 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-brand/50">
            Stats dashboard
          </p>
          <h2 className="mt-2 font-heading text-3xl text-brand">
            See your focus trend in one glance
          </h2>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <article className="rounded-[24px] border border-brand/10 bg-surface p-5">
          <p className="text-sm text-brand/55">Today&apos;s focus time</p>
          <p className="mt-3 font-heading text-4xl text-brand">{focusMinutesToday}m</p>
        </article>
        <article className="rounded-[24px] border border-brand/10 bg-surface p-5">
          <p className="text-sm text-brand/55">Sessions completed today</p>
          <p className="mt-3 font-heading text-4xl text-brand">{sessionsToday}</p>
        </article>
        <article className="rounded-[24px] border border-brand/10 bg-surface p-5">
          <p className="text-sm text-brand/55">Current streak</p>
          <p className="mt-3 font-heading text-4xl text-brand">{streak} days</p>
        </article>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.35fr_0.9fr]">
        <div className="rounded-[24px] border border-brand/10 bg-surface p-4">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-brand/55">Weekly focus minutes</p>
            <p className="text-xs uppercase tracking-[0.22em] text-brand/45">
              Last 7 days
            </p>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis
                  axisLine={false}
                  dataKey="label"
                  tick={{ fill: "rgba(39,75,120,0.65)", fontSize: 12 }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#ffffff",
                    border: "1px solid rgba(39,75,120,0.12)",
                    borderRadius: "16px",
                    color: "#274b78",
                  }}
                  cursor={{ fill: "rgba(75,128,144,0.08)" }}
                  formatter={(value) => [`${value} min`, "Focus"]}
                />
                <Bar dataKey="minutes" fill="#4b8090" radius={[14, 14, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[24px] border border-brand/10 bg-surface p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-brand/55">Recent sessions</p>
            <p className="text-xs uppercase tracking-[0.22em] text-brand/45">
              Latest 4
            </p>
          </div>
          <div className="mt-4 space-y-3">
            {recentSessions.length ? (
              recentSessions.map((session) => (
                <article
                  key={session.id}
                  className="rounded-2xl border border-panel/20 bg-[rgba(75,128,144,0.08)] p-4"
                >
                  <p className="truncate font-medium text-brand">{session.label}</p>
                  <p className="mt-2 text-sm text-brand/60">
                    {session.durationMinutes} min focused on{" "}
                    {new Date(session.completedAt).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </article>
              ))
            ) : (
              <p className="rounded-2xl border border-dashed border-panel/20 bg-[rgba(75,128,144,0.08)] p-4 text-brand/70">
                Complete your first focus block to build momentum history here.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Stats;
