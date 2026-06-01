import { useState, useCallback, useEffect } from 'react'

export default function RetroWindow({
  id,
  title,
  children,
  onClose,
  onMinimize,
  onFocus,
  zIndex = 1,
  icon = '📁',
  initialPosition = { x: 80, y: 40 },
  width = 480,
  height = 400,
  isActive = false,
  resizable = false,
  minimized = false,
}) {
  const [position, setPosition] = useState(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isMaximized, setIsMaximized] = useState(false)
  const [prevPosition, setPrevPosition] = useState(initialPosition)

  const handleMouseDown = useCallback((e) => {
    if (isMaximized) return
    e.preventDefault()
    setIsDragging(true)
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
    if (onFocus) onFocus(id)
  }, [position, isMaximized, onFocus, id])

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e) => {
      setPosition({
        x: Math.max(0, e.clientX - dragOffset.x),
        y: Math.max(0, e.clientY - dragOffset.y),
      })
    }

    const handleMouseUp = () => setIsDragging(false)

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset])

  const handleMaximize = () => {
    if (isMaximized) {
      setPosition(prevPosition)
      setIsMaximized(false)
    } else {
      setPrevPosition(position)
      setPosition({ x: 0, y: 0 })
      setIsMaximized(true)
    }
  }

  const style = isMaximized
    ? { top: 0, left: 0, width: '100%', height: 'calc(100vh - 36px)', zIndex, display: minimized ? 'none' : 'flex' }
    : { top: position.y, left: position.x, width, zIndex, display: minimized ? 'none' : 'flex' }

  return (
    <div
      className="retro-window"
      style={style}
      onMouseDown={() => onFocus && onFocus(id)}
    >
      {/* Title Bar */}
      <div
        className={`retro-titlebar ${!isActive ? 'retro-titlebar-inactive' : ''}`}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-1 overflow-hidden">
          <span className="text-[10px]">{icon}</span>
          <span className="truncate text-[12px]">{title}</span>
        </div>
        <div className="flex gap-[2px]">
          <button className="retro-title-btn" onClick={() => onMinimize && onMinimize(id)} title="Minimize">
            <span className="leading-none" style={{ fontSize: '8px' }}>_</span>
          </button>
          <button className="retro-title-btn" onClick={handleMaximize} title="Maximize">
            <span className="leading-none" style={{ fontSize: '9px' }}>□</span>
          </button>
          <button className="retro-title-btn" onClick={() => onClose && onClose(id)} title="Close">
            <span className="leading-none" style={{ fontSize: '10px' }}>✕</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div
        className="flex-1 overflow-auto p-2"
        style={isMaximized ? {} : { maxHeight: height - 26 }}
      >
        {children}
      </div>
    </div>
  )
}
