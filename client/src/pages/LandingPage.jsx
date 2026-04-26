import { Menu } from "lucide-react";
import { Link } from "react-router-dom";

import BrandMark from "../components/BrandMark";
import FeatureGrid from "../components/FeatureGrid";
import Hero from "../components/Hero";
import HowItWorks from "../components/HowItWorks";
import Pricing from "../components/Pricing";
import SiteFooter from "../components/SiteFooter";
import Testimonials from "../components/Testimonials";
import ThemeToggle from "../components/ThemeToggle";

function LandingPage() {
  return (
    <div className="page-shell">
      <div className="section-shell pt-5">
        <header className="glass-panel flex items-center justify-between px-5 py-4 sm:px-6">
          <Link className="flex items-center gap-3" to="/">
            <BrandMark className="h-11 w-11 shrink-0" />
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
            <Link className="font-medium text-brand/70 transition hover:text-brand" to="/login">
              Log In
            </Link>
            <ThemeToggle className="px-4 py-2 text-sm" />
            <Link className="button-primary" to="/signup">
              Start Free
            </Link>
          </nav>
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle className="px-4 py-3" />
            <Link
              aria-label="Create account"
              className="button-secondary px-4"
              to="/signup"
            >
              <Menu className="h-4 w-4" />
            </Link>
          </div>
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
