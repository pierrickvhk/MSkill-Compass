import Link from "next/link";
import { CompassArt, PixelIcon } from "../components/icons";
import { LensGuide } from "../components/lens-guide";
import { MSkillWindow } from "../components/ui";
import { UniversePreview } from "../components/universe-preview";

export default function Home() {
  return (
    <main id="main" tabIndex={-1} className="home-main">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="tiny-squares" aria-hidden="true">
              ▪ ▪ ▪
            </span>{" "}
            MICROSOFT AI & AUTOMATION, MAPPED FOR YOU
          </p>
          <h1>
            One universe.
            <br />
            <span>Your own path.</span>
          </h1>
          <p className="hero-description">
            Find your bearings in a world of possibilities.
            <br className="desktop-break" /> Explore the ideas. Connect the
            dots. Build what’s next.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/explore">
              Explore the Universe <PixelIcon name="arrow" />
            </Link>
            <Link className="button button-secondary" href="/learn/agent-builder">
              Find My Path <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <p className="hero-footnote">
            <span className="small-star" aria-hidden="true">
              ✦
            </span>{" "}
            For the curious. The makers. The big-picture thinkers.
          </p>
        </div>
        <div className="hero-art">
          <div className="artifact-tag">
            <span className="status-dot" /> YOUR NEXT DIRECTION STARTS HERE
          </div>
          <CompassArt />
          <div className="artifact-bottom">
            <span>EST. FOR EXPLORATION</span>
            <span>50° N / ∞ POSSIBILITIES</span>
          </div>
        </div>
      </section>
      <section className="universe-section" aria-labelledby="universe-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">02 / THE LEARNING UNIVERSE</p>
            <h2 id="universe-heading">Less searching. More connecting.</h2>
          </div>
          <Link className="text-link" href="/explore">
            Open the Explorer <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <MSkillWindow title="MSkill Explorer — AI & automation" collapsible>
          <UniversePreview />
        </MSkillWindow>
        <p className="scope-note">
          A glimpse of the universe. Curated content remains seed-review;
          open the Explorer to navigate the real graph.
        </p>
      </section>
      <LensGuide />
      <section
        id="about"
        className="approach"
        aria-labelledby="approach-heading"
      >
        <p className="eyebrow">04 / BUILT WITH INTENTION</p>
        <h2 id="approach-heading">A compass, not another course catalog.</h2>
        <div className="approach-columns">
          <p>
            <strong>Make the connections.</strong> Original explanations will
            help you see how Microsoft AI and automation ideas relate.
          </p>
          <p>
            <strong>Keep the source in sight.</strong> Authored guidance stays
            distinct from official documentation. Verification is earned, never
            implied.
          </p>
          <p>
            <strong>Follow your curiosity.</strong> Three open perspectives. No
            accounts, levels to unlock, or single right place to begin.
          </p>
        </div>
      </section>
    </main>
  );
}
