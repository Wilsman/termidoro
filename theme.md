# TermiDoro Style + Theme Guide

## 1) Visual Direction
- Dark terminal-inspired UI with soft neon accents.
- Layered atmospheric background (radial glows + subtle grid).
- Monospace typography, tight tracking, uppercase labels.
- Compact, floating window frame with rounded corners and thin borders.
- Animations favor slow glows, soft pulses, and celebratory transitions.

## 2) Color Tokens (CSS Vars)
```css
:root {
  color-scheme: dark;
  --bg-0: #0b0d10;
  --bg-1: #0f1216;
  --panel: #121417;
  --panel-2: #171b21;
  --text: #d3d7df;
  --muted: rgba(255, 255, 255, 0.4);
  --accent: #22d3ee;
  --app-opacity: 1;
}
```

## 3) Typography
- Font: "Fira Code", monospace
- Uppercase labels with tracking 0.2em-0.28em
- Small system text sizes: 9-11px
- Timer display: text-2xl or text-3xl, lightweight

## 4) Layout Skeleton (App Shell)
```html
<div class="app-shell">
  <div class="bg-layer"></div>
  <div class="celebration-layer"></div>
  <div class="celebration-streaks"></div>
  <div class="grid-layer"></div>
  <div class="window-frame">...</div>
</div>
```

### Core container styles
```css
.app-shell {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.window-frame {
  position: relative;
  width: 100%;
  height: 100vh;
  opacity: var(--app-opacity);
}
```

## 5) Background Atmosphere
```css
.bg-layer {
  position: absolute;
  inset: -20%;
  background:
    radial-gradient(700px circle at 20% 10%, rgba(34, 211, 238, 0.08), transparent 55%),
    radial-gradient(640px circle at 85% 0%, rgba(16, 185, 129, 0.06), transparent 50%),
    linear-gradient(180deg, var(--bg-0), var(--bg-1));
}

.grid-layer {
  position: absolute;
  inset: 0;
  opacity: 0.08;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.12) 1px, transparent 1px);
  background-size: 28px 28px;
  mask-image: radial-gradient(circle at 50% 20%, rgba(0,0,0,0.95), transparent 70%);
}
```

## 6) Panels + Window Frame
- Base panel background: #121417
- Header panel: #171b21
- Borders: border-white/10 or border-white/5
- Rounded when decorated: rounded-2xl
- Shadows:
  - Compact: shadow-[0_20px_50px_rgba(0,0,0,0.45)]
  - Full: shadow-[0_30px_80px_rgba(0,0,0,0.55)]

## 7) Motion System

### Transition state
```css
.app-shell.is-transitioning { --burst-1: rgba(34,211,238,0.55); }
.app-shell.is-transitioning.mode-short_break { --burst-1: rgba(56,189,248,0.6); }
.app-shell.is-transitioning.mode-long_break { --burst-1: rgba(56,189,248,0.65); }
.app-shell.is-transitioning.mode-deep_work { --burst-1: rgba(251,191,36,0.6); }
```

### Celebration layers
```css
.celebration-layer,
.celebration-streaks {
  position: absolute;
  inset: -30%;
  pointer-events: none;
  opacity: 0;
}
.celebration-layer {
  background:
    radial-gradient(circle at 40% 30%, var(--burst-1), transparent 50%),
    radial-gradient(circle at 70% 20%, var(--burst-2), transparent 55%),
    radial-gradient(circle at 50% 65%, var(--burst-3), transparent 60%);
  mix-blend-mode: screen;
}
.celebration-streaks {
  background:
    conic-gradient(from 120deg,
      transparent 0deg,
      rgba(255,255,255,0.05) 25deg,
      transparent 60deg,
      rgba(255,255,255,0.06) 90deg,
      transparent 140deg,
      rgba(255,255,255,0.05) 180deg,
      transparent 360deg);
  mix-blend-mode: screen;
}
```

### Transition animations
```css
.app-shell.is-transitioning .celebration-layer { animation: celebrationBurst 2.1s ease-out forwards; }
.app-shell.is-transitioning .celebration-streaks { animation: celebrationSweep 2.1s ease-out forwards; }
.app-shell.is-transitioning .bg-layer { animation: bgGlow 2.1s ease-out forwards; }
.app-shell.is-transitioning .grid-layer { animation: gridFlicker 2.1s ease-out forwards; }
.app-shell.is-transitioning .window-frame { animation: framePulse 1.8s ease-out forwards; }
```

### Small UI animations
- Cursor blink:
```css
.cursor { animation: blink 1s step-end infinite; }
```
- Byline float:
```css
.byline { animation: bylineFloat 4s ease-in-out infinite; }
```
- Timer pulse and glow when active:
  - animate-pulse on main timer text
  - drop-shadow glow on timer row
  - animate-pulse on progress bar fill

## 8) Component Patterns
- Title bar: compact, uppercase label, 2px status dot
- Buttons: tiny capsule, border border-white/10, hover brighten
- Controls inside a compact menu popover panel
- End time display: text-[9px] uppercase tracking-[0.25em]

## 9) Utility Style Notes
- Spacing uses px-3/4/5, py-1.5/2, space-y-2/3/4
- Small borders and muted text dominate; accent colors are rare and meaningful
- Use tabular-nums for time readouts

## 10) Quick Copy Snippets

### Base wrapper
```html
<body class="app-shell">
  <div class="bg-layer"></div>
  <div class="celebration-layer"></div>
  <div class="celebration-streaks"></div>
  <div class="grid-layer"></div>
  <div class="window-frame">
    <div class="panel">...</div>
  </div>
</body>
```

### Panel block
```css
.panel {
  background: #121417;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 18px;
  box-shadow: 0 30px 80px rgba(0,0,0,0.55);
  color: #d3d7df;
}
```
