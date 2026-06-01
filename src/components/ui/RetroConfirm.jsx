import React from 'react'
import { createPortal } from 'react-dom'
import RetroButton from './RetroButton'

export default function RetroConfirm({ message, onConfirm, onCancel, title = "Confirm" }) {
  const modalContent = (
    <div className="fixed inset-0 flex items-center justify-center z-[9999]" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="retro-window w-80 shadow-[2px_2px_10px_rgba(0,0,0,0.5)]" style={{ position: 'relative', margin: 'auto' }}>
        {/* Title Bar */}
        <div className="retro-titlebar">
          <div className="flex items-center gap-1 overflow-hidden">
            <span className="text-[10px]">❓</span>
            <span className="truncate text-[12px]">{title}</span>
          </div>
          <div className="flex gap-[2px]">
            <button type="button" className="retro-title-btn" onClick={onCancel} title="Close">
              <span className="leading-none" style={{ fontSize: '10px' }}>✕</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <span className="text-3xl select-none" style={{ marginTop: '-2px' }}>❓</span>
            <div className="text-[12px] whitespace-pre-wrap text-left flex-1 font-semibold leading-relaxed">
              {message}
            </div>
          </div>
          
          <div className="flex justify-end gap-2 w-full mt-2">
            <RetroButton onClick={onConfirm} primary className="w-20">Yes</RetroButton>
            <RetroButton onClick={onCancel} className="w-20">No</RetroButton>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
