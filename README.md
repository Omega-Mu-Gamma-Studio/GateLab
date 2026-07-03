# GateLab

**A browser-based digital logic learning environment for CS22303 — Digital Principles and System Design**

Built by [Omega Mu Gamma Studio](https://github.com/Omega-Mu-Gamma-Studio) · a student-built open-source studio

---

## What is GateLab?

GateLab is an interactive logic circuit simulator built to cover the full CS22303 syllabus. It is not a textbook companion. It is a replacement for the moment when a diagram stops making sense.

Every lesson is built around one idea:

> **The broken circuit is the explanation.**

A floating AND input glowing red teaches more than ten rows of a truth table. A race condition glitch animating through a wire teaches hazards better than any paragraph. GateLab shows the failure first, then the fix.

It ships as **two modes**, and it's important to be upfront about what each one actually is right now:

| Mode | What it is | Status |
|------|-----------|--------|
| **Standard Mode** | The original MVP. Unit grid → lesson → OBSERVE/FAULT/REPAIR. All five units, all 41 lessons. | ✅ **Complete and usable end-to-end.** |
| **Story Mode** | The AETHER-9 spaceship framing — a Ship Map you walk around, NPCs, a PDA, quarters, all of it wrapping the *same* lesson engine. | 🚧 **Current focus. This is the direction the project is actually headed.** |

Standard Mode is the finished product from phase one — it works, it's playable, it covers the syllabus. Story Mode is where the studio's attention is now, and it's the mode that makes GateLab feel like something instead of just a circuit tool with a spaceship coat of paint over it. If you're evaluating this repo for the first time: play Standard Mode to see that the pedagogy works, then play Story Mode to see where it's going.

---

## The Setting

GateLab is framed as an intergalactic spaceship maintenance simulation. You play as a mechanic aboard the **AETHER-9**, working through shift assignments that happen to map exactly to the CS22303 syllabus. Each lesson is a work order. Each unit is a chapter of a thriller narrative that builds across the semester.

Your shift partner **Ada** talks you through each task. **Engineer Reyes** dispatches fault alerts. Captain **Voss** watches from the Bridge with something clearly on their mind about Sub-Level 3. The ship's automated system, **MAINT-SYS**, generates the work logs. None of this is decoration — the narrative framing gives the failure-first pedagogy a reason to exist in-world.

In Standard Mode you get this framing through dialogue and the PDA, but there's no ship to walk around — you go straight from the unit grid into the lesson. **Story Mode is what happens when that framing gets a body.**

---

## Story Mode — the specialty

Story Mode replaces the unit grid with the **Ship Map**: a top-down schematic of the AETHER-9 with clickable rooms. This is the part of GateLab that's currently getting the most design attention, so here's the full breakdown of how it works today.

### The Ship Map

Ten rooms across four decks, connected by corridors, most of them locked behind story flags that unlock as you clear lessons (`unit1_l1`, `unit2_l9`, and so on). Click a room and you get a dialogue line from whoever's there — Ada in the Mess Hall, Reyes in the Engine Room, Voss on the Bridge once you've earned it. Click the **Workstation** and it hands off into the exact same lesson engine Standard Mode uses — Story Mode isn't a separate simulator, it's a narrative shell around the one that already works.

One thing worth calling out because it was a real bug until recently: walking back to the map and re-entering the Workstation used to always restart you at Lesson 1 of the unit, no matter how far you'd gotten. It now resumes at your first incomplete lesson, checked against actual save progress — not against how many times you'd clicked "Next."

### Room art — shipped

This used to be a placeholder-only system; it isn't anymore. All ten rooms now render real background art — a dedicated still per room (Quarters, Mess Hall, Engine Room, Observation Deck, Hydro-Pool, Workstation, Ada's Quarters, Lounge, Bridge, Maintenance Bay), plus a shared "sealed" state image for rooms still locked behind a story flag. The generated CSS "viewport" — tinted gradient, scanline texture, no-feed tag — still exists in the code, but only as the fallback for a room that doesn't have art wired in yet, not as the default state anymore. Adding or swapping a room's art is still a one-line change: set its `bgImage` (and `sealedImage`) path in the room's data entry.

### Your Quarters — and the PDA

