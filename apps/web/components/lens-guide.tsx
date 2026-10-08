"use client";
import { useLens, LevelSelector } from "./shell";
import { PixelIcon } from "./icons";

const guidance = {
  Explorer: {
    kicker: "START WITH CURIOSITY",
    title: "You don’t need to know where to begin.",
    description:
      "Start with the big ideas. Get a plain-language view of AI, automation, and how the pieces fit together.",
    step: "Ask: what would I like to make possible?",
    icon: "compass" as const,
  },
  Builder: {
    kicker: "TURN IDEAS INTO SOMETHING REAL",
    title: "Connect what you know to what you can build.",
    description:
      "Look at practical workflows and integration ideas. This perspective will connect concepts to hands-on learning experiences.",
    step: "Ask: what small workflow could I improve?",
    icon: "path" as const,
  },
  Architect: {
    kicker: "LOOK BEYOND THE FIRST PROTOTYPE",
    title: "See the decisions behind the solution.",
    description:
      "Look through the lens of identity, governance, and architecture. Consider how a useful idea becomes a responsible solution.",
    step: "Ask: what needs to be safe, reliable, and maintainable?",
    icon: "layers" as const,
  },
};
export function LensGuide() {
  const { lens } = useLens();
  const content = guidance[lens];
  return (
    <section
      id="lenses"
      className="lens-section"
      aria-labelledby="lens-heading"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">03 / YOUR PERSPECTIVE</p>
          <h2 id="lens-heading">Same universe. Different lenses.</h2>
        </div>
        <p>
          A perspective, not a proficiency test.
          <br />
          Switch whenever your curiosity changes.
        </p>
      </div>
      <LevelSelector />
      <div className="lens-content" aria-live="polite" aria-atomic="true">
        <div className="lens-copy">
          <p className="eyebrow">{content.kicker}</p>
          <h3>{content.title}</h3>
          <p>{content.description}</p>
          <div className="next-question">
            <PixelIcon name="arrow" />
            {content.step}
          </div>
        </div>
        <div className="lens-stamp" aria-hidden="true">
          <PixelIcon name={content.icon} />
          <span>
            {lens.toUpperCase()}
            <br />A NEW POINT OF VIEW
          </span>
        </div>
      </div>
      <p className="scope-note">
        This preview changes the guidance above. My Learning Compass offers
        a curated first path with browser-local progress.
      </p>
    </section>
  );
}
