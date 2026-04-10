import { Menu, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import FeatureGrid from "../components/FeatureGrid";
import Hero from "../components/Hero";
import HowItWorks from "../components/HowItWorks";
import Pricing from "../components/Pricing";
import SiteFooter from "../components/SiteFooter";
import Testimonials from "../components/Testimonials";

function LandingPage() {
  return (
    <div className="page-shell">
      <div className="section-shell pt-5">
        <header className="glass-panel flex items-center justify-between px-5 py-4 sm:px-6">
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
          <nav className="hidden items-center gap-6 text-sm text-brand/70 md:flex">
            <a href="#how-it-works">How it works</a>
            <a href="#pricing">Pricing</a>
            <Link className="button-primary" to="/app">
              Start Free
            </Link>
          </nav>
          <Link
            aria-label="Open app"
            className="button-secondary md:hidden"
            to="/app"
          >
            <Menu className="h-4 w-4" />
          </Link>
        </header>
      </div>

      <Hero />
      <HowItWorks />
      <FeatureGrid />
      <Pricing />
      <Testimonials />
      <SiteFooter />
    </div>
  );
}

export default LandingPage;