Quarters is your bunk, and its entire narrative reason to exist is that it's where you check your PDA. That's now reflected directly in the room itself, not just implied by a line of flavor text: Quarters renders a glowing, pulsing **OPEN PDA** button as the visual focal point of the room. It's not one option among several — it's the point of being there.

### The PDA itself

Every player has a **DECK-7 PDA** — a persistent in-game device accessible from the top bar (Standard Mode) or from Quarters (Story Mode) at any time. It opens to a home screen with five apps:

| App | Color | Content |
|-----|-------|---------|
| **COMM** | Red | Direct messages from Ada, Engineer Reyes, Captain Voss, and MAINT-SYS. Rapport system with branching reply choices. |
| **TASKS** | Yellow | The active work order — work order ID, location, shift, phase status, and current objective. Auto-updates as phases shift. |
| **GALLERY** | White | Photos received from crew members via COMM. |
| **CREW** | Blue | Contact cards for every crew member with role, status, and relationship notes. |
| **LOGS** | Green | Auto-generated lore entries written by MAINT-SYS when a lesson is completed. |
| **[LOCKED]** | — | A sixth app slot, visibly present but inaccessible. Unlocks later in the story. |

The PDA has a full phone form factor — notch, status bar, signal/battery indicators, home indicator pill. Tapping the home pill from any app returns to the home screen.

### Rapport system

Every reply choice in Ada's COMM thread shifts a hidden rapport score (-10 to +10) that determines which dialogue stream she uses: warm, neutral, or cold. Choices are logged with their delta. Unit endings trigger binary story choices that set persistent story flags and unlock flag-gated messages — including, in Story Mode, which rooms on the Ship Map open up.

### Mode lock-in

Story Mode vs. Standard Mode is chosen once per save file, at the Home screen, and then locked — no switching mid-save. This is intentional: the two modes are different enough in framing that flipping back and forth would undercut both.

---

## Standard Mode — the finished MVP

Standard Mode is the part of GateLab that's done. Home screen → unit grid → pick a lesson → work through it. No ship to walk, no rooms to unlock — the PDA, Ada, and the rest of the crew are still present through dialogue and messages, but the wrapper is a straightforward course structure instead of a map.

Every lesson runs three phases:

| Phase | Label | What Happens |
|-------|-------|--------------|
| 1 | **OBSERVE** | The circuit runs correctly. Understand nominal behaviour. |
| 2 | **FAULT** | A fault is injected — a broken wire, a floating input, a race condition. Study the failure. |
| 3 | **REPAIR** | The canvas is cleared. Wire the correct circuit from scratch. |

The phase indicator is always visible. Progress through phases is linear; no phase can be skipped.

### Curriculum coverage

All five units are built out with full lesson content — this was the misleading part of the old README. It's not "in development," it's built:

| Unit | Topic | Lessons |
|------|-------|---------|
| I | Boolean Algebra, Logic Gates, K-Maps | 10 |
| II | Combinational Circuits (Adders, MUX, Decoders, Comparators) | 9 |
| III | Sequential Circuits (Flip-Flops, Latches, Counters) | 9 |
| IV | Asynchronous Circuits (Race Conditions & Hazards) | 6 |
| V | Memory & Programmable Logic (SRAM, ROM, PLA, PAL, Hamming) | 7 |

**41 lessons, all five units, all playable start to finish.**

The Unit III/IV **Timing tab is now a real, live panel** — it wasn't when this README was first drafted. Worth knowing why that took more than "add a chart": the simulation engine was silently reading only the first two inputs on every gate, which quietly broke every JK flip-flop in the curriculum — the master-slave design needs a 3-input NAND for its feedback path, and that third wire was being dropped before it ever reached the evaluator. The Ripple Counter, Mod-N Counter, Ring Counter, and Johnson Counter lessons were all built on flip-flops that couldn't actually hold state. That's fixed now (input count is derived from the real wiring instead of hardcoded per gate type, and feedback loops hold their last value across a recompute instead of forgetting it), and the Timing panel was built on top of the fix rather than on top of the bug.

One limitation from that same dig, flagged rather than hidden: the fix covers the pre-wired OBSERVE and FAULT phases. The REPAIR phase — where the player drags wires in by hand — still only renders two input pins per gate visually, so a 3-input NAND can't be manually rewired to its third pin yet in that phase. That's a gate-geometry and wire-routing change, not an evaluator change, and it's next up rather than done.

