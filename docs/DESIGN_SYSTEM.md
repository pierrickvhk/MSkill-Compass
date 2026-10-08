# MSkill Design System — Modern Calm × Pixel Nostalgia

## Creative brief
Original, independent "learning OS" feel. Nostalgic about Windows XP without copying Microsoft's protected wallpapers, logos, sounds, icons, or actual interface elements. The pixel style is an accent; learning content must remain crisp and readable.

### Brand
Name: **MSkill Compass**  
Positioning: **Explore. Learn. Build.**  
Tagline: **One universe. Your own path.**  
Disclaimer: **Independent community project. Not affiliated with or endorsed by Microsoft.**

### Color tokens (starting values; contrast must be checked)
```css
:root {
  --canvas: #F7F9FF;
  --surface: #FFFFFF;
  --surface-subtle: #EDF2FC;
  --ink: #202B49;
  --ink-muted: #65738A;
  --border: #DAE3F1;
  --blue: #2776F6;
  --violet: #835FF1;
  --mint: #74D9BF;
  --yellow: #FFD369;
  --focus: #0044CD;
  --shadow: 0 12px 36px rgba(27,44,81,.10);
  --radius-lg: 20px;
  --radius-panel: 16px;
}
```
Use semantic tokens and tested contrast in final implementation; decorative accent colors are not necessarily valid body text colors.

### Type and layout
- Typography: modern system sans for content and navigation; optional freely licensed pixel font only for occasional headings/labels.
- Never use pixel font for paragraphs, source URLs, forms, or long node definitions.
- Desktop shell: 72px rail, flexible explorer canvas, 340px right inspector, 40px unobtrusive status bar.
- Content spacing: 8px rhythm; 16/24/32px principal spacing; max content reading width ~76ch.
- Mobile: navigation as compact tab bar/overlay, default graph alternative as searchable list.

### Motifs
- Original pixel compass logo; small retro window headers; small inset mini-progress bars; pixel star/badge on mission completion.
- Animated gradient fog and orbit lines in the hero should be subtle, performance-friendly and `prefers-reduced-motion` aware.
- Node clusters use soft color coding + icon + text; meaning cannot rely on color alone.
- No fake desktop chrome around every component; no noisy multicolor cards.

### Interaction states
- Every node supports hover (when pointing device exists), focus-visible, selected, unavailable, filtered/dimmed.
- On selected node, show details on desktop; modal/full page on mobile; Escape closes when appropriate.
- Search highlights result but never unexpectedly destroys user's map selection.
- Lens switch preserves node ID, scroll, search query, and graph camera; content tabs update.
- Keyboard: Tab through UI; arrow/navigation support compatible with chosen graph library; logical focus order.

### Page wireframe in words
`/`: slim header + hero copy and one central pixel artifact + clear CTAs + three role cards + one illustrated sample journey.  
`/explore`: minimal rail + adaptive graph canvas + one inspector. Search/control chips float above canvas; status bottom.  
`/paths/agent-builder`: horizontal steps on desktop, vertical timeline on mobile, each linking back to graph.  
`/lab/first-agent`: task focused, reading-friendly mission with pinned checklist.  
`/radar`: chronological event list with topic tags and organizer/timezone indicators.

### Accessibility checklist
WCAG 2.2 AA as design target. 44px-ish tap targets where practical, visible focus rings, keyboard reachable inspector, text alternatives for graph insights, no motion required for comprehension, reduced-motion media query, explicit status labels, no color-only edges, distinguishable link text, empty/error/loading states.
