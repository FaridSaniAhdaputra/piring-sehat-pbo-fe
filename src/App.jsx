import { useState, useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import RetroWindow from "./components/ui/RetroWindow";
import RetroAlert from "./components/ui/RetroAlert";
import AuthWindow from "./components/auth/AuthWindow";
import HealthCalculatorContainer from "./components/calculator/HealthCalculatorContainer";
import CalorieTracker from "./components/calories/CalorieTracker";
import FoodSearchExplorer from "./components/food/FoodSearchExplorer";
import CommunityForum from "./components/forum/CommunityForum";
import "./App.css";

export default function App() {
  const { user } = useAuth();
  const [windows, setWindows] = useState([]);
  const [activeWindowId, setActiveWindowId] = useState(null);
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [time, setTime] = useState(new Date());
  const [alertMessage, setAlertMessage] = useState(null);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const apps = {
    auth: {
      id: "auth",
      title: "PiringSehat - Login",
      icon: "🔑",
      component: AuthWindow,
      width: 400,
      height: 420,
    },
    calculator: {
      id: "calculator",
      title: "Health Calculator 3-in-1",
      icon: "🧮",
      component: HealthCalculatorContainer,
      width: 500,
      height: 560,
    },
    calories: {
      id: "calories",
      title: "Calorie Tracker",
      icon: "📈",
      component: CalorieTracker,
      width: 550,
      height: 500,
    },
    food: {
      id: "food",
      title: "Food Explorer",
      icon: "🔍",
      component: FoodSearchExplorer,
      width: 450,
      height: 400,
    },
    forum: {
      id: "forum",
      title: "Community Forum",
      icon: "🌐",
      component: CommunityForum,
      width: 600,
      height: 450,
    },
  };

  // Daftar fitur yang memerlukan login sebelum bisa diakses
  const protectedApps = ["calculator", "calories", "food"];

  const openWindow = (appId) => {
    setStartMenuOpen(false);

    // Proteksi Auth: Jika user belum login dan mencoba membuka fitur terproteksi,
    // tampilkan peringatan bergaya Win95 dan buka jendela Login sebagai gantinya.
    if (protectedApps.includes(appId) && !user) {
      setAlertMessage("Anda harus login terlebih dahulu untuk mengakses fitur ini.");
      appId = "auth";
    }
    setActiveWindowId(appId);
    setWindows((prevWindows) => {
      const existing = prevWindows.find((w) => w.id === appId);
      if (existing) {
        // Jika sudah terbuka, kembalikan ke kondisi terlihat (restore) dan fokus
        return prevWindows.map((w) => ({
          ...w,
          minimized: w.id === appId ? false : w.minimized,
          zIndex: w.id === appId ? 999 : w.zIndex > 0 ? w.zIndex - 1 : 0,
        }));
      } else {
        // Jika baru dibuka
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
      // Jika jendela sedang aktif dan tidak minimize, klik akan meminimalisir
      minimizeWindow(appId);
    } else {
      // Jika tidak aktif atau ter-minimize, restore dan berikan fokus
      focusWindow(appId);
    }
  };

  // Handle click outside start menu to close it
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

  return (
    <div className="desktop">
      {/* Desktop Icons */}
      <div className="desktop-icons">
        <button
          className="retro-desktop-icon"
          onDoubleClick={() => openWindow("auth")}
        >
          <span className="text-3xl">🔑</span>
          <span>Login / Register</span>
        </button>
        <button
          className="retro-desktop-icon"
          onDoubleClick={() => openWindow("calculator")}
        >
          <span className="text-3xl">🧮</span>
          <span>Health Calculator</span>
        </button>
        <button
          className="retro-desktop-icon"
          onDoubleClick={() => openWindow("calories")}
        >
          <span className="text-3xl">📈</span>
          <span>Calorie Tracker</span>
        </button>
        <button
          className="retro-desktop-icon"
          onDoubleClick={() => openWindow("food")}
        >
          <span className="text-3xl">🔍</span>
          <span>Food Explorer</span>
        </button>
        <button
          className="retro-desktop-icon"
          onDoubleClick={() => openWindow("forum")}
        >
          <span className="text-3xl">🌐</span>
          <span>Community Forum</span>
        </button>
      </div>

      {/* Windows Manager */}
      {windows.map((win) => {
        const Component = win.component;
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
            <Component />
          </RetroWindow>
        );
      })}

      {/* Start Menu */}
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
              <span className="text-xl">🔑</span> Login/Register
            </button>
            <div className="retro-start-menu-divider"></div>
            <div className="px-2 py-1 text-[10px] text-gray-500 font-bold">
              — KALKULATOR —
            </div>
            <button
              className="retro-start-menu-item font-bold"
              onClick={() => openWindow("calculator")}
            >
              <span className="text-xl">🧮</span> Health Calculator
            </button>
            <div className="retro-start-menu-divider"></div>
            <button
              className="retro-start-menu-item font-bold"
              onClick={() => openWindow("calories")}
            >
              <span className="text-xl">📈</span> Calorie Tracker
            </button>
            <button
              className="retro-start-menu-item font-bold"
              onClick={() => openWindow("food")}
            >
              <span className="text-xl">🔍</span> Food Explorer
            </button>
            <button
              className="retro-start-menu-item font-bold"
              onClick={() => openWindow("forum")}
            >
              <span className="text-xl">🌐</span> Community Forum
            </button>
            <div className="retro-start-menu-divider"></div>
            <button
              className="retro-start-menu-item"
              onClick={() => window.location.reload()}
            >
              <span className="text-xl">⏻</span> Shut Down...
            </button>
          </div>
        </div>
      )}

      {/* Taskbar */}
      {/* Taskbar */}
      <div className="retro-taskbar">
        <button
          className={`retro-start-btn ${startMenuOpen ? "active" : ""}`}
          onClick={() => setStartMenuOpen(!startMenuOpen)}
        >
          <span className="text-blue-800 text-lg leading-none">❖</span>
          Start
        </button>

        <div className="flex gap-1 flex-1 overflow-x-auto">
          {windows.map((win) => (
            <button
              key={win.id}
              className={`retro-taskbar-item ${activeWindowId === win.id && !win.minimized ? "active" : ""}`}
              onClick={() => handleTaskbarClick(win.id)}
            >
              <span className="text-xs">{win.icon}</span>
              <span className="truncate">{win.title}</span>
            </button>
          ))}
        </div>

        {/* System Tray */}
        <div className="retro-systray">
          {user && (
            <span className="text-[10px] mr-2">
              👤 {user.email?.split("@")[0] || "User"}
            </span>
          )}
          {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
