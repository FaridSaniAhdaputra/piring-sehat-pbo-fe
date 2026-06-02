import React, { useState } from 'react';
import RetroButton from '../ui/RetroButton';

/**
 * ============================================================================
 * COMPONENT: DisplayProperties (Control Panel Display Settings)
 * ============================================================================
 * Dialog box replika persis Windows 95 Display Properties dengan Monitor Tabung
 * CRT interaktif sebagai penunjuk *live preview* perubahan tema dan wallpaper!
 * ============================================================================
 */
export default function DisplayProperties({
  currentTheme,
  setTheme,
  currentWallpaper,
  setWallpaper,
  screensaverEnabled,
  setScreensaverEnabled,
  screensaverTimeout,
  setScreensaverTimeout,
  widgetsEnabled,
  setWidgetsEnabled,
  onTestScreensaver,
  onClose
}) {
  const [activeTab, setActiveTab] = useState('background'); // background, screensaver, appearance

  // State lokal sebelum ditekan tombol 'Apply' atau 'OK'
  const [tempTheme, setTempTheme] = useState(currentTheme);
  const [tempWallpaper, setTempWallpaper] = useState(currentWallpaper);
  const [tempSvEnabled, setTempSvEnabled] = useState(screensaverEnabled);
  const [tempSvTimeout, setTempSvTimeout] = useState(screensaverTimeout);
  const [tempWidgetsEnabled, setTempWidgetsEnabled] = useState(widgetsEnabled);

  const handleApply = () => {
    setTheme(tempTheme);
    setWallpaper(tempWallpaper);
    setScreensaverEnabled(tempSvEnabled);
    setScreensaverTimeout(tempSvTimeout);
    setWidgetsEnabled(tempWidgetsEnabled);
  };

  const handleOK = () => {
    handleApply();
    if (onClose) onClose();
  };

  // Render Monitor Preview Miniatur bergaya Windows 95
  const renderMonitorPreview = () => {
    let previewClass = 'bg-[#008080]'; // default
    if (tempWallpaper === 'classic') previewClass = 'wallpaper-classic';
    if (tempWallpaper === 'grid') previewClass = 'wallpaper-grid bg-[#008080]';
    if (tempWallpaper === 'synthwave') previewClass = 'wallpaper-synthwave';
    if (tempWallpaper === 'matrix') previewClass = 'wallpaper-matrix';

    let titleBarColor = 'linear-gradient(90deg, #000080, #1084d0)';
    let windowColor = '#c0c0c0';
    let textColor = '#000000';

    if (tempTheme === 'theme-vaporwave') {
      titleBarColor = 'linear-gradient(90deg, #b000b0, #00ffff)';
      windowColor = '#2a085c';
      textColor = '#00ffff';
    } else if (tempTheme === 'theme-matrix') {
      titleBarColor = 'linear-gradient(90deg, #005000, #00ff00)';
      windowColor = '#071508';
      textColor = '#33ff33';
    } else if (tempTheme === 'theme-dark') {
      titleBarColor = 'linear-gradient(90deg, #1f1f1f, #383838)';
      windowColor = '#242424';
      textColor = '#e0e0e0';
    }

    return (
      <div className="flex flex-col items-center justify-center bg-[#eaeaea] p-2 border-2 border-gray-400 rounded-sm mb-2">
        {/* Layar CRT Monitor Tabung */}
        <div className="w-[150px] h-[100px] bg-black border-8 border-[#d3d3d3] shadow-md flex items-center justify-center relative overflow-hidden rounded-md" style={{ boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.8), 2px 2px 4px rgba(0,0,0,0.4)' }}>
          {/* Latar Belakang Monitor Sesuai Pilihan Wallpaper */}
          <div className={`w-full h-full flex items-center justify-center p-2 relative ${previewClass}`}>
            
            {/* Jendela Properti Windows Miniatur */}
            <div className="w-[100px] h-[70px] border border-white flex flex-col shadow-lg z-[2]" style={{ background: windowColor, borderColor: '#fff #404040 #404040 #fff' }}>
              {/* Title Bar Mini */}
              <div className="h-[12px] w-full flex items-center px-1 justify-between select-none" style={{ background: titleBarColor }}>
                <span className="text-[6px] font-bold text-white leading-none">Preview</span>
                <span className="text-[6px] text-white leading-none">✕</span>
              </div>
              {/* Content Mini */}
              <div className="flex-1 p-1 flex flex-col gap-1">
                <div className="h-[8px] w-full border border-gray-400" style={{ background: '#fff' }} />
                <div className="h-[8px] w-[50px] border border-gray-400" style={{ background: '#fff' }} />
                <div className="h-[10px] w-full mt-auto border flex items-center justify-center text-[5px] font-bold" style={{ color: textColor, background: windowColor, borderColor: '#fff #404040 #404040 #fff' }}>
                  OK
                </div>
              </div>
            </div>

            {/* Grid Baris Horizontal Matrix Falling Rain di Monitor (jika matrix) */}
            {tempWallpaper === 'matrix' && (
              <div className="absolute inset-0 font-mono text-[6px] text-[#00ff00] opacity-40 select-none pointer-events-none p-1">
                101010101<br/>010101010<br/>101010101<br/>010101010
              </div>
            )}
          </div>
        </div>

        {/* Leher & Kaki Monitor CRT */}
        <div className="w-[34px] h-[10px] bg-[#c0c0c0] border-x-2 border-gray-400" />
        <div className="w-[70px] h-[6px] bg-[#b0b0b0] border-t border-white rounded-sm shadow-sm" />
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] text-black text-[12px]">
      
      {/* ─── LIVE MONITOR PREVIEW ─── */}
      {renderMonitorPreview()}

      {/* ─── TAB NAVIGATION ─── */}
      <div className="flex gap-[2px] border-b-2 border-white select-none">
        <button
          className={`retro-tab ${activeTab === 'background' ? 'retro-tab-active' : ''}`}
          onClick={() => setActiveTab('background')}
        >
          Background
        </button>
        <button
          className={`retro-tab ${activeTab === 'screensaver' ? 'retro-tab-active' : ''}`}
          onClick={() => setActiveTab('screensaver')}
        >
          Screen Saver
        </button>
        <button
          className={`retro-tab ${activeTab === 'appearance' ? 'retro-tab-active' : ''}`}
          onClick={() => setActiveTab('appearance')}
        >
          Appearance
        </button>
      </div>

      {/* ─── TAB CONTENT BOX ─── */}
      <div className="retro-raised flex-1 p-3 mt-[-2px] bg-[#c0c0c0] z-[0] flex flex-col justify-between">
        
        {/* 1. CONTENT: BACKGROUND WALLPAPER */}
        {activeTab === 'background' && (
          <div className="flex flex-col gap-2 h-full">
            <span className="font-bold text-[#000080]">🖼️ Desktop Wallpaper Pattern</span>
            <p className="text-[11px] text-gray-700">Pilih pola latar belakang visual yang ingin Anda terapkan pada desktop PiringSehat:</p>
            <div className="retro-scroll-area flex-1 min-h-[80px] bg-white">
              <div 
                className={`p-2 cursor-pointer hover:bg-[#000080] hover:text-white ${tempWallpaper === 'classic' ? 'bg-[#000080] text-white font-bold' : ''}`}
                onClick={() => setTempWallpaper('classic')}
              >
                Teal Klasik (Solid Windows 95)
              </div>
              <div 
                className={`p-2 cursor-pointer hover:bg-[#000080] hover:text-white ${tempWallpaper === 'grid' ? 'bg-[#000080] text-white font-bold' : ''}`}
                onClick={() => setTempWallpaper('grid')}
              >
                Dynamic Retro Grid (Retro Dot Pattern)
              </div>
              <div 
                className={`p-2 cursor-pointer hover:bg-[#000080] hover:text-white ${tempWallpaper === 'synthwave' ? 'bg-[#000080] text-white font-bold' : ''}`}
                onClick={() => setTempWallpaper('synthwave')}
              >
                Synthwave Sunset Grid (Neon Grid Wave)
              </div>
              <div 
                className={`p-2 cursor-pointer hover:bg-[#000080] hover:text-white ${tempWallpaper === 'matrix' ? 'bg-[#000080] text-white font-bold' : ''}`}
                onClick={() => setTempWallpaper('matrix')}
              >
                Matrix Digital Rain (Terminal Grid Black)
              </div>
            </div>
          </div>
        )}

        {/* 2. CONTENT: SCREEN SAVER TIMEOUT */}
        {activeTab === 'screensaver' && (
          <div className="flex flex-col gap-2 h-full">
            <span className="font-bold text-[#000080]">🌌 Screen Saver Simulation</span>
            <div className="flex items-center gap-3">
              <input
                id="sv-enable"
                type="checkbox"
                checked={tempSvEnabled}
                onChange={(e) => setTempSvEnabled(e.target.checked)}
                className="cursor-pointer accent-[#000080]"
              />
              <label htmlFor="sv-enable" className="font-semibold cursor-pointer">
                Aktifkan Screensaver Starfield Klasik
              </label>
            </div>
            
            <div className="flex items-center gap-2 mt-1">
              <span className="text-gray-700">Waktu Idle sebelum aktif:</span>
              <select
                disabled={!tempSvEnabled}
                value={tempSvTimeout}
                onChange={(e) => setTempSvTimeout(Number(e.target.value))}
                className="retro-input w-24 bg-white border border-gray-400 py-0.5 px-1 disabled:opacity-50"
              >
                <option value={60000}>1 Menit</option>
                <option value={180000}>3 Menit</option>
                <option value={300000}>5 Menit</option>
              </select>
            </div>

            <div className="retro-groupbox mt-2 p-2">
              <span className="retro-groupbox-label font-bold text-[#000080]">Pratinjau Langsung</span>
              <p className="text-[11px] text-gray-600 mb-2">Ingin merasakan simulasi meluncur menembus luar angkasa bernada retro 8-bit secara layar penuh?</p>
              <RetroButton onClick={onTestScreensaver} className="w-full font-bold">
                🚀 Test Screensaver
              </RetroButton>
            </div>
          </div>
        )}

        {/* 3. CONTENT: APPEARANCE SCHEME TEMA */}
        {activeTab === 'appearance' && (
          <div className="flex flex-col gap-2 h-full">
            <span className="font-bold text-[#000080]">🎨 System Color Theme Scheme</span>
            <p className="text-[11px] text-gray-700">Ganti tema warna keseluruhan sistem (jendela, tombol, font, judul bar) secara instan:</p>
            
            <div className="retro-scroll-area overflow-y-auto bg-white" style={{ maxHeight: '110px' }}>
              <div 
                className={`p-2 cursor-pointer hover:bg-[#000080] hover:text-white ${tempTheme === 'theme-classic' ? 'bg-[#000080] text-white font-bold' : ''}`}
                onClick={() => setTempTheme('theme-classic')}
              >
                Windows 95 Standard (Classic Grey & Teal)
              </div>
              <div 
                className={`p-2 cursor-pointer hover:bg-[#000080] hover:text-white ${tempTheme === 'theme-vaporwave' ? 'bg-[#000080] text-white font-bold' : ''}`}
                onClick={() => setTempTheme('theme-vaporwave')}
              >
                Vaporwave Neon Sunset (Purple & Cyan Glow)
              </div>
              <div 
                className={`p-2 cursor-pointer hover:bg-[#000080] hover:text-white ${tempTheme === 'theme-matrix' ? 'bg-[#000080] text-white font-bold' : ''}`}
                onClick={() => setTempTheme('theme-matrix')}
              >
                Matrix Green Code (Dark Green Terminal)
              </div>
              <div 
                className={`p-2 cursor-pointer hover:bg-[#000080] hover:text-white ${tempTheme === 'theme-dark' ? 'bg-[#000080] text-white font-bold' : ''}`}
                onClick={() => setTempTheme('theme-dark')}
              >
                Retro Windows Dark Mode (Midnight Grey)
              </div>
            </div>

            {/* Pengaturan Widget Desktop */}
            <div className="retro-groupbox p-2">
              <span className="retro-groupbox-label font-bold text-[#000080]">Desktop Widgets</span>
              <div className="flex items-center gap-3">
                <input
                  id="widgets-enable"
                  type="checkbox"
                  checked={tempWidgetsEnabled}
                  onChange={(e) => setTempWidgetsEnabled(e.target.checked)}
                  className="cursor-pointer accent-[#000080]"
                />
                <label htmlFor="widgets-enable" className="font-semibold cursor-pointer text-[11px]">
                  Tampilkan Widget Desktop (Analog Clock, System Monitor, Sticky Note)
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ─── LOWER DIALOG ACTION BUTTONS ─── */}
        <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-gray-300">
          <RetroButton onClick={handleOK} primary className="w-20">
            OK
          </RetroButton>
          <RetroButton onClick={onClose} className="w-20">
            Cancel
          </RetroButton>
          <RetroButton 
            onClick={handleApply} 
            disabled={currentTheme === tempTheme && currentWallpaper === tempWallpaper && screensaverEnabled === tempSvEnabled && screensaverTimeout === tempSvTimeout && widgetsEnabled === tempWidgetsEnabled} 
            className="w-20"
          >
            Apply
          </RetroButton>
        </div>

      </div>
    </div>
  );
}
