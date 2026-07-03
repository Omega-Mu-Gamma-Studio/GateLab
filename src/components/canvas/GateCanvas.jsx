/**
 * GateCanvas.jsx
 *
 * Main Konva Stage. Three modes:
 *   - No unit active      → GateGallery
 *   - Lesson not built    → ComingSoon (ShipOS reskin)
 *   - Lesson loaded       → Full circuit render
 *
 * Wire drawing (try phase only):
 *   1. Click any OUTPUT PIN (on gate, INPUT node, or CONST node) → startDragWire
 *   2. Move mouse → ghost wire follows cursor
 *   3. Release near an input pin (gate input or OUTPUT node input) → commitDragWire
 *   4. Release in empty space or Escape → cancelDragWire
 *   5. Click an existing wire → removeWire
 *
 * INPUT node body click → toggleInput (all phases)
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { Stage, Layer, Text, Rect } from 'react-konva'
import GateShape from '../gates/GateShape'
import { InputNode, OutputNode, ConstNode } from '../gates/SpecialNodes'
import WireLayer from './WireLayer'
import GateGallery from './GateGallery'
import SuccessCard from '../ui/SuccessCard'
import KMapWidget from '../widgets/KMapWidget'
import { useGateTheme } from '../../hooks/useGateTheme'
import { useCanvasStore } from '../../store/canvasStore'
import { useLessonStore } from '../../store/lessonStore'
import usePdaStore from '../../store/pdaStore'
import { getPinWorldPos, getAllPins } from '../gates/GatePin'
import { hitTestPin } from '../../engine/WireRouter'
import { generateTruthTable, truthTableToMarkdown } from '../../engine/TruthTable'

const GATE_TYPES = new Set(['AND','OR','NOT','NAND','NOR','XOR','XNOR'])
const SNAP_RADIUS = 24   // px — how close pointer must be to snap to a pin

const LESSON_NAMES = {
  1: ['AND Gate','OR Gate','NOT Gate','NAND & NOR','XOR & XNOR','Boolean Laws','SOP & POS','K-Map 2-Var','K-Map 3-Var','K-Map 4-Var'],
  2: ['Half Adder','Full Adder','Ripple Carry Adder','Subtractor','Encoder','Decoder','Multiplexer','Demultiplexer','Comparator'],
  3: ['SR Latch','SR Flip-Flop','JK Flip-Flop','D Flip-Flop','T Flip-Flop','Ripple Counter','Mod-N Counter','Ring Counter','Johnson Counter'],
  4: ['Async Intro','Race Conditions','Static Hazards','Dynamic Hazards','Hazard Elimination','Delay Model'],
  5: ['SRAM','DRAM','ROM','EPROM & Flash','PLA','PAL','Hamming Code'],
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

/**
 * DispatchTerminal (was: HintBar)
 * - Work/Break phase: subtle, 12px, bottom strip
 * - Try phase: 56px tall, 14px, accent colour, unmissable
 */