What's still genuinely not done: a state diagram viewer for Unit III, a memory grid for Unit V, a PLA/PAL dot matrix, a Hamming code visualizer, a number system step-through. The InfoPanel still shows a placeholder for those tabs. The lessons themselves don't depend on them — you can complete every unit today — but if you go looking for these in the code, know that you'll find empty stub files, not hidden features. They're roadmap, not shipped.

---

## Workspace Layout

The workspace is a three-column layout, shared by both modes once you're inside a lesson:

**Left — Sidebar** (collapsible): unit list and lesson navigator. Collapsed by default when inside a lesson so the canvas gets maximum width. Persists collapse state across sessions.

**Centre — Canvas + ControlPanel**: the interactive circuit area. The DialogueBox floats over the canvas as a draggable card — two voices mapped to phases: Ada (red, OBSERVE phase) and the assigned command speaker (amber, FAULT and REPAIR phases). Position resets per lesson. A small clipboard button in the top-left corner opens the TASKS app directly.

**Right — InfoPanel** (always visible): a tabbed right column. Trivia and **Truth Table** are available in every unit, regardless of the unit's own tab set — Truth Table only needs at least one INPUT and one OUTPUT node, so it works for any circuit on the canvas. On top of those, Units III/IV also get Timing and State. Timing and Truth Table are real, live panels; State is still a placeholder tab (see Key Features below). Verilog isn't an InfoPanel tab anymore — it moved to a dedicated **export modal**, opened from the TopBar.

The Trivia tab is a shuffleable deck of circuit history facts and engineering jokes — designed for the moment right after a fault, when the student needs a second before trying again.

---

## Key Features

**Shipped and playable:**

- **Three-phase lesson structure** — OBSERVE → FAULT → REPAIR, every lesson, no exceptions
- **Fault-first pedagogy** — the broken state is the teaching moment, not an error to avoid
- **41 lessons across all five CS22303 units**, fully wired into the simulation engine
- **DECK-7 PDA** — full in-game phone with home screen, five apps, and a locked sixth slot
- **Rapport system** — Ada's dialogue shifts across warm/neutral/cold bands based on reply choices
- **Story flags** — unit-ending binary choices persist and gate future narrative content, including room unlocks
- **Work order system** — every lesson is a MAINT-SYS ticket with ID, location, shift, and per-phase objectives
- **Floating DialogueBox** — draggable, speaker-labelled dialogue card over the canvas
- **Collapsible Sidebar** — lesson navigator that gets out of the way when you're working
- **Three themes** — Matrix Green · Logic Gold · Signal Blue; persisted in localStorage
- **Ship Map** — walkable room hub with story-flag-gated unlocks and progress-aware lesson resume
- **Room art** — real background stills for all ten rooms, plus a shared sealed-door image for locked rooms; the old CSS placeholder viewport survives only as a fallback for art that isn't wired in yet
- **Timing Diagram** (Units III & IV) — live event-timeline waveform panel, backed by a simulation engine fix that made flip-flop feedback actually hold state instead of silently dropping its third input wire
- **Truth Table panel** — available in every unit, not just some. Sweeps the whole circuit (every OUTPUT at once, so multi-output blocks like a full adder show SUM and CARRY together) and live-highlights the row matching your current input toggles as you flip them
- **Verilog export** — a modal off the TopBar that generates Verilog from the current gate graph and lets you copy it out. This replaced an earlier plan to make Verilog an InfoPanel tab

**On the roadmap, not yet shipped:**

