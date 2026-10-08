import { PixelIcon } from "./icons";

/** Static composition based on seed e028/e030/e042. No graph engine or selection state. */
export function UniversePreview() {
  return (
    <div className="universe-preview">
      <div className="preview-toolbar">
        <span className="preview-address">
          <PixelIcon name="universe" />
          Universe / AI & automation
        </span>
        <span className="category-key">
          <span className="key-ai">AI</span>
          <span className="key-automation">Automation</span>
          <span className="key-data">Data</span>
        </span>
      </div>
      <div className="preview-workspace">
        <div
          className="technology-map"
          role="img"
          aria-label="Illustrated learning universe: Microsoft Copilot Studio integrates with Power Automate and Microsoft Dataverse, and uses Connectors. These are seed-review editorial relationships, not verified Microsoft assertions."
        >
          <span className="map-coordinate">EXAMPLE NEIGHBORHOOD / 01</span>
          <svg
            className="technology-lines"
            viewBox="0 0 800 280"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M170 80H630M170 80V210M170 80L630 210" />
            <circle cx="170" cy="80" r="4" />
            <circle cx="630" cy="80" r="4" />
            <circle cx="170" cy="210" r="4" />
            <circle cx="630" cy="210" r="4" />
          </svg>
          <div className="technology-node node-copilot">
            <span className="topic-symbol violet">
              <PixelIcon name="spark" />
            </span>
            <span>
              <small>AI / EXAMPLE FOCUS</small>
              <strong>Copilot Studio</strong>
            </span>
          </div>
          <span className="relationship relation-top">integrates with</span>
          <div className="technology-node node-automate">
            <span className="topic-symbol blue">
              <PixelIcon name="path" />
            </span>
            <span>
              <small>AUTOMATION</small>
              <strong>Power Automate</strong>
            </span>
          </div>
          <span className="relationship relation-left">uses ↓</span>
          <span className="relationship relation-diagonal">
            integrates with
          </span>
          <div className="technology-node node-connectors">
            <span className="topic-symbol warm">
              <PixelIcon name="universe" />
            </span>
            <span>
              <small>INTEGRATION CONCEPT</small>
              <strong>Connectors</strong>
            </span>
          </div>
          <div className="technology-node node-dataverse">
            <span className="topic-symbol mint">
              <PixelIcon name="layers" />
            </span>
            <span>
              <small>DATA</small>
              <strong>Dataverse</strong>
            </span>
          </div>
        </div>
        <aside
          className="preview-inspector"
          aria-label="Example information inspector"
        >
          <div className="inspector-caption">
            <PixelIcon name="layers" />
            INSPECTOR <span>EXAMPLE</span>
          </div>
          <div className="inspector-title">
            <span className="topic-symbol violet">
              <PixelIcon name="spark" />
            </span>
            <div>
              <p>MICROSOFT / AI</p>
              <h3>Copilot Studio</h3>
            </div>
          </div>
          <p className="inspector-summary">
            A platform for designing and managing conversational AI agents.
          </p>
          <div className="inspector-relation">
            <span>CONNECT THE DOTS</span>
            <p>
              Copilot Studio <b>↔</b> Power Automate
            </p>
            <small>Example relationship: integrates with</small>
          </div>
          <p className="review-tag">
            <span aria-hidden="true">◇</span> seed-review · MSkill editorial
            guidance
          </p>
        </aside>
      </div>
      <div className="preview-caption">
        <span>
          <span className="status-dot" /> 4 technologies & concepts · 3 example
          relationships
        </span>
        <span className="mono">ILLUSTRATION / NOT A LIVE GRAPH</span>
      </div>
    </div>
  );
}
