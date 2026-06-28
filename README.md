# GateLab

**A browser-based digital logic learning environment for CS22303 — Digital Principles and System Design**

Built by [Omega Mu Gamma Studio](https://github.com/Omega-Mu-Gamma-Studio) · an eight-tool student-built open-source studio

---

## What is GateLab?

GateLab is an interactive logic circuit simulator built to cover the full CS22303 syllabus. It is not a textbook companion. It is a replacement for the moment when a diagram stops making sense.

Every lesson is built around one idea:

> **The broken circuit is the explanation.**

A floating AND input glowing red teaches more than ten rows of a truth table. A race condition glitch animating through a wire teaches hazards better than any paragraph. GateLab shows the failure first, then the fix.

---

## The Setting

GateLab is framed as an intergalactic spaceship maintenance simulation. You play as a mechanic aboard the **AETHER-9**, working through shift assignments that happen to map exactly to the CS22303 syllabus. Each lesson is a work order. Each unit is a chapter of a thriller narrative that builds across the semester.

Your shift partner **Ada** talks you through each task. **Engineer Reyes** dispatches fault alerts. The ship's automated system, **MAINT-SYS**, generates the work logs. None of this is decoration — the narrative framing gives the failure-first pedagogy a reason to exist in-world.

---

## Learning Structure

Every lesson runs three phases:

| Phase | Label | What Happens |
|-------|-------|--------------|
| 1 | **OBSERVE** | The circuit runs correctly. Understand nominal behaviour. |
| 2 | **FAULT** | A fault is injected — a broken wire, a floating input, a race condition. Study the failure. |
| 3 | **REPAIR** | The canvas is cleared. Wire the correct circuit from scratch. |

The phase indicator is always visible. Progress through phases is linear; no phase can be skipped.

---

## The PDA

Every player has a **DECK-7 PDA** — a persistent in-game device accessible from the top bar at any time. It opens to a home screen with five apps:

| App | Color | Content |
|-----|-------|---------|
| **COMM** | Red | Direct messages from Ada, Engineer Reyes, Captain Voss, and MAINT-SYS. Rapport system with branching reply choices. |
| **TASKS** | Yellow | The active work order — work order ID, location, shift, phase status, and current objective. Auto-updates as phases shift. Replaces the old lesson briefing overlay entirely. |
| **GALLERY** | White | Photos received from crew members via COMM. |
| **CREW** | Blue | Contact cards for every crew member with role, status, and relationship notes. |
| **LOGS** | Green | Auto-generated lore entries written by MAINT-SYS when a lesson is completed. |
| **[LOCKED]** | — | A sixth app slot, visibly present but inaccessible. Unlocks later in the story. |

The PDA has a full phone form factor — notch, status bar, signal/battery indicators, home indicator pill. Tapping the home pill from any app returns to the home screen. A small yellow clipboard button in the canvas corner opens TASKS directly without leaving the workspace.

### Rapport System

Every reply choice in Ada's COMM thread shifts a hidden rapport score (-10 to +10) that determines which dialogue stream she uses: warm, neutral, or cold. Choices are logged with their delta. Unit endings trigger binary story choices that set persistent story flags and unlock flag-gated messages.

---

## Curriculum Coverage

GateLab ships in five units corresponding directly to the CS22303 syllabus.

| Unit | Topic | Lessons | Status |
|------|-------|---------|--------|
| I | Boolean Algebra, Logic Gates, K-Maps | 10 | 🔧 In Development |
| II | Combinational Circuits | 9 | 🔧 Planned |
| III | Sequential Circuits, Flip-Flops, Counters | 9 | 🔧 Planned |
| IV | Asynchronous Circuits, Race Conditions, Hazards | 6 | 🔧 Planned |
| V | Memory, ROM, PLA, PAL | 7 | 🔧 Planned |

---

## Workspace Layout

The workspace is a three-column layout:

**Left — Sidebar** (collapsible): unit list and lesson navigator. Collapsed by default when inside a lesson so the canvas gets maximum width. Persists collapse state across sessions.

**Centre — Canvas + ControlPanel**: the interactive circuit area. The DialogueBox floats over the canvas as a draggable card — two voices mapped to phases: Ada (red, OBSERVE phase) and the assigned command speaker (amber, FAULT and REPAIR phases). Position resets per lesson. A small clipboard button in the top-left corner opens the TASKS app directly.

**Right — InfoPanel** (always visible): a tabbed right column. Tabs shown depend on the active unit:

| Unit | Tabs Available |
|------|---------------|
| I | Trivia |
| II | Verilog · Trivia |
| III | Timing · State · Verilog · Trivia |
| IV | Timing · Verilog · Trivia |
| V | Trivia |

The Trivia tab is a shuffleable deck of circuit history facts and engineering jokes — designed for chill-mode phases when the student needs a second before trying again. The Timing and State tabs serve live waveform and state diagram views for sequential and asynchronous units.

---

## Key Features

- **Three-phase lesson structure** — OBSERVE → FAULT → REPAIR, every lesson, no exceptions
- **Fault-first pedagogy** — the broken state is the teaching moment, not an error to avoid
- **DECK-7 PDA** — full in-game phone with home screen, five apps, and a locked sixth slot
- **Rapport system** — Ada's dialogue shifts across warm/neutral/cold bands based on reply choices
- **Story flags** — unit-ending binary choices persist and gate future narrative content
- **Work order system** — every lesson is a MAINT-SYS ticket with ID, location, shift, and per-phase objectives
- **Floating DialogueBox** — draggable, speaker-labelled dialogue card over the canvas; two voices across phases
- **InfoPanel** — permanent right column with unit-appropriate tabs and a trivia/joke deck
- **Collapsible Sidebar** — lesson navigator that gets out of the way when you're working
- **Three themes** — Matrix Green · Logic Gold · Signal Blue; persisted in localStorage
- **Auto-generated Verilog view** — read-only Verilog panel derived from the gate graph (Unit II+)
- **Live Timing Diagram** — waveforms that grow in real time as the student interacts (Units III & IV)
- **State Diagram Viewer** — animated state machine panel tracking current state alongside the circuit (Unit III)
- **Hazard Sandbox** — per-gate delay sliders, live glitch visualization, event-driven async simulation (Unit IV)
- **Memory Grid** — 2D address/data animation for SRAM, DRAM, and ROM (Unit V)
- **PLA/PAL Dot Matrix** — clickable AND/OR plane programming with animated signal flow (Unit V)
- **Hamming Code Visualizer** — error injection, syndrome detection, and single-bit correction (Unit V)
- **Number System Visualizer** — animated binary, octal, hex, 1s/2s complement step-through (Unit I)
- **KMapX Bridge** — K-Map simplification with Send to Canvas (Unit I)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| App shell & UI | React + Vite |
| Global state | Zustand (with `persist` middleware) |
| Canvas & schematics | Konva.js |
| Simulation engine | Vanilla JS — graph evaluator + event-driven async engine |
| Deployment | Vercel |

No Three.js. Digital logic schematics are inherently flat, and the tool reflects that.

---

## Project Structure

```
GateLab/
├── public/
│   ├── favicon.svg
│   └── icons.svg
│
├── src/
│   ├── main.jsx
│   ├── App.jsx                     # Root layout: Home | WorkspaceView
│   │
│   ├── components/
│   │   ├── pda/                    # The DECK-7 PDA — in-game phone device
│   │   │   ├── PDA.jsx             # Modal shell: phone frame + home/app routing
│   │   │   ├── HomeScreen.jsx      # Icon grid, ship status strip, locked slot
│   │   │   ├── AppShell.jsx        # Shared app wrapper (back chevron + app header)
│   │   │   ├── TasksApp.jsx        # MAINT-SYS work order viewer (replaces PlotBox)
│   │   │   ├── MessagesTab.jsx     # COMM — Ada & crew message threads
│   │   │   ├── PhotosTab.jsx       # GALLERY — received photos
│   │   │   ├── ContactsTab.jsx     # CREW — contact cards
│   │   │   └── NotesTab.jsx        # LOGS — auto-generated lesson lore entries
│   │   │
│   │   ├── ui/                     # Workspace UI
│   │   │   ├── TopBar.jsx          # Fixed header: wordmark, breadcrumb, PDA button, theme picker
│   │   │   ├── Sidebar.jsx         # Collapsible left nav — unit/lesson list
│   │   │   ├── ControlPanel.jsx    # Input toggles, simulate button, phase controls
│   │   │   ├── InfoDrawer.jsx      # Permanent right panel: Timing/State/Verilog/Trivia tabs
│   │   │   ├── DialogueBox.jsx     # Floating draggable dialogue card (Ada / Command voices)
│   │   │   ├── PlotBox.jsx         # Canvas corner shortcut button → opens TASKS app
│   │   │   ├── PhaseIndicator.jsx  # OBSERVE → FAULT → REPAIR phase badge
│   │   │   ├── OperatorStatus.jsx  # Persistent footer in InfoPanel
│   │   │   ├── SuccessCard.jsx     # Lesson completion overlay
│   │   │   ├── TimingDiagram.jsx   # Live waveform panel (Units III & IV)
│   │   │   ├── StateDiagram.jsx    # State machine viewer (Unit III)
│   │   │   └── VerilogPanel.jsx    # Auto-generated read-only Verilog (Unit II+)
│   │   │
│   │   ├── canvas/                 # Circuit canvas components
│   │   │   ├── GateCanvas.jsx      # Main schematic canvas
│   │   │   ├── GateGallery.jsx     # Draggable gate palette
│   │   │   ├── WireLayer.jsx       # Wire drawing and routing
│   │   │   ├── FlipFlopCanvas.jsx  # Sequential circuit canvas (Unit III)
│   │   │   ├── HazardCanvas.jsx    # Async canvas with delay badges (Unit IV)
│   │   │   ├── MemoryGrid.jsx      # SRAM/DRAM/ROM grid (Unit V)
│   │   │   └── PLAGrid.jsx         # PLA/PAL dot matrix (Unit V)
│   │   │
│   │   ├── gates/                  # Gate shape definitions
│   │   │   ├── AndGate.js
│   │   │   ├── OrGate.js
│   │   │   ├── NotGate.js
│   │   │   ├── NandGate.js
│   │   │   ├── NorGate.js
│   │   │   ├── XorGate.js
│   │   │   ├── XnorGate.js
│   │   │   ├── GatePin.js
│   │   │   ├── GateShape.jsx
│   │   │   ├── SpecialNodes.jsx
│   │   │   └── gateGeometry.js
│   │   │
│   │   └── widgets/                # Self-contained interactive components
│   │       ├── KMapGrid.jsx
│   │       ├── NumberVisualizer.jsx
│   │       ├── HammingVisualizer.jsx
│   │       └── SevenSegDisplay.jsx
│   │
│   ├── engine/                     # Simulation logic — no React, no Konva
│   │   ├── GraphEvaluator.js       # Combinational graph evaluation
│   │   ├── EventSimulator.js       # Event-driven async simulator (priority queue)
│   │   ├── FlipFlopModels.js       # SR, JK, D, T state transition functions
│   │   ├── VerilogEmitter.js       # Verilog generation from gate graph
│   │   ├── HammingEngine.js        # Parity, syndrome, correction
│   │   └── WireRouter.js           # Wire path calculation
│   │
│   ├── store/                      # Zustand state slices
│   │   ├── lessonStore.js          # Active unit/lesson/phase — syncs to canvas and PDA
│   │   ├── canvasStore.js          # Gate positions, wires, node IDs
│   │   ├── pdaStore.js             # PDA nav, message threads, rapport, story flags, currentTask
│   │   ├── signalStore.js          # Signal values across all nodes
│   │   └── timingStore.js          # Timing diagram waveform history
│   │
│   ├── data/
│   │   └── adaMessages.js          # Ada's message bank — trigger-gated, rapport-gated
│   │
│   ├── hooks/
│   │   └── useGateTheme.js
│   │
│   ├── pages/
│   │   ├── Home.jsx                # Landing page with unit cards
│   │   └── Journal.jsx
│   │
│   └── lessons/                    # Lesson content as structured JS data
│       ├── index.js
│       ├── unit1/  (10 lessons)    # Boolean Algebra, Logic Gates, K-Maps
│       ├── unit2/  (9 lessons)     # Combinational Circuits
│       ├── unit3/  (9 lessons)     # Sequential Circuits
│       ├── unit4/  (6 lessons)     # Asynchronous Circuits & Hazards
│       └── unit5/  (7 lessons)     # Memory & Programmable Logic
│
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

---

## The Team

**Alberto Felix** ([@albertofelix08](https://github.com/albertofelix08)) — Project-Lead. Circuit engine, lesson design, core simulation, Narrative, UI.

**Aaron McGeo** ([@aaronmcgeo](https://github.com/aaronmcgeo)) — Co-Lead. Implementation, systems architecture.

---

## Part of the Omega Mu Gamma Studio

Omega Mu Gamma Studio is a student-built open-source studio building interactive learning tools for engineering and CS courses.

| Tool | Course | What it does |
|------|--------|-------------|
| [SeeDS](https://github.com/Omega-Mu-Gamma-Studio/SeeDS) | CS | 3D C code visualizer and data structures debugger |
| [Java-Chan](https://github.com/Omega-Mu-Gamma-Studio/Java-Chan) | CS22301 | Anime-guided Java tutor — working code, broken code, hands-on practice |
| [KMapX](https://github.com/Omega-Mu-Gamma-Studio/KMapX) | CS22303 | Boolean expression simplifier via Quine–McCluskey with don't-care support |
| GateLab | CS22303 | Digital logic learning environment — *this repo* |
| [ArchVisor](https://github.com/Omega-Mu-Gamma-Studio/ArchVisor) | CS22304 | Interactive Computer Organization & Architecture learning platform |
| [EG Suite](https://github.com/Omega-Mu-Gamma-Studio/EG-Suite) | ME22201 | Interactive 3D Engineering Graphics simulator |
| [ThermOS](https://github.com/Omega-Mu-Gamma-Studio/ThermOS) | ME22301 | Five browser-based modules for Engineering Thermodynamics |
| [PlusPlus-Chan](https://github.com/Omega-Mu-Gamma-Studio/PlusPlus-Chan) | CS | Anime character-guided C++ tutor |

---

## Status

> GateLab is in active development. The UI shell, narrative system, PDA, lesson architecture, and simulation engine are complete. Unit I circuit lessons are in progress. Units II–V deploy as live updates.

---

## License

MIT License · © 2026 Omega Mu Gamma Studio