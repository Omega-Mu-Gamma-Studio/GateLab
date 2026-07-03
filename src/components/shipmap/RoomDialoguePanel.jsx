import { SP_COLORS, isRoomOpen } from './shipMapData'

export default function RoomDialoguePanel({ room, activeFlags }) {
  if (!room) {
    return (
      <span style={{ fontSize: '10px', letterSpacing: '0.2em', color: '#1a3050' }}>
        SELECT A ROOM TO PROCEED —
      </span>
    )
  }
  const open = isRoomOpen(room, activeFlags)
  const spLabel = open ? room.dlg.sp : '[ SYSTEM ]'
  const bodyText = open ? room.dlg.txt : room.denial
  const spColor = SP_COLORS[spLabel] ?? '#3fa8d8'

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '8px', letterSpacing: '0.2em', color: '#1e4060', fontFamily: 'var(--mono)' }}>
          {room.deck} · {room.code} · {room.label}
        </span>
        {!open && (
          <span style={{ fontSize: '8px', letterSpacing: '0.15em', color: '#1a2d40', fontFamily: 'var(--mono)' }}>
            ACCESS DENIED
          </span>
        )}
      </div>
      <div style={{ height: '0.5px', background: '#0c1e30', marginBottom: '12px' }} />
      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
        <span style={{
          fontFamily: 'var(--mono)', fontSize: '8px', letterSpacing: '0.1em',
          minWidth: '80px', paddingTop: '2px', color: spColor,
        }}>
          {spLabel}
        </span>
        <span style={{
          fontSize: '13px', lineHeight: 1.7, flex: 1,
          color: open ? '#7aaccc' : '#1e3a55',
          fontStyle: open ? 'normal' : 'italic',
        }}>
          {bodyText}
        </span>
      </div>
    </>
  )
}
