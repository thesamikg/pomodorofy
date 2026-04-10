import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const tiers = [
  {
    name: "Free",
    price: "$0",
    cadence: "/mo",
    description: "Start the ritual and feel the difference before you commit.",
    features: [
      "5 sessions per day",
      "Basic session stats",
      "Task labels",
      "Desktop notifications",
    ],
  },
  {
    name: "Pro",
    price: "$5",
    cadence: "/mo",
    description: "For solo builders who want Spotify-driven focus without limits.",
    features: [
      "Unlimited sessions",
      "Spotify integration",
      "Full weekly stats",
      "Auto-start flows",
    ],
    featured: true,
  },
];

function Pricing() {
  return (
    <section id="pricing" className="section-shell py-16 sm:py-20">
      <div className="mb-10 max-w-2xl">
        <p className="tag-pill">Pricing</p>
        <h2 className="mt-4 font-heading text-3xl text-brand sm:text-4xl">
          Start free. Upgrade when the ritual becomes non-negotiable.
        </h2>
        <p className="subcopy mt-4">
          Every tier is designed to move one step closer to automatic focus. No
          hidden fees, no setup friction, no bloated settings maze.
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {tiers.map((tier) => (
          <article
            key={tier.name}
            className={`glass-panel flex h-full flex-col p-7 ${
              tier.featured ? "border-accent/40 bg-accent/5" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-2xl text-brand">{tier.name}</h3>
              {tier.featured ? <span className="tag-pill text-accent">Most popular</span> : null}
            </div>
            <div className="mt-5 flex items-end gap-2">
              <p className="font-heading text-5xl text-brand">{tier.price}</p>
              <p className="pb-1 text-brand/55">{tier.cadence}</p>
            </div>
            <p className="mt-4 text-brand/68">{tier.description}</p>
            <ul className="mt-6 space-y-3 text-brand/78">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-accent" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              className={tier.featured ? "button-primary mt-8" : "button-secondary mt-8"}
              to="/app"
            >
              Choose {tier.name}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Pricing;
