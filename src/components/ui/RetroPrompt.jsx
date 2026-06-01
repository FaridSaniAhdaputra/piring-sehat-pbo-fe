import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import RetroButton from './RetroButton'
import RetroTextarea from './RetroTextarea'

export default function RetroPrompt({ message, onSubmit, onCancel, title = "Input Required", defaultValue = "" }) {
  const [value, setValue] = useState(defaultValue)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(value)
  }

  const modalContent = (
    <div className="fixed inset-0 flex items-center justify-center z-[9999]" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="retro-window w-96 shadow-[2px_2px_10px_rgba(0,0,0,0.5)]" style={{ position: 'relative', margin: 'auto' }}>
        {/* Title Bar */}
        <div className="retro-titlebar">
          <div className="flex items-center gap-1 overflow-hidden">
            <span className="text-[10px]">💬</span>
            <span className="truncate text-[12px]">{title}</span>
          </div>
          <div className="flex gap-[2px]">
            <button type="button" className="retro-title-btn" onClick={onCancel} title="Close">
              <span className="leading-none" style={{ fontSize: '10px' }}>✕</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-3">
          {message && <div className="text-[12px] mb-2">{message}</div>}
          
          <RetroTextarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full min-h-[100px]"
            autoFocus
            required
          />

          <div className="flex justify-end gap-2 mt-2">
            <RetroButton type="submit" primary className="w-20">OK</RetroButton>
            <RetroButton type="button" onClick={onCancel} className="w-20">Cancel</RetroButton>
          </div>
        </form>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