- State Diagram Viewer (Unit III)
- Hazard Sandbox with per-gate delay sliders (Unit IV)
- Memory Grid (Unit V)
- PLA/PAL Dot Matrix (Unit V)
- Hamming Code Visualizer (Unit V)
- Number System Visualizer (Unit I)
- 3-input gate wiring in the REPAIR phase (currently only pre-wired OBSERVE/FAULT phases benefit from the 3-input evaluator fix — dragging a wire to a gate's 3rd pin by hand isn't supported yet)

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
│   ├── App.jsx                     # Root layout: Home | ShipMap | WorkspaceView
│   │
│   ├── components/
│   │   ├── pda/                    # The DECK-7 PDA — in-game phone device
│   │   │   ├── PDA.jsx             # Modal shell: phone frame + home/app routing
│   │   │   ├── HomeScreen.jsx      # Icon grid, ship status strip, locked slot
│   │   │   ├── AppShell.jsx        # Shared app wrapper (back chevron + app header)
│   │   │   ├── TasksApp.jsx        # MAINT-SYS work order viewer
│   │   │   ├── MessagesTab.jsx     # COMM — Ada & crew message threads
│   │   │   ├── PhotosTab.jsx       # GALLERY — received photos
│   │   │   ├── ContactsTab.jsx     # CREW — contact cards
│   │   │   └── NotesTab.jsx        # LOGS — auto-generated lesson lore entries
│   │   │
│   │   ├── ui/                     # Workspace UI
│   │   │   ├── TopBar.jsx          # Fixed header: wordmark, breadcrumb, PDA button, theme picker, Verilog export launcher
│   │   │   ├── Sidebar.jsx         # Collapsible left nav — unit/lesson list
│   │   │   ├── ControlPanel.jsx    # Input toggles, simulate button, phase controls
│   │   │   ├── InfoDrawer.jsx      # Permanent right panel: Timing/State/Truth Table/Trivia tabs
│   │   │   ├── TruthTablePanel.jsx # Live, whole-circuit truth table — every unit, multi-output aware
│   │   │   ├── VerilogExportModal.jsx # Generates Verilog from the gate graph, launched from TopBar
│   │   │   ├── DialogueBox.jsx     # Floating draggable dialogue card (Ada / Command voices)
│   │   │   ├── PlotBox.jsx         # Canvas corner shortcut button → opens TASKS app
│   │   │   ├── PhaseIndicator.jsx  # OBSERVE → FAULT → REPAIR phase badge
│   │   │   ├── OperatorStatus.jsx  # Persistent footer in InfoPanel
│   │   │   ├── SuccessCard.jsx     # Lesson completion overlay
│   │   │   ├── TimingDiagram.jsx   # Live waveform panel for Units III & IV
│   │   │   ├── StateDiagram.jsx    # Stub — roadmap, not yet built
│   │   │   └── VerilogPanel.jsx    # Stub, unused — superseded by VerilogExportModal
│   │   │
│   │   ├── shipmap/                 # Story Mode — Ship Map hub
│   │   │   ├── ShipMapGrid.jsx     # Top-down room grid, corridors, unlock state
│   │   │   ├── ShipMapOverlay.jsx  # Modal shell wrapping the map
│   │   │   ├── LocationScene.jsx   # Per-room background art (bgImage/sealedImage), CSS placeholder fallback
│   │   │   ├── RoomDialoguePanel.jsx # Dialogue line from whoever's in the room
│   │   │   └── shipMapData.js      # Room definitions: id, deck, unlock flag, bgImage, sealedImage
│   │   │
│   │   ├── canvas/                 # Circuit canvas components
│   │   │   ├── GateCanvas.jsx      # Main schematic canvas — powers every lesson, both modes; pin-snap on drag
│   │   │   ├── GateGallery.jsx     # Draggable gate palette
│   │   │   └── WireLayer.jsx       # Wire drawing and routing
│   │   │
│   │   ├── gates/                  # Gate shape definitions
│   │   │   ├── AndGate.js / OrGate.js / NotGate.js / NandGate.js / NorGate.js
│   │   │   ├── XorGate.js / XnorGate.js
│   │   │   ├── GatePin.js / GateShape.jsx / SpecialNodes.jsx / gateGeometry.js
│   │   │
│   │   └── widgets/
│   │       ├── KMapWidget.jsx      # K-Map simplification, Send to Canvas (Unit I)
│   │       ├── SevenSegDisplay.jsx # Stub — roadmap, not yet built
│   │       ├── NumberVisualizer.jsx # Stub — roadmap, not yet built
│   │       ├── HammingVisualizer.jsx # Stub — roadmap, not yet built
│   │       └── KMapGrid.jsx        # Stub — roadmap, not yet built
│   │
│   ├── engine/                     # Simulation logic — no React, no Konva
│   │   └── (graph evaluation, wire routing, and related pure-JS logic)
│   │
│   ├── store/                      # Zustand state slices
│   │   ├── lessonStore.js          # Active unit/lesson/phase — resumes at first incomplete lesson
│   │   ├── canvasStore.js          # Gate positions, wires, node IDs
│   │   ├── pdaStore.js             # PDA nav, message threads, rapport, story flags, storyMode
│   │   ├── progressStore.js        # completedLessons, XP, level — persisted
│   │   └── timingStore.js          # Rolling signal history backing the Timing Diagram
│   │
│   ├── data/
│   │   └── adaMessages.js          # Ada's message bank — trigger-gated, rapport-gated
│   │
│   ├── hooks/
│   │   └── useGateTheme.js
│   │
│   ├── pages/
│   │   ├── Home.jsx                # Landing page + Standard/Story mode select gate
│   │   ├── ShipMap.jsx             # Story Mode hub — rooms, corridors, room art panels
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

