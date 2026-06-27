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
import GateCanvas from './components/canvas/GateCanvas'
import Home from './pages/Home'
import './index.css'

function WorkspaceView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <TopBar />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', marginTop: '52px' }}>
        {/* Left nav */}
        <Sidebar />

        {/* Centre: control strip + canvas */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          <ControlPanel />
          <GateCanvas />
        </div>

        {/* Right info panel — always visible */}
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
      <div style={{ paddingTop: '52px' }}>
        <Home />
      </div>
    </>
  ) : (
    <WorkspaceView />
  )
}
