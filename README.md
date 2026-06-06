# GateLab

**A 3D interactive logic design playground for CS22303 — Digital Principles and System Design**

Built by [Omega Mu Gamma Studio](https://github.com/Omega-Mu-Gamma-Studio) · the team behind [SeeDS](https://see-ds.vercel.app), [KMapX](https://kmapx.vercel.app), and [EG Suite](https://eg-suite.vercel.app)

---

## What is GateLab?

GateLab is a browser-based 3D visualizer for digital logic circuits, built to cover every unit of the CS22303 syllabus. It is not a textbook companion — it is a replacement for the moment when a diagram stops making sense. Every module is designed around one idea:

> **The broken circuit is the explanation.**

A floating AND input glowing red teaches more than ten rows of a truth table. A race condition spark teaches hazards better than any paragraph. GateLab builds the failure first, then the fix.

---

## What It Will Cover

GateLab ships in five units, each corresponding directly to the CS22303 syllabus. Each unit is a self-contained interactive module deployed as a live update.

| Unit | Topic | Status |
|------|-------|--------|
| I | Boolean Algebra, Logic Gates, K-Maps | 🔧 In Development |
| II | Combinational Circuits | 🔧 Planned |
| III | Sequential Circuits, Flip-Flops, Counters | 🔧 Planned |
| IV | Asynchronous Circuits, Race Conditions, Hazards | 🔧 Planned |
| V | Memory, ROM, PLA, PAL | 🔧 Planned |

Unit I ships first as soon as it is complete. Each subsequent unit is added as a deployed update.

---

## Key Features (Planned)

- **3D Gate Canvas** — Drag-and-drop AND, OR, NOT, NAND, NOR, XOR, XNOR gates with Three.js 3D meshes and live particle signal flow
- **Three Learning Phases per Lesson** — *See It Work → See It Break → You Try* — every lesson includes a deliberate fault state
- **Number Line Visualizer** — 1s and 2s complement animation for binary number systems
- **Canonical Form Builder** — SOP and POS circuits assembled gate-by-gate from a truth table
- **KMapX Bridge** — import a simplified expression from KMapX directly into a GateLab circuit
- **Timing Diagram Panel** — live waveform panel for sequential circuit analysis
- **State Diagram Viewer** — animated state machine alongside the 3D circuit
- **Delay Model Engine** — configurable gate propagation delay for asynchronous circuit simulation
- **Race Condition and Hazard Animator** — visual glitch detection and fix workflow
- **Memory Grid** — 3D grid of RAM/ROM cells with address laser and read/write animation
- **Hamming Code Visualizer** — parity bit placement, error injection, and syndrome-based correction
- **PLA/PAL Grid** — programmable AND/OR planes with clickable connection dots
- **Auto-generated Verilog View** — read-only code panel showing the Verilog equivalent of a built circuit

---

## Tech Stack

- Vanilla JavaScript + Three.js
- No build step — runs directly in the browser
- Deployed on Vercel

---

## Part of the Omega Mu Gamma Studio

GateLab is the fourth tool from Omega Mu Gamma Studio, a student-built suite of open-source engineering education tools.

| Tool | What it does |
|------|-------------|
| [SeeDS](https://see-ds.vercel.app) | 3D data structure visualizer |
| [KMapX](https://kmapx.vercel.app) | Karnaugh map simplifier with don't-care support |
| [EG Suite](https://eg-suite.vercel.app) | 3D Engineering Graphics simulator (ME22201) |
| GateLab | 3D digital logic playground (CS22303) — *this repo* |

---

## Status

> GateLab is in early development. The repository structure is scaffolded and active development begins with Unit I. This README will be updated as each unit ships.

---

## License

MIT License · © 2026 Omega Mu Gamma Studio