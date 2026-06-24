# GateLab

**A 2D interactive logic circuit playground for CS22303 — Digital Principles and System Design**

Built by [Omega Mu Gamma Studio](https://github.com/Omega-Mu-Gamma-Studio) · the team behind [SeeDS](https://see-ds.vercel.app), [Java Chan](https://java-chan.vercel.app), [KMapX](https://kmapx.vercel.app), and [EG Suite](https://eg-suite.vercel.app)

---

## What is GateLab?

GateLab is a browser-based interactive schematic editor and circuit simulator, built to cover every unit of the CS22303 — Digital Principles and System Design syllabus. It is not a textbook companion — it is a replacement for the moment when a diagram stops making sense.

Every module is built around one idea:

> **The broken circuit is the explanation.**

A floating AND input glowing red teaches more than ten rows of a truth table. A race condition glitch animating through a wire teaches hazards better than any paragraph. GateLab builds the failure first, then the fix.

Digital logic is inherently flat. So is GateLab. Every gate, wire, IC layout, PLA grid, and memory array is rendered on a 2D Konva canvas — because a schematic **is** the correct representation, and fighting a 3D camera to show fundamentally flat information helps no one.

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

## Unit Breakdown

### Unit I — Boolean Algebra, Logic Gates, K-Maps

The foundation. Three interactive tools live side by side.

**The Gate Canvas** is an infinite, zoomable, pannable Konva workspace. Drag AND, OR, NOT, NAND, NOR, XOR, and XNOR gates from the palette onto the canvas. Draw wires by clicking output pins and dragging to input pins. Toggle input nodes between 0 and 1. Hit Simulate — signal propagation evaluates the graph and every wire and output node color-codes in real time: green for HIGH, red for LOW, grey for floating or unconnected.

Every lesson runs three phases — *See It Work → See It Break → You Try.* The Break phase pre-severs a wire or leaves an input floating. The student sees the failure propagate visually through the circuit before being given the blank canvas to reconstruct it themselves.

**The Number System Visualizer** is a side panel — binary, octal, and hex conversion with animated bit-flip highlights. 1s complement and 2s complement are shown step by step with bit cells that flip color as each transformation step runs.

**The K-Map Module** is an interactive grid — click cells to fill in a 2/3/4-variable K-Map, watch groups highlight with color overlays, and get the simplified Boolean expression. The **Send to Canvas** button takes the simplified expression and auto-generates a gate circuit on the schematic canvas from it. Simplify on the K-Map, click the button, watch the gates appear.

---

### Unit II — Combinational Circuits

The canvas shifts from primitive gates to **functional circuit blocks** — Full Adder, 4:1 MUX, 3:8 Decoder, 4-bit Comparator, BCD to 7-segment Decoder. Each block is a Konva rectangle with labeled input and output pins. Wire blocks together. Simulate. Watch signal propagation animate connection by connection.

**Block Mode** shows functional units as black boxes. **Expand Mode** dissolves any block into its constituent gates inline on the canvas — the Full Adder breaks open into its 9-gate implementation with all internal wires visible.

The 4-bit Ripple Carry Adder lesson shows carry propagation as a timed animation — each Full Adder computes in sequence, the carry wire lights up and passes right, sum bits appear in order. The visual ripple is the lesson.

The 7-segment Decoder lesson maps output wires directly to a rendered 7-segment display component on the canvas. Input a BCD value, simulate, and the correct segments illuminate.

---

### Unit III — Sequential Circuits, Flip-Flops, Counters

The most complex unit. The Konva canvas shows flip-flop schematics with their input pins (S/R, J/K, D, T, Clock, Clear, Preset), but two side panels carry equal weight.

**The Timing Diagram Panel** draws clock, input, and output waveforms in real time as the user toggles inputs and ticks the clock. Every clock edge, every state change, every Q transition extends the waveform live. The student builds the timing diagram themselves by interacting with the circuit.

**The State Diagram Panel** shows the current state machine as a directed graph — nodes are states, edges are transitions labeled with input conditions. The active state node pulses as inputs change and the clock ticks. For counters, the state diagram is a ring of states cycling through the sequence.

The **Ripple Counter visualizer** places flip-flops side by side on the canvas, Q connected to the next clock input in a chain. Each clock tick propagates through the chain with staggered timing — because ripple means the flip-flops don't all update at once. A 4-bit binary readout counts in sync below the canvas.

---

### Unit IV — Asynchronous Circuits, Race Conditions, Hazards

The "broken circuit" philosophy at full power.

The **Hazard Sandbox** is a Konva canvas showing an asynchronous combinational circuit with configurable propagation delays on each gate — small delay badges the student can adjust with a slider. Simulate and signal propagation happens over simulated time, not instantaneously. When a race condition exists, two paths of different delays arrive at a gate out of sync and the canvas shows the **glitch** — a brief unwanted pulse flashing on the output wire before the circuit settles.

The Timing Diagram Panel shows the glitch as a spike in the output waveform. The student adds the consensus term by dragging a new gate onto the canvas. Re-simulate — the glitch disappears and the waveform smooths. That moment is the lesson.

The simulation engine is event-driven internally — a JS priority queue sorted by event time, emitting state changes over simulated time. Konva's animation loop plays them back at a readable speed. A timeline scrubber lets the student step through the simulation frame by frame.

---

### Unit V — Memory, ROM, PLA, PAL

**The Memory Grid** — SRAM, DRAM, and ROM lessons use a 2D Konva grid of memory cells. Input an address on the left bus, hit Read, and the row decoder highlights the target row, column selectors fire, and the addressed cell lights up and sends its value down the data bus. DRAM refresh is a periodic sweep across all rows. The flat grid shows all cells simultaneously — no camera angle to manage, no occlusion.

**The PLA/PAL Grid** is a dot-matrix diagram — AND plane on top, OR plane below, clickable dots at intersections to program connections. Click a dot to add a connection, click again to remove. Simulate an input vector and the signal flows through the AND plane (highlighting active product terms) then through the OR plane (OR-ing selected terms) to the output as a spreading highlight animation.

**The Hamming Code Visualizer** is a React bit-cell component. Enter a data word, watch parity bits placed at the correct power-of-2 positions, see parity group membership highlighted for each bit. Inject an error by clicking any bit to flip it. Hit Detect — each parity group lights up showing its XOR result, the binary syndrome points to the error bit, which flashes red. Hit Correct — it flips back. The syndrome-to-error-position mapping is the whole lesson.

---

## Key Features

- **Konva Gate Canvas** — drag-and-drop AND, OR, NOT, NAND, NOR, XOR, XNOR gates with IEEE schematic symbols, pin-to-pin wire drawing, and live signal propagation coloring
- **Three Learning Phases per Lesson** — *See It Work → See It Break → You Try* — every lesson includes a deliberate fault state
- **K-Map Module with Send to Canvas** — simplify a Boolean expression on an interactive K-Map and auto-generate the gate circuit from it
- **Block Mode + Expand Mode** — view combinational circuits as functional blocks or dissolve them to gate level inline
- **Live Timing Diagram Panel** — waveforms that grow in real time as the student interacts with sequential circuits
- **State Diagram Viewer** — animated current-state tracking alongside the schematic for flip-flops and counters
- **Hazard Sandbox with Configurable Delays** — per-gate propagation delay sliders, live glitch visualization, and fix workflow
- **Event-Driven Async Simulator** — JS priority queue engine with timeline scrubber for asynchronous circuit replay
- **Memory Grid Visualizer** — 2D address/data animation for SRAM, DRAM, and ROM
- **PLA/PAL Dot Matrix** — clickable AND/OR plane programming with animated signal flow
- **Hamming Code Visualizer** — interactive error injection, syndrome detection, and bit correction
- **Auto-generated Verilog View** — read-only panel showing the Verilog equivalent of the current canvas circuit, derived from topological sort of the gate graph
- **Number System Visualizer** — animated binary, octal, hex conversion and 1s/2s complement step-through

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| App shell & UI | React + Vite |
| Global state | Zustand |
| Canvas & schematics | Konva.js |
| UI transitions & animations | Framer Motion |
| Simulation engine | Vanilla JS (pure graph evaluator, event-driven for async) |
| Deployment | Vercel |

No Three.js. The entire product is 2D — which is correct for this domain. Digital logic schematics are flat, and the tool reflects that.

---

## Project Structure

```
GateLab/
├── public/
│   └── favicon.svg
│
├── src/
│   ├── main.jsx                    # Vite entry point
│   ├── App.jsx                     # Root component, routing
│   │
│   ├── components/
│   │   ├── ui/                     # All non-canvas React UI
│   │   │   ├── Sidebar.jsx         # Unit/lesson navigation panel
│   │   │   ├── ControlPanel.jsx    # Input toggles, simulate button, mode switcher
│   │   │   ├── InfoDrawer.jsx      # Lesson phase text (See It Work / Break / You Try)
│   │   │   ├── TimingDiagram.jsx   # Live waveform panel (Units III & IV)
│   │   │   ├── StateDiagram.jsx    # State machine graph viewer (Unit III)
│   │   │   ├── VerilogPanel.jsx    # Auto-generated read-only Verilog view
│   │   │   └── PhaseIndicator.jsx  # See It Work → Break → You Try phase badge
│   │   │
│   │   ├── canvas/                 # Konva canvas components
│   │   │   ├── GateCanvas.jsx      # Main schematic canvas (Units I–II)
│   │   │   ├── FlipFlopCanvas.jsx  # Sequential circuit canvas (Unit III)
│   │   │   ├── HazardCanvas.jsx    # Async circuit canvas with delay badges (Unit IV)
│   │   │   ├── MemoryGrid.jsx      # SRAM/DRAM/ROM grid canvas (Unit V)
│   │   │   └── PLAGrid.jsx         # PLA/PAL dot matrix canvas (Unit V)
│   │   │
│   │   ├── gates/                  # Konva gate shape definitions
│   │   │   ├── AndGate.js
│   │   │   ├── OrGate.js
│   │   │   ├── NotGate.js
│   │   │   ├── NandGate.js
│   │   │   ├── NorGate.js
│   │   │   ├── XorGate.js
│   │   │   ├── XnorGate.js
│   │   │   └── GatePin.js          # Input/output pin circle with snap logic
│   │   │
│   │   └── widgets/                # Self-contained interactive sub-components
│   │       ├── KMapGrid.jsx        # K-Map interactive cell grid
│   │       ├── NumberVisualizer.jsx # Binary/octal/hex/complement animator
│   │       ├── HammingVisualizer.jsx # Bit cell error injection and syndrome view
│   │       └── SevenSegDisplay.jsx  # 7-segment display component (Unit II)
│   │
│   ├── engine/                     # Simulation logic — zero knowledge of Konva or React
│   │   ├── GraphEvaluator.js       # Combinational circuit evaluation (topological sort + propagate)
│   │   ├── EventSimulator.js       # Event-driven async simulator (priority queue, time steps)
│   │   ├── FlipFlopModels.js       # SR, JK, D, T flip-flop state transition functions
│   │   ├── VerilogEmitter.js       # Generates Verilog from gate graph via topological sort
│   │   └── HammingEngine.js        # Parity bit placement, syndrome calculation, error correction
│   │
│   ├── store/                      # Zustand global state slices
│   │   ├── lessonStore.js          # Active unit, active lesson, phase (Work/Break/Try)
│   │   ├── canvasStore.js          # Gate positions, wire connections, node IDs
│   │   ├── signalStore.js          # Current signal values across all nodes
│   │   └── timingStore.js          # Timing diagram waveform history
│   │
│   └── lessons/                    # Lesson content as structured JS/JSON data
│       ├── unit1/
│       │   ├── index.js            # Unit I lesson manifest
│       │   ├── 01-and-gate.js
│       │   ├── 02-or-gate.js
│       │   ├── 03-not-gate.js
│       │   ├── 04-nand-nor.js
│       │   ├── 05-xor-xnor.js
│       │   ├── 06-boolean-laws.js
│       │   ├── 07-sop-pos.js
│       │   ├── 08-kmap-2var.js
│       │   ├── 09-kmap-3var.js
│       │   └── 10-kmap-4var.js
│       ├── unit2/
│       │   ├── index.js
│       │   ├── 01-half-adder.js
│       │   ├── 02-full-adder.js
│       │   ├── 03-ripple-carry-adder.js
│       │   ├── 04-subtractor.js
│       │   ├── 05-encoder.js
│       │   ├── 06-decoder.js
│       │   ├── 07-mux.js
│       │   ├── 08-demux.js
│       │   └── 09-comparator.js
│       ├── unit3/
│       │   ├── index.js
│       │   ├── 01-sr-latch.js
│       │   ├── 02-sr-flipflop.js
│       │   ├── 03-jk-flipflop.js
│       │   ├── 04-d-flipflop.js
│       │   ├── 05-t-flipflop.js
│       │   ├── 06-ripple-counter.js
│       │   ├── 07-mod-n-counter.js
│       │   ├── 08-ring-counter.js
│       │   └── 09-johnson-counter.js
│       ├── unit4/
│       │   ├── index.js
│       │   ├── 01-async-circuits-intro.js
│       │   ├── 02-race-conditions.js
│       │   ├── 03-static-hazards.js
│       │   ├── 04-dynamic-hazards.js
│       │   ├── 05-hazard-elimination.js
│       │   └── 06-delay-model.js
│       └── unit5/
│           ├── index.js
│           ├── 01-sram.js
│           ├── 02-dram.js
│           ├── 03-rom.js
│           ├── 04-eprom-flash.js
│           ├── 05-pla.js
│           ├── 06-pal.js
│           └── 07-hamming-code.js
│
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

---

## The Team

GateLab is built by two people.

**Alberto Felix** ([@albertofelix](https://github.com/albertofelix08)) — Project Lead & Creative Lead. Product vision, interaction design, unit architecture, lesson design.

**Aaron Mcgeo** ([@aaronmcgeo](https://github.com/aaronmcgeo)) — Co-Lead. Implementation partner, co-architect.

---

## Part of the Omega Mu Gamma Studio

GateLab is the fourth tool from Omega Mu Gamma Studio, a student-built suite of open-source engineering education tools.

| Tool | What it does |
|------|-------------|
| [SeeDS](https://see-ds.vercel.app) | 3D data structure visualizer |
| [Java-chan](https://github.com/Omega-Mu-Gamma-Studio/Java-Chan) | Anime-guided interactive Java tutor (CS22301) |
| [KMapX](https://kmapx.vercel.app) | Karnaugh map simplifier with don't-care support |
| [EG Suite](https://eg-suite.vercel.app) | 3D Engineering Graphics simulator (ME22201) |
| GateLab | 2D digital logic schematic playground (CS22303) — *this repo* |

---

## Status

> GateLab is in active pre-development. The architecture and tech stack have been finalized. Unit I development begins next. This README will be updated as each unit ships.

---

## License

MIT License · © 2026 Omega Mu Gamma Studio
