import { useState, useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import RetroWindow from "./components/ui/RetroWindow";
import RetroAlert from "./components/ui/RetroAlert";
import AuthWindow from "./components/auth/AuthWindow";
import HealthCalculatorContainer from "./components/calculator/HealthCalculatorContainer";
import CalorieTracker from "./components/calories/CalorieTracker";
import FoodSearchExplorer from "./components/food/FoodSearchExplorer";
import CommunityForum from "./components/forum/CommunityForum";

// Pembaruan Modul Visual & Audio Retro Baru
import DisplayProperties from "./components/desktop/DisplayProperties";
import DesktopWidgets from "./components/desktop/DesktopWidgets";
import InteractiveScreensaver from "./components/desktop/InteractiveScreensaver";
import RetroBootScreen from "./components/desktop/RetroBootScreen";
import {
  playStartupSound,
  playShutdownSound,
  playOpenWindowSound
} from "./utils/audioSynth";
import {
  AuthIcon,
  CalculatorIcon,
  TrackerIcon,
  ExplorerIcon,
  ForumIcon,
  DisplaySettingsIcon
} from "./components/ui/PixelIcons";

import "./App.css";

export default function App() {
  const { user, isRecoveryFlow } = useAuth();
  const [windows, setWindows] = useState([]);
  const [activeWindowId, setActiveWindowId] = useState(null);
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [time, setTime] = useState(new Date());
  const [alertMessage, setAlertMessage] = useState(null);
  const [booting, setBooting] = useState(true);

  // ─── STATE KUSTOMISASI RETRO DESKTOP ───
  const [theme, setTheme] = useState(() => localStorage.getItem('retro_theme') || 'theme-classic');
  const [wallpaper, setWallpaper] = useState(() => {
    const val = localStorage.getItem('retro_wallpaper') || 'classic';
    if (val === 'wallpaper-grid') return 'grid';
    if (val === 'wallpaper-synthwave') return 'synthwave';
    if (val === 'wallpaper-matrix') return 'matrix';
    if (val === 'wallpaper-classic' || val === 'classic') return 'classic';
    return val;
  });

  const [screensaverEnabled, setScreensaverEnabled] = useState(() => {
    const val = localStorage.getItem('retro_screensaver_enabled');
    return val !== 'false'; // default true
  });

  const [screensaverTimeout, setScreensaverTimeout] = useState(() => {
    return Number(localStorage.getItem('retro_screensaver_timeout')) || 180000; // default 3 menit
  });

  const [screensaverActive, setScreensaverActive] = useState(false);

  const [widgetsEnabled, setWidgetsEnabled] = useState(() => {
    const val = localStorage.getItem('retro_widgets_enabled');
    return val !== 'false'; // default true
  });

  // ─── EFFECT: SAVING RETRO WIDGETS CONFIG ───
  useEffect(() => {
    localStorage.setItem('retro_widgets_enabled', widgetsEnabled);
  }, [widgetsEnabled]);

  // ─── CLOCK TIMER EFFECT ───
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ─── EFFECT: TEMA SISTEM (CSS VARIABLES CLASS) ───
  useEffect(() => {
    // Bersihkan kelas tema lama di elemen body
    document.body.className = "";
    if (theme !== 'theme-classic') {
      document.body.classList.add(theme);
    }
    localStorage.setItem('retro_theme', theme);
  }, [theme]);

  // ─── EFFECT: WALLPAPER SETTING SAVING ───
  useEffect(() => {
    localStorage.setItem('retro_wallpaper', wallpaper);
  }, [wallpaper]);

  // ─── EFFECT: SAVING SCREENSAVER CONFIG ───
  useEffect(() => {
    localStorage.setItem('retro_screensaver_enabled', screensaverEnabled);
    localStorage.setItem('retro_screensaver_timeout', screensaverTimeout);
  }, [screensaverEnabled, screensaverTimeout]);

  // ─── EFFECT: DETEKSI IDLE DETIK SCREENSAVER ───
  useEffect(() => {
    if (!screensaverEnabled || screensaverActive) return;

    let timeoutId;
    const resetIdleTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setScreensaverActive(true);
      }, screensaverTimeout);
    };

    // Deteksi aktivitas user
    window.addEventListener('mousemove', resetIdleTimer);
    window.addEventListener('keydown', resetIdleTimer);
    window.addEventListener('click', resetIdleTimer);
    window.addEventListener('touchstart', resetIdleTimer);

    resetIdleTimer();

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', resetIdleTimer);
      window.removeEventListener('keydown', resetIdleTimer);
      window.removeEventListener('click', resetIdleTimer);
      window.removeEventListener('touchstart', resetIdleTimer);
    };
  }, [screensaverEnabled, screensaverTimeout, screensaverActive]);

  // ─── REGISTRASI APLIKASI DESKTOP ───
  const apps = {
    auth: {
      id: "auth",
      title: "PiringSehat - Login",
      icon: <AuthIcon size={16} />,
      component: AuthWindow,
      width: 400,
      height: 560, // Dioptimalkan bertinggi 560 agar form register + OAuth pas bersih tanpa scrollbar
    },
    calculator: {
      id: "calculator",
      title: "Health Calculator 3-in-1",
      icon: <CalculatorIcon size={16} />,
      component: HealthCalculatorContainer,
      width: 600,
      height: 720, // Dioptimalkan bertinggi 720 agar semua tab (BMI, Genetik, Protein) beserta tabel hasil & riwayat tampil penuh tanpa scrollbar
    },
    calories: {
      id: "calories",
      title: "Calorie Tracker",
      icon: <TrackerIcon size={16} />,
      component: CalorieTracker,
      width: 580,
      height: 670, // Cukup untuk kalender, daily progress bar, form tambah makanan, log makan, dan status bar
    },
    food: {
      id: "food",
      title: "Food Explorer",
      icon: <ExplorerIcon size={16} />,
      component: FoodSearchExplorer,
      width: 500,
      height: 530, // Cukup untuk bar pencarian, hasil pencarian, dan status bar
    },
    forum: {
      id: "forum",
      title: "Community Forum",
      icon: <ForumIcon size={16} />,
      component: CommunityForum,
      width: 760,
      height: 640, // Lapang untuk postingan diskusi, membalas, dan antarmuka forum
    },
    display: {
      id: "display",
      title: "Display Properties",
      icon: <DisplaySettingsIcon size={16} />,
      component: DisplayProperties,
      width: 440,
      height: 510, // Pas dengan monitor preview, tab, dan tombol aksi tanpa scrollbar
    }
  };

  const protectedApps = ["calculator", "calories", "food"];

  const openWindow = (appId) => {
    setStartMenuOpen(false);

    // Mainkan efek suara saat jendela baru terbuka
    playOpenWindowSound();

    if (protectedApps.includes(appId) && !user) {
      setAlertMessage("Anda harus login terlebih dahulu untuk mengakses fitur ini.");
      appId = "auth";
    }
    setActiveWindowId(appId);
    setWindows((prevWindows) => {
      const existing = prevWindows.find((w) => w.id === appId);
      if (existing) {
        return prevWindows.map((w) => ({
          ...w,
          minimized: w.id === appId ? false : w.minimized,
          zIndex: w.id === appId ? 999 : w.zIndex > 0 ? w.zIndex - 1 : 0,
        }));
      } else {
        return [
          ...prevWindows.map((w) => ({ ...w, zIndex: w.zIndex > 0 ? w.zIndex - 1 : 0 })),
          { ...apps[appId], zIndex: 999, minimized: false },
        ];
      }
    });
  };

  const closeWindow = (appId) => {
    setWindows((prevWindows) => prevWindows.filter((w) => w.id !== appId));
    if (activeWindowId === appId) setActiveWindowId(null);
  };

  const focusWindow = (appId) => {
    setActiveWindowId(appId);
    setWindows((prevWindows) =>
      prevWindows.map((w) => ({
        ...w,
        minimized: w.id === appId ? false : w.minimized,
        zIndex: w.id === appId ? 999 : w.zIndex > 0 ? w.zIndex - 1 : 0,
      })),
    );
  };

  const minimizeWindow = (appId) => {
    setWindows((prevWindows) =>
      prevWindows.map((w) =>
        w.id === appId ? { ...w, minimized: true } : w
      )
    );
    if (activeWindowId === appId) setActiveWindowId(null);
  };

  const handleTaskbarClick = (appId) => {
    const targetWin = windows.find((w) => w.id === appId);
    if (!targetWin) return;

    if (activeWindowId === appId && !targetWin.minimized) {
      minimizeWindow(appId);
    } else {
      focusWindow(appId);
    }
  };

  // Tutup menu start saat klik di area bebas
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        startMenuOpen &&
        !e.target.closest(".retro-start-menu") &&
        !e.target.closest(".retro-start-btn")
      ) {
        setStartMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [startMenuOpen]);

  // Pemicu saat proses boot sistem selesai
  const handleBootComplete = () => {
    setBooting(false);
    // Buka jendela auth hanya jika sedang ada alur pemulihan password dari email
    if (isRecoveryFlow) {
      setTimeout(() => {
        openWindow("auth");
      }, 150);
    }
  };

  // CSS class latar belakang
  let wallpaperClass = "";
  if (wallpaper === 'classic') wallpaperClass = "wallpaper-classic";
  else if (wallpaper === 'grid') wallpaperClass = "wallpaper-grid";
  else if (wallpaper === 'synthwave') wallpaperClass = "wallpaper-synthwave";
  else if (wallpaper === 'matrix') wallpaperClass = "wallpaper-matrix";

  if (booting) {
    return <RetroBootScreen onBootComplete={handleBootComplete} />;
  }

  return (
    <div className={`h-screen relative overflow-hidden bg-[var(--desktop-bg)] transition-all duration-300 ${wallpaperClass}`}>
      {/* Lapisan Garis CRT Scanline Nostalgia Pro */}
      <div className="crt-overlay" />

      {/* ─── DESKTOP SHORTCUT ICONS (8-BIT PIXEL ART) ─── */}
      <div className="flex flex-col flex-wrap gap-4 p-4 h-[calc(100vh-52px)] align-content-start z-[1] select-none">
        <button
          className="retro-desktop-icon"
          onDoubleClick={() => openWindow("auth")}
        >
          <AuthIcon size={32} className="drop-shadow-sm" />
          <span>Login / Register</span>
        </button>
        <button
          className="retro-desktop-icon"
          onDoubleClick={() => openWindow("calculator")}
        >
          <CalculatorIcon size={32} className="drop-shadow-sm" />
          <span>Health Calculator</span>
        </button>
        <button
          className="retro-desktop-icon"
          onDoubleClick={() => openWindow("calories")}
        >
          <TrackerIcon size={32} className="drop-shadow-sm" />
          <span>Calorie Tracker</span>
        </button>
        <button
          className="retro-desktop-icon"
          onDoubleClick={() => openWindow("food")}
        >
          <ExplorerIcon size={32} className="drop-shadow-sm" />
          <span>Food Explorer</span>
        </button>
        <button
          className="retro-desktop-icon"
          onDoubleClick={() => openWindow("forum")}
        >
          <ForumIcon size={32} className="drop-shadow-sm" />
          <span>Community Forum</span>
        </button>

        {/* Shortcut Properti Layar Display Settings Baru */}
        <button
          className="retro-desktop-icon"
          onDoubleClick={() => openWindow("display")}
        >
          <DisplaySettingsIcon size={32} className="drop-shadow-sm" />
          <span>Display Settings</span>
        </button>
      </div>

      {/* ─── RETRO DESKTOP SIDEBAR WIDGETS ─── */}
      {widgetsEnabled && <DesktopWidgets />}

      {/* ─── SCREENSAVER STARFIELD CANVAS OVERLAY ─── */}
      {screensaverActive && (
        <InteractiveScreensaver onExit={() => setScreensaverActive(false)} />
      )}

      {/* ─── WINDOWS MANAGER ─── */}
      {windows.map((win) => {
        return (
          <RetroWindow
            key={win.id}
            id={win.id}
            title={win.title}
            icon={win.icon}
            width={win.width}
            height={win.height}
            isActive={activeWindowId === win.id}
            minimized={win.minimized}
            zIndex={win.zIndex}
            onClose={closeWindow}
            onMinimize={minimizeWindow}
            onFocus={focusWindow}
          >
            {win.id === "display" ? (
              <DisplayProperties
                currentTheme={theme}
                setTheme={setTheme}
                currentWallpaper={wallpaper}
                setWallpaper={setWallpaper}
                screensaverEnabled={screensaverEnabled}
                setScreensaverEnabled={setScreensaverEnabled}
                screensaverTimeout={screensaverTimeout}
                setScreensaverTimeout={setScreensaverTimeout}
                widgetsEnabled={widgetsEnabled}
                setWidgetsEnabled={setWidgetsEnabled}
                onTestScreensaver={() => setScreensaverActive(true)}
                onClose={() => closeWindow("display")}
              />
            ) : (
              (() => {
                const Component = win.component;
                return <Component />;
              })()
            )}
          </RetroWindow>
        );
      })}

      {/* ─── START MENU ─── */}
      {startMenuOpen && (
        <div className="retro-start-menu flex">
          <div className="retro-start-menu-sidebar">
            <span>Piring Sehat</span>
          </div>
          <div className="retro-start-menu-items flex-1">
            <button
              className="retro-start-menu-item font-bold"
              onClick={() => openWindow("auth")}
            >
              <AuthIcon size={18} /> Login/Register
            </button>
            <div className="retro-start-menu-divider"></div>
            <div className="px-2 py-1 text-[9px] text-gray-500 font-bold select-none">
              — LAYANAN UTAMA —
            </div>
            <button
              className="retro-start-menu-item"
              onClick={() => openWindow("calculator")}
            >
              <CalculatorIcon size={18} /> Health Calculator
            </button>
            <button
              className="retro-start-menu-item"
              onClick={() => openWindow("calories")}
            >
              <TrackerIcon size={18} /> Calorie Tracker
            </button>
            <button
              className="retro-start-menu-item"
              onClick={() => openWindow("food")}
            >
              <ExplorerIcon size={18} /> Food Explorer
            </button>
            <button
              className="retro-start-menu-item"
              onClick={() => openWindow("forum")}
            >
              <ForumIcon size={18} /> Community Forum
            </button>

            <div className="retro-start-menu-divider"></div>
            <div className="px-2 py-1 text-[9px] text-gray-500 font-bold select-none">
              — PENGATURAN —
            </div>
            <button
              className="retro-start-menu-item"
              onClick={() => openWindow("display")}
            >
              <DisplaySettingsIcon size={18} /> Display Settings
            </button>

            <div className="retro-start-menu-divider"></div>
            <button
              className="retro-start-menu-item"
              onClick={() => {
                playShutdownSound();
                setTimeout(() => {
                  window.location.reload();
                }, 1200);
              }}
            >
              <span className="text-[14px] leading-none text-red-600">⏻</span> Restart...
            </button>
          </div>
        </div>
      )}

      {/* ─── TASKBAR ─── */}
      <div className="retro-taskbar">
        <button
          className={`retro-start-btn ${startMenuOpen ? "active" : ""}`}
          onClick={() => setStartMenuOpen(!startMenuOpen)}
        >
          <span className="text-blue-800 text-lg leading-none select-none">❖</span>
          Start
        </button>

        <div className="flex gap-1 flex-1 overflow-x-auto">
          {windows.map((win) => (
            <button
              key={win.id}
              className={`retro-taskbar-item ${activeWindowId === win.id && !win.minimized ? "active" : ""}`}
              onClick={() => handleTaskbarClick(win.id)}
            >
              <span className="flex items-center select-none">{win.icon}</span>
              <span className="truncate">{win.title}</span>
            </button>
          ))}
        </div>

        {/* System Tray */}
        <div className="retro-systray">
          {user && (
            <span className="text-[10px] mr-2 font-mono font-bold select-none text-[#000080]">
              👤 {user.email?.split("@")[0] || "User"}
            </span>
          )}
          <span className="font-mono text-[10px] select-none font-bold">
            {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>

      {alertMessage && (
        <RetroAlert
          title="Access Denied"
          message={alertMessage}
          onClose={() => setAlertMessage(null)}
        />
      )}
    </div>
  );
}