function ComingSoon({ name, canvasW, canvasH, theme }) {
  return (
    <>
      <Rect
        x={canvasW / 2 - 160} y={canvasH / 2 - 60}
        width={320} height={120}
        cornerRadius={12}
        fill="rgba(10,13,10,0.6)"
        stroke={(theme?.accentBorder) || 'rgba(0,255,136,0.15)'}
        strokeWidth={1}
        listening={false}
      />
      <Text
        x={0} y={canvasH / 2 - 28} width={canvasW}
        text="◈  SHIPBOARD SYSTEMS"
        fontSize={10}
        fontFamily="'JetBrains Mono', monospace"
        fill={theme?.textMuted || '#4a5248'}
        align="center" letterSpacing={4}
        listening={false}
      />
      <Text
        x={0} y={canvasH / 2 - 8} width={canvasW}
        text={name || 'Lesson'}
        fontSize={20}
        fontFamily="'Space Grotesk', sans-serif"
        fontStyle="600"
        fill={theme?.textH || '#eef2ee'}
        align="center" listening={false}
      />
      <Text
        x={0} y={canvasH / 2 + 22} width={canvasW}
        text="MODULE PENDING INSTALLATION"
        fontSize={9}
        fontFamily="'JetBrains Mono', monospace"
        fill={theme?.textMuted || '#4a5248'}
        align="center" letterSpacing={3}
        listening={false}
      />
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export default function GateCanvas() {
  const theme        = useGateTheme()
  const containerRef = useRef(null)
  const stageRef     = useRef(null)
  const [size, setSize] = useState({ w: 800, h: 500 })
  const [showSuccess, setShowSuccess] = useState(false)

  // Track pointer position for snap feedback on OutputNode
  const [pointerPos, setPointerPos] = useState(null)

  // Which OUTPUT node's truth-table button is mid-"✓ copied" flash, if any
  const [copiedNodeId, setCopiedNodeId] = useState(null)

  const { activeUnitId, activeLessonIdx, narrative, meta, nextLesson, goHome } = useLessonStore()
  const storyMode = usePdaStore(s => s.storyMode)

  const nodes          = useCanvasStore(s => s.nodes)
  const wires          = useCanvasStore(s => s.wires)
  const signals        = useCanvasStore(s => s.signals)
  const inputs         = useCanvasStore(s => s.inputs)
  const hint           = useCanvasStore(s => s.hint)
  const faultNodeId    = useCanvasStore(s => s.faultNodeId)
  const selectedNodeId = useCanvasStore(s => s.selectedNodeId)
  const dragWire       = useCanvasStore(s => s.dragWire)
  const phase          = useCanvasStore(s => s.phase)
  const lessonSolved   = useCanvasStore(s => s.lessonSolved)
  const kmapConfig     = useCanvasStore(s => s.kmapConfig)

  const toggleInput    = useCanvasStore(s => s.toggleInput)
  const moveNode       = useCanvasStore(s => s.moveNode)
  const selectNode     = useCanvasStore(s => s.selectNode)
  const clearSelection = useCanvasStore(s => s.clearSelection)
  const startDragWire  = useCanvasStore(s => s.startDragWire)
  const updateDragWire = useCanvasStore(s => s.updateDragWire)
  const commitDragWire = useCanvasStore(s => s.commitDragWire)
  const cancelDragWire = useCanvasStore(s => s.cancelDragWire)
  const removeWire     = useCanvasStore(s => s.removeWire)
  const setSolved      = useCanvasStore(s => s.setSolved)

  const isTryPhase = phase === 'try'

  // ── Responsive sizing ────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(entries => {
      for (const e of entries) {
        const { width, height } = e.contentRect
        setSize({ w: Math.floor(width), h: Math.floor(height) })
      }
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  // ── Escape key to cancel drag wire ───────────────────────────────────────
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape' && dragWire) cancelDragWire()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dragWire, cancelDragWire])

  // ── Success detection (Group 2.2) ────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'try') return
    if (lessonSolved) return  // already triggered
    const outputNode = nodes.find(n => n.type === 'OUTPUT')
    if (outputNode && signals[outputNode.id]?.output === true) {
      const lessonId = meta?.id || null
      setSolved(lessonId)
      usePdaStore.getState().triggerLessonComplete(lessonId, narrative?.lore, meta?.title)
      setShowSuccess(true)
    }
  }, [signals, phase, nodes, lessonSolved, setSolved])

  // Hide success card when phase changes
  useEffect(() => {
    setShowSuccess(false)
  }, [phase, activeLessonIdx])

  // ── Collect all input pins for snap hit-testing ──────────────────────────
  const allInputPins = useCallback(() => {
    const pins = []
    for (const node of nodes) {
      const { inputs: iPins } = getAllPins(node)
      if (iPins) {
        iPins.forEach((pos, idx) => {
          pins.push({ nodeId: node.id, role: 'input', index: idx, x: pos.x, y: pos.y })
        })
      }
    }
    return pins
  }, [nodes])

  // ── Stage pointer handlers ───────────────────────────────────────────────
  function handleMouseMove(e) {
    const pos = stageRef.current?.getPointerPosition()
    if (!pos) return
    setPointerPos(pos)
    if (dragWire) updateDragWire({ x: pos.x, y: pos.y })
  }

  function handleMouseUp() {
    if (!dragWire) return
    const pos = stageRef.current?.getPointerPosition()
    if (!pos) { cancelDragWire(); return }
    const hit = hitTestPin(pos, allInputPins(), SNAP_RADIUS)
    hit ? commitDragWire(hit.nodeId, hit.index) : cancelDragWire()
  }

  function handleStageClick(e) {
    if (e.target === stageRef.current) clearSelection()
  }

  // ── Start drag wire from any output pin ─────────────────────────────────
  function handleOutputPinClick(nodeId) {
    if (!isTryPhase) return
    const node = nodes.find(n => n.id === nodeId)
    if (!node) return
    const fromPos = getPinWorldPos(node, 'output')
    startDragWire(nodeId, fromPos)
  }

  // ── Copy-as-truth-table: sweep every INPUT node, copy markdown ───────────
  // Available in any phase — this is a study aid, not a wiring action, so
  // it isn't gated behind isTryPhase the way wire drawing is.
  async function handleCopyTruthTable(outputNodeId) {
    const table = generateTruthTable(nodes, wires, outputNodeId)
    if (!table) return
    const markdown = truthTableToMarkdown(table)
    try {
      await navigator.clipboard.writeText(markdown)
    } catch {
      // Clipboard API can be blocked (insecure origin, permissions) — the
      // flash still fires below so the click doesn't feel dead, and the
      // table was still generated correctly even if it couldn't be copied.
    }
    setCopiedNodeId(outputNodeId)
    setTimeout(() => setCopiedNodeId(id => (id === outputNodeId ? null : id)), 1400)
  }

  // ── Is this OUTPUT node currently a snap target? ─────────────────────────
  function isSnapTarget(node) {
    return getSnapPinIndex(node) !== -1
  }

  // ── Which specific input pin (by index) on this node is in snap range? ───
  // Returns -1 if none. Used to highlight exactly one pin on gates that have
  // several inputs, instead of glowing the whole node for any nearby pin.
  function getSnapPinIndex(node) {
    if (!dragWire || !pointerPos) return -1
    const pins = getAllPins(node)
    if (!pins.inputs?.length) return -1
    return pins.inputs.findIndex(pin =>
      Math.hypot(pin.x - pointerPos.x, pin.y - pointerPos.y) < SNAP_RADIUS
    )
  }

  // ── Is the in-progress drag wire currently over ANY valid pin? ───────────
  // Drives the ghost wire's color in WireLayer — bright/solid when it would
  // snap somewhere on release, muted/dashed while it's still searching.
  const dragWireIsValid = !!dragWire && nodes.some(isSnapTarget)

  // ── Node renderer ────────────────────────────────────────────────────────
  function renderNode(node) {
    const sig    = signals[node.id]
    const outVal = sig?.output
    const inVals = sig?.inputs || []

    if (node.type === 'INPUT') {
      return (
        <InputNode
          key={node.id}
          node={node}
          value={inputs[node.id]}
          theme={theme}
          selected={selectedNodeId === node.id}
          onClick={() => { selectNode(node.id); toggleInput(node.id) }}
          onOutputPinClick={isTryPhase && !dragWire ? () => handleOutputPinClick(node.id) : undefined}
        />
      )
    }

    if (node.type === 'OUTPUT') {
      return (
        <OutputNode
          key={node.id}
          node={node}
          value={outVal}
          theme={theme}
          snapTarget={!!dragWire && isSnapTarget(node)}
          onCopyTruthTable={() => handleCopyTruthTable(node.id)}
          copied={copiedNodeId === node.id}
        />
      )
    }

    if (node.type === 'CONST') {
      return (
        <ConstNode
          key={node.id}
          node={node}
          theme={theme}
          onOutputPinClick={isTryPhase && !dragWire ? () => handleOutputPinClick(node.id) : undefined}
        />
      )
    }

    if (GATE_TYPES.has(node.type)) {
      return (
        <GateShape
          key={node.id}
          type={node.type}
          x={node.x} y={node.y}
          scale={node.scale ?? 1}
          inputValues={inVals}
          outputValue={outVal}
          error={node.id === faultNodeId}
          selected={selectedNodeId === node.id}
          draggable={isTryPhase && !node.locked}
          theme={theme}
          onClick={() => selectNode(node.id)}
          onOutputPinClick={isTryPhase && !dragWire ? () => handleOutputPinClick(node.id) : undefined}
          onDragEnd={({ x, y }) => moveNode(node.id, x, y)}
          snapPinIndex={dragWire ? getSnapPinIndex(node) : -1}
        />
      )
    }

    return null
  }

  // ── Background — oscilloscope-tinted grid ────────────────────────────────
  const accentRgb = theme?.accentRgb || '0,255,136'
  const bgStyle = {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    background: `
      radial-gradient(ellipse at 50% 30%, ${theme?.accentGlow || 'rgba(0,255,136,0.08)'} 0%, transparent 60%),
      repeating-linear-gradient(0deg,  transparent, transparent 31px, rgba(${accentRgb},0.06) 31px, rgba(${accentRgb},0.06) 32px),
      repeating-linear-gradient(90deg, transparent, transparent 31px, rgba(${accentRgb},0.06) 31px, rgba(${accentRgb},0.06) 32px)
    `,
  }

  const lessonName = LESSON_NAMES[activeUnitId]?.[activeLessonIdx] || ''

  return (
    <div
      ref={containerRef}
      style={bgStyle}
      onMouseLeave={() => dragWire && cancelDragWire()}
    >
      <Stage
        ref={stageRef}
        width={size.w} height={size.h}
        style={{ display: 'block', cursor: dragWire ? 'crosshair' : 'default' }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleStageClick}
      >
        <Layer>
          {!activeUnitId && (
            <GateGallery canvasW={size.w} canvasH={size.h} theme={theme} />
          )}

          {activeUnitId && nodes.length === 0 && !kmapConfig && (
            <ComingSoon name={lessonName} canvasW={size.w} canvasH={size.h} theme={theme} />
          )}

          {activeUnitId && nodes.length > 0 && (
            <>
              <WireLayer
                nodes={nodes}
                wires={wires}
                signals={signals}
                dragWire={dragWire}
                dragValid={dragWireIsValid}
                theme={theme}
                onWireClick={isTryPhase ? removeWire : undefined}
              />
              {nodes.map(renderNode)}
            </>
          )}
        </Layer>
      </Stage>

      {/* K-Map overlay — rendered as HTML above the canvas when lesson uses kmapConfig */}
      {activeUnitId && kmapConfig && (
        <div style={{
          position: 'absolute',
          inset: 0,
          overflow: 'auto',
          zIndex: 10,
        }}>
          <KMapWidget
            config={kmapConfig}
            theme={theme}
            onSolve={({ simplified }) => {
              const lessonId = meta?.id || null
              setSolved(lessonId)
              usePdaStore.getState().triggerLessonComplete(lessonId, narrative?.lore, meta?.title)
              setShowSuccess(true)
            }}
          />
        </div>
      )}

      {/* Success overlay — rendered as HTML above the canvas */}
      {showSuccess && (
        <SuccessCard
          storyMode={storyMode}
          onNext={() => {
            setShowSuccess(false)
            // Story Mode: shift's over, back to the Map (ShipMap) —
            // matches the plan's Core Loop step 5. Standard Mode keeps
            // the original behaviour of chaining straight to the next
            // lesson in the unit.
            if (storyMode) goHome()
            else nextLesson()
          }}
          onDismiss={() => setShowSuccess(false)}
        />
      )}
    </div>
  )
}