/**
 * App.jsx
 *
 * Root layout.
 *
 * Home page:  TopBar + Home (full width, no panels)
 * Workspace:  TopBar + [Sidebar | ControlPanel+Canvas | InfoPanel]
 *
 * The DialogueBox is a floating, draggable card layered over the canvas
 * (not a docked row) — see DialogueBox.jsx for why. Canvas gets its full
 * height back since nothing permanently reserves space below it anymore.
 *
 * InfoPanel is a permanent right column — always visible in the workspace.
 * No open/close state needed.
 */
import { useLessonStore } from './store/lessonStore'
import TopBar from './components/ui/TopBar'
import Sidebar from './components/ui/Sidebar'
import ControlPanel from './components/ui/ControlPanel'
import InfoPanel from './components/ui/InfoDrawer'
import DialogueBox from './components/ui/DialogueBox'
import PlotBox from './components/ui/PlotBox'
import GateCanvas from './components/canvas/GateCanvas'
import Home from './pages/Home'
import PDA from './components/pda/PDA'
import './index.css'

const TOPBAR_H = '5vh'

function WorkspaceView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <TopBar />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', marginTop: TOPBAR_H }}>
        {/* Left nav — 20% of the workspace width when expanded */}
        <Sidebar />

        {/* Centre: control strip + canvas — 60% of the workspace width */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          <ControlPanel />
          {/* relative wrapper so the floating DialogueBox anchors to the
              canvas area itself, not the whole window */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: 0 }}>
            <GateCanvas />
            <DialogueBox />
            <PlotBox />
          </div>
        </div>

        {/* Right info panel — 20% of the workspace width, always visible */}
        <InfoPanel />
      </div>
    </div>
  )
}

export default function App() {
  const { activeUnitId } = useLessonStore()

  return activeUnitId === null ? (
    <>
      <TopBar />
      <div style={{ paddingTop: TOPBAR_H }}>
        <Home />
      </div>
      <PDA />
    </>
  ) : (
    <>
      <WorkspaceView />
      <PDA />
    </>
  )
}