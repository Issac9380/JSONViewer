import { useState, useCallback, useRef, useEffect } from 'react'

interface MainLayoutProps {
  left: React.ReactNode
  right: React.ReactNode
  defaultRatio?: number
  minRatio?: number
  maxRatio?: number
}

export default function MainLayout({
  left,
  right,
  defaultRatio = 0.6,
  minRatio = 0.3,
  maxRatio = 0.8
}: MainLayoutProps) {
  const [ratio, setRatio] = useState(defaultRatio)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const onMouseDown = useCallback(() => {
    dragging.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [])

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const newRatio = (e.clientX - rect.left) / rect.width
      setRatio(Math.min(maxRatio, Math.max(minRatio, newRatio)))
    }

    const onMouseUp = () => {
      if (dragging.current) {
        dragging.current = false
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [minRatio, maxRatio])

  return (
    <div ref={containerRef} style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      <div style={{ width: `${ratio * 100}%`, minWidth: 0, overflow: 'hidden' }}>
        {left}
      </div>
      <div
        onMouseDown={onMouseDown}
        style={{
          width: 4,
          cursor: 'col-resize',
          background: 'var(--border-color, #30363d)',
          flexShrink: 0,
          transition: dragging.current ? 'none' : 'background 0.2s'
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLElement).style.background = '#1677ff'
        }}
        onMouseLeave={(e) => {
          if (!dragging.current) {
            (e.target as HTMLElement).style.background = 'var(--border-color, #30363d)'
          }
        }}
      />
      <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
        {right}
      </div>
    </div>
  )
}
