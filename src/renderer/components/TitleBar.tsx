import { useEffect, useState } from 'react'

export default function TitleBar() {
  const [maximized, setMaximized] = useState(false)

  useEffect(() => {
    window.electronAPI.getWindowState().then(setMaximized)
    window.electronAPI.onWindowStateChanged(setMaximized)
  }, [])

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 36,
        padding: '0 12px',
        background: 'var(--titlebar-bg, #1e1e1e)',
        color: 'var(--titlebar-color, #ccc)',
        WebkitAppRegion: 'drag',
        flexShrink: 0
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 500 }}>JSON Viewer</span>
      <div style={{ WebkitAppRegion: 'no-drag', display: 'flex', gap: 2 }}>
        <button
          onClick={() => window.electronAPI.minimizeWindow()}
          style={{
            border: 'none', background: 'transparent', color: 'inherit',
            cursor: 'pointer', fontSize: 16, padding: '4px 10px',
            borderRadius: 4, lineHeight: 1
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          —
        </button>
        <button
          onClick={() => window.electronAPI.maximizeWindow()}
          style={{
            border: 'none', background: 'transparent', color: 'inherit',
            cursor: 'pointer', fontSize: 14, padding: '4px 10px',
            borderRadius: 4, lineHeight: 1
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          {maximized ? '❐' : '□'}
        </button>
        <button
          onClick={() => window.electronAPI.closeWindow()}
          style={{
            border: 'none', background: 'transparent', color: 'inherit',
            cursor: 'pointer', fontSize: 16, padding: '4px 10px',
            borderRadius: 4, lineHeight: 1
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#e81123'; e.currentTarget.style.color = '#fff' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'inherit' }}
        >
          ✕
        </button>
      </div>
    </div>
  )
}
