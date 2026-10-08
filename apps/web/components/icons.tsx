import type { CSSProperties } from "react";

export type IconName =
  "compass" | "universe" | "path" | "spark" | "layers" | "arrow";

export function PixelIcon({
  name = "compass",
  className = "",
}: {
  name?: IconName;
  className?: string;
}) {
  const paths: Record<IconName, string> = {
    compass:
      "M10 1h4v3h4v3h3v4h2v4h-2v4h-3v3h-4v2h-4v-2H6v-3H3v-4H1v-4h2V7h3V4h4V1zm2 5-3 6-3 6 6-3 6-9-6 3V6z",
    universe: "M9 1h6v6H9zM1 16h6v6H1zM17 16h6v6h-6zM11 9h2v4h7v2H4v-2h7z",
    path: "M2 18h5v5H2zM17 1h5v5h-5zM4 9h14V7h2v4H6v5H4z",
    spark: "M10 1h4v6h3v3h6v4h-6v3h-3v6h-4v-6H7v-3H1v-4h6V7h3z",
    layers: "M3 2h18v5H3zM3 10h18v5H3zM3 18h18v5H3z",
    arrow: "M13 3h3v3h3v3h3v6h-3v3h-3v3h-3v-6H2V9h11z",
  };
  return (
    <svg
      className={`pixel-icon ${className}`}
      viewBox="0 0 24 24"
      aria-hidden="true"
      shapeRendering="crispEdges"
    >
      <path d={paths[name]} fill="currentColor" />
    </svg>
  );
}

/** Original geometric artwork: authored on a pixel grid, no external assets. */
export function CompassArt() {
  const colors = ["#2776F6", "#835FF1", "#74D9BF", "#FFD369"];
  return (
    <div className="compass-art" aria-hidden="true">
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <span className="coordinate north">N</span>
      <span className="coordinate south">S</span>
      <span className="coordinate west">W</span>
      <span className="coordinate east">E</span>
      <svg
        viewBox="0 0 240 240"
        className="compass-large"
        shapeRendering="crispEdges"
      >
        <path
          d="M88 20h64v16h32v16h16v32h16v72h-16v32h-16v16h-32v16H88v-16H56v-16H40v-32H24V84h16V52h16V36h32z"
          fill="#dbe4fc"
          transform="translate(0 8)"
        />
        <path
          d="M88 20h64v16h32v16h16v32h16v72h-16v32h-16v16h-32v16H88v-16H56v-16H40v-32H24V84h16V52h16V36h32z"
          fill="#fff"
          stroke="#202b49"
          strokeWidth="4"
        />
        <path
          d="M88 36h64v16h32v32h16v72h-16v32h-32v16H88v-16H56v-32H40V84h16V52h32z"
          fill="#edf2fc"
        />
        <path
          d="M120 46v16M120 178v16M46 120h16M178 120h16"
          stroke="#65738a"
          strokeWidth="4"
        />
        <path
          d="M120 120h24v-24h16V80h16V64h-32v16h-16v16h-8z"
          fill="#2776f6"
        />
        <path
          d="M120 120v24h-16v16H88v16H64v-32h16v-16h16v-8z"
          fill="#835ff1"
        />
        <path d="M120 120h24V96h16V80h16V64l-56 56z" fill="#1552bc" />
        <path d="M120 120v24h-16v16H88v16H64l56-56z" fill="#b4a1f8" />
        <rect x="112" y="112" width="16" height="16" fill="#202b49" />
        <rect x="116" y="112" width="8" height="8" fill="white" />
      </svg>
      {colors.map((color, index) => (
        <i
          key={color}
          className={`orbit-spark spark-${index}`}
          style={{ "--spark-color": color } as CSSProperties}
        >
          <PixelIcon name="spark" />
        </i>
      ))}
      <span className="art-note">A little curiosity. A new direction.</span>
    </div>
  );
}
