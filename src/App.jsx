import { useState } from 'react'
import { useLessonStore } from './store/lessonStore'
import TopBar from './components/ui/TopBar'
import Sidebar from './components/ui/Sidebar'
import ControlPanel from './components/ui/ControlPanel'
import InfoDrawer from './components/ui/InfoDrawer'
import GateCanvas from './components/canvas/GateCanvas'
import Home from './pages/Home'
import './index.css'

function WorkspaceView() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden',
    }}>
      <TopBar />

      {/* Below topbar */}
      <div style={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
        marginTop: '52px',
      }}>
        <Sidebar />

        {/* Main area: control strip + canvas */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          <ControlPanel onOpenDrawer={() => setDrawerOpen(true)} />
          <GateCanvas />
        </div>
      </div>

      <InfoDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
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