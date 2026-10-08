"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { PixelIcon } from "./icons";
import { MSkillDesktopIcon } from "./ui";

export const lenses = ["Explorer", "Builder", "Architect"] as const;
export type Lens = (typeof lenses)[number];
const LensContext = createContext<{
  lens: Lens;
  setLens: (lens: Lens) => void;
}>({ lens: "Explorer", setLens: () => {} });
export function useLens() {
  return useContext(LensContext);
}

export function LevelSelector() {
  const { lens, setLens } = useLens();
  return (
    <fieldset className="level-selector">
      <legend className="sr-only">Choose your information lens</legend>
      {lenses.map((item) => (
        <label key={item} className={lens === item ? "selected" : ""}>
          <input
            type="radio"
            name="lens"
            value={item}
            checked={lens === item}
            onChange={() => setLens(item)}
          />
          <span>{item}</span>
        </label>
      ))}
    </fieldset>
  );
}

export function MSkillLauncher() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    function outside(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);
  return (
    <div
      className="launcher"
      ref={root}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          setOpen(false);
          trigger.current?.focus();
        }
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={trigger}
        className="launcher-trigger"
        aria-expanded={open}
        aria-controls="compass-launcher"
        onClick={() => setOpen(!open)}
      >
        <PixelIcon />
        <span>Start exploring</span>
        <span aria-hidden="true">{open ? "⌄" : "⌃"}</span>
      </button>
      {open && (
        <nav
          id="compass-launcher"
          className="launcher-panel"
          aria-label="Compass launcher"
          onClick={(event) => {
            if ((event.target as HTMLElement).closest("a")) setOpen(false);
          }}
        >
          <div className="launcher-heading">
            <PixelIcon />
            <span>
              Your next direction<small>Explore. Learn. Build.</small>
            </span>
          </div>
          <MSkillDesktopIcon
            href="/"
            icon="compass"
            title="Welcome home"
            description="Find your bearings"
          />
          <MSkillDesktopIcon
            href="/explore"
            icon="universe"
            title="Universe Explorer"
            description="Step inside the learning space"
          />
          <MSkillDesktopIcon
            href="/learn/agent-builder"
            icon="path"
            title="My Learning Compass"
            description="Continue your first learning path"
          />
          <MSkillDesktopIcon href="/lab/first-agent" icon="path" title="Builder Lab" description="Build your first knowledge agent" />
          <MSkillDesktopIcon href="/radar" icon="universe" title="Microsoft Radar" description="Discover curated Microsoft events" />
          <p>No account needed. Curiosity welcome.</p>
        </nav>
      )}
    </div>
  );
}

export function MSkillStatusBar() {
  const { lens } = useLens();
  return (
    <div className="statusbar">
      <MSkillLauncher />
      <span className="status-location">
        <span className="status-dot" />
        Curated learning universe
      </span>
      <span className="status-lens">{lens} lens</span>
      <span className="status-version">MSK / 06</span>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [lens, setLens] = useState<Lens>("Explorer");
  const pathname = usePathname();
  return (
    <LensContext.Provider value={{ lens, setLens }}>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="site-header">
        <Link href="/" className="brand" aria-label="MSkill Compass home">
          <span className="brand-mark">
            <PixelIcon />
          </span>
          <span>
            MSkill <b>Compass</b>
            <small>YOUR LEARNING COORDINATES</small>
          </span>
        </Link>
        <nav className="main-nav" aria-label="Main navigation">
          <Link href="/" aria-current={pathname === "/" ? "page" : undefined}>
            Home
          </Link>
          <Link
            href="/explore"
            aria-current={pathname === "/explore" ? "page" : undefined}
          >
            Universe
          </Link>
          <Link href="/learn/agent-builder" aria-current={pathname === "/learn/agent-builder" ? "page" : undefined}>My Path</Link>
          <Link href="/radar" aria-current={pathname === "/radar" ? "page" : undefined}>Radar</Link>
        </nav>
        <span className="header-note">
          Independent by design <span aria-hidden="true">↗</span>
        </span>
      </header>
      <MSkillStatusBar />
      {children}
      <footer className="site-footer">
        <span>
          MSkill Compass <span aria-hidden="true">✦</span> Made for curious
          minds.
        </span>
        <p>
          Independent community project. Not affiliated with or endorsed by
          Microsoft.
        </p>
      </footer>
    </LensContext.Provider>
  );
}
