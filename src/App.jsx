/**
 * App.jsx
 *
 * Root layout.
 *
 * Home page:  TopBar + Home (full width, no panels)
 * Workspace:  TopBar + [Sidebar | ControlPanel+Canvas | InfoPanel]
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
import GateCanvas from './components/canvas/GateCanvas'
import Home from './pages/Home'
import './index.css'

// Vertical rhythm of the centre column: top bar 5% : canvas 75% : dialogue 20%
const TOPBAR_H = '5vh'

function WorkspaceView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <TopBar />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', marginTop: TOPBAR_H }}>
        {/* Left nav — 20% of the workspace width when expanded */}
        <Sidebar />

        {/* Centre: control strip + canvas + dialogue box — 60% of the workspace width */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          <ControlPanel />
          {/* Canvas + dialogue split the remaining height 75:20 (ControlPanel takes the rest) */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
            <div style={{ flex: '75 1 0%', minHeight: 0, display: 'flex' }}>
              <GateCanvas />
            </div>
            <DialogueBox />
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
    </>
  ) : (
    <WorkspaceView />
  )
}