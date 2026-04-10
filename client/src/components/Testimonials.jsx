const testimonials = [
  {
    quote:
      "I stopped babysitting playlists and timers separately. Pomodorofy feels like the first focus tool that actually respects my workflow.",
    name: "Maya Chen",
    role: "Product Designer, Craftlane",
  },
  {
    quote:
      "The auto-pause on breaks is the killer detail. It keeps my brain from bleeding one session into the next.",
    name: "Theo Alvarez",
    role: "Indie Founder, Routekit",
  },
  {
    quote:
      "We rolled it into our team ritual and suddenly our quiet hours started holding. The shared language around focus got sharper.",
    name: "Neha Raman",
    role: "Engineering Manager, Itera Labs",
  },
];

function Testimonials() {
  return (
    <section className="section-shell py-16 sm:py-20">
      <div className="mb-10 max-w-2xl">
        <p className="tag-pill">Testimonials</p>
        <h2 className="mt-4 font-heading text-3xl text-brand sm:text-4xl">
          Built for people who protect attention on purpose
        </h2>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {testimonials.map((item, index) => (
          <article key={item.name} className="glass-panel p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-brand/10 bg-[rgba(75,128,144,0.08)] font-heading text-lg text-brand">
                {item.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")}
              </div>
              <div>
                <h3 className="font-medium text-brand">{item.name}</h3>
                <p className="text-sm text-brand/60">{item.role}</p>
              </div>
            </div>
            <p className="mt-5 text-lg leading-8 text-brand/80">
              &ldquo;{item.quote}&rdquo;
            </p>
            <p className="mt-5 text-sm uppercase tracking-[0.25em] text-accent/70">
              Builder story {String(index + 1).padStart(2, "0")}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Testimonials;
