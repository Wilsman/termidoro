<div align="center">
  <h1>TermiDoro</h1>
  <p>
    <strong>Focus like a developer.</strong><br>
    A terminal-inspired, minimalist Pomodoro timer built for deep work sessions.
  </p>
</div>

<br>

TermiDoro is a desktop application that brings the productivity of the Pomodoro technique into a sleek, command-line interface aesthetic. It is designed to stay out of your way while keeping you focused, featuring unobtrusive notifications, keyboard shortcuts, and a "hacker-mode" visual style.

## ✨ Features

- **Terminal Aesthetics**: A clean, dark-mode interface that fits right in with your IDE.
- **Multiple Modes**:
  - `WORK` (25m): Standard productive sprint.
  - `SHORT` (5m): Quick recharge break.
  - `DEEP` (50m): Extended focus block for complex tasks.
- **Keyboard First**: Control everything without touching the mouse.
- **Always on Top (Pin)**: Keep your timer visible during intense sprints.
- **Ghost Mode**: Adjustable opacity to blend into your wallpaper.
- **History Log**: Keeps a running log of your session commands and completed cycles.
- **Window Controls**: Toggle window borders for a truly seamless overlay experience.

## ⌨️ Hotkeys

| Key | Action |
| :--- | :--- |
| `1` | Start **Work** Timer (25m) |
| `2` | Start **Short Break** (5m) |
| `3` | Start **Deep Work** (50m) |
| `R` | **Reset** Timer |
| `P` | Toggle **Pin** (Always on Top) |
| `B` | Toggle **Window Border** |

## 🛠️ Stack

Built with a high-performance modern web stack:

- **[Tauri](https://tauri.app/)**: Tiny, fast, and secure desktop bundle.
- **[React](https://react.dev/)**: Reactive UI component architecture.
- **[TypeScript](https://www.typescriptlang.org/)**: Type-safe logic.
- **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first styling.
- **[Bun](https://bun.sh/)**: Fast packaged manager and bundler.

## 🚀 Getting Started

### Prerequisites

- **Node.js** & **Bun**
- **Rust** (required for Tauri) - [Install Rust](https://www.rust-lang.org/tools/install)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/termidoro.git
   cd termidoro
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Run in development mode:
   ```bash
   bun run tauri dev
   ```

4. Build for production:
   ```bash
   bun run tauri build
   ```

##  License

MIT