Omega Mu Gamma Studio is a student-built open-source studio building interactive learning tools for engineering and CS courses — fourteen tools and counting.

**Course-mapped simulators:**

| Tool | Course | What it does |
|------|--------|-------------|
| [SeeDS](https://github.com/Omega-Mu-Gamma-Studio/SeeDS) | CS22302 | 3D interactive data structures visualizer — the broken structure is the explanation |
| [Java-Chan](https://github.com/Omega-Mu-Gamma-Studio/Java-Chan) | CS22301 | Anime-guided Java tutor — working code, broken code, hands-on practice |
| [KMapX](https://github.com/Omega-Mu-Gamma-Studio/KMapX) | CS22303 | Boolean expression simplifier via Quine–McCluskey with don't-care support |
| GateLab | CS22303 | Digital logic learning environment — *this repo* |
| [ArchVisor](https://github.com/Omega-Mu-Gamma-Studio/ArchVisor) | CS22304 | Interactive Computer Organization & Architecture learning platform |
| [EG Suite](https://github.com/Omega-Mu-Gamma-Studio/EG-Suite) | ME22201 | Interactive 3D Engineering Graphics simulator |
| [ThermOS](https://github.com/Omega-Mu-Gamma-Studio/ThermOS) | ME22301 | Five browser-based modules for Engineering Thermodynamics |

**The "-Chan" language tutor family** — anime-mascot-guided, three-phase (working code / broken code / you try) lesson curricula, each building toward one real shipped project:

| Tool | Focus | What you build by the end |
|------|-------|-------------|
| [PlusPlus-Chan](https://github.com/Omega-Mu-Gamma-Studio/PlusPlus-Chan) | C++ for game dev | A text-based RPG, 75 lessons |
| [Python-Chan](https://github.com/Omega-Mu-Gamma-Studio/Python-Chan) | Python — Foundations, Data Science, ML | Three stacked 75-lesson courses, ending in a trained ML model |
| [Rust-Chan](https://github.com/Omega-Mu-Gamma-Studio/Rust-Chan) | Rust — systems programming via CLI tools | A packaged async CLI tool, ready for crates.io |
| [Go-Chan](https://github.com/Omega-Mu-Gamma-Studio/Go-Chan) | Go — backend APIs | A designed, tested, deployed REST backend |
| [Sharp-Chan](https://github.com/Omega-Mu-Gamma-Studio/Sharp-Chan) | C# and Unity | A complete 2D game, shipped to Itch.io |
| [Kotlin-Chan](https://github.com/Omega-Mu-Gamma-Studio/Kotlin-Chan) | Kotlin, Jetpack Compose, Android | A real Android app, shipped to the Play Store |

---

## Status

> **Standard Mode is complete and usable** — all five units, all 41 lessons, playable start to finish, now backed by a simulation engine that correctly handles 3-input feedback gates and holds flip-flop state across recomputes. **Story Mode is the active focus** — the Ship Map now has real background art in every room, not placeholders, and the PDA-centric Quarters loop is built out on top of the same lesson engine Standard Mode already proved out. The Timing Diagram (Units III & IV) and the Truth Table panel (every unit) are both live, and Verilog export shipped as a TopBar modal. State diagrams, the memory grid, PLA/PAL matrix, Hamming visualizer, and number system visualizer are still roadmap items — empty stub files in the repo, not yet built.

---

## License

MIT License · © 2026 Omega Mu Gamma Studio
