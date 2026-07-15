import { useState, useEffect, useRef, useCallback } from "react"
import { useWakeLock } from "./hooks/useWakeLock"
import { MinimalClock } from "./components/clocks/MinimalClock"
import { WordClock } from "./components/clocks/WordClock"
import { DashboardClock } from "./components/clocks/DashboardClock"
import { SettingsOverlay, type AccentTheme } from "./components/SettingsOverlay"
import { Settings, Maximize2, Minimize2 } from "lucide-react"

export function App() {
  // Clock time state
  const [currentTime, setCurrentTime] = useState<Date>(new Date())

  // Core settings states
  const [currentFace, setCurrentFace] = useState<number>(0)
  const [accentTheme, setAccentTheme] = useState<AccentTheme>("aurora")
  const [nightMode, setNightMode] = useState<boolean>(false)
  const [burnInProtection, setBurnInProtection] = useState<boolean>(true)
  const [scale, setScale] = useState<number>(1.0)
  const [slideAnimation, setSlideAnimation] = useState<string>("")
  const [dashboardLayout, setDashboardLayout] = useState<"single" | "dual">("dual")
  
  // UI overlays & Navigation Deck switcher
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false)
  const [controlsVisible, setControlsVisible] = useState<boolean>(true)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const [isOverviewMode, setIsOverviewMode] = useState<boolean>(false)

  // Device states
  const [battery, setBattery] = useState({ level: 100, charging: false })
  const { active: wakeLockActive, error: wakeLockError, request: reacquireWakeLock } = useWakeLock()

  // OLED Burn-in shift coordinates
  const [burnInShift, setBurnInShift] = useState({ x: 0, y: 0 })

  // Gesture and click/hold tracker references
  const touchStartY = useRef<number | null>(null)
  const touchStartX = useRef<number | null>(null)
  const lastTapTime = useRef<number>(0)
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const holdStartX = useRef<number | null>(null)
  const holdStartY = useRef<number | null>(null)

  // 1. Block right-clicks globally
  useEffect(() => {
    const preventRightClick = (e: MouseEvent) => {
      e.preventDefault()
    }
    window.addEventListener("contextmenu", preventRightClick)
    return () => {
      window.removeEventListener("contextmenu", preventRightClick)
    }
  }, [])

  // 2. Setup global time interval (exactly 1 interval, cleaned up perfectly)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [])

  // 3. Battery status API integration with event handlers
  useEffect(() => {
    let batteryObj: any = null

    const handleBatteryChange = () => {
      if (batteryObj) {
        setBattery({
          level: Math.round(batteryObj.level * 100),
          charging: batteryObj.charging
        })
      }
    }

    if (typeof window !== "undefined" && "getBattery" in navigator) {
      ;(navigator as any).getBattery().then((batt: any) => {
        batteryObj = batt
        handleBatteryChange()
        batt.addEventListener("levelchange", handleBatteryChange)
        batt.addEventListener("chargingchange", handleBatteryChange)
      }).catch((e: any) => {
        console.warn("Battery API rejected:", e)
      })
    }

    return () => {
      if (batteryObj) {
        batteryObj.removeEventListener("levelchange", handleBatteryChange)
        batteryObj.removeEventListener("chargingchange", handleBatteryChange)
      }
    }
  }, [])

  // 4. OLED Burn-in Protection logic (slow orbital translation offset updated every minute)
  useEffect(() => {
    if (!burnInProtection) {
      setBurnInShift({ x: 0, y: 0 })
      return
    }

    let angle = 0
    const updateOrbit = () => {
      angle = (angle + Math.PI / 6) % (2 * Math.PI)
      const radius = 6
      setBurnInShift({
        x: Math.round(radius * Math.cos(angle)),
        y: Math.round(radius * Math.sin(angle))
      })
    }

    updateOrbit()
    const interval = setInterval(updateOrbit, 60000)
    return () => clearInterval(interval)
  }, [burnInProtection])

  // 5. Auto-fading toolbar handler (visible on tap, fades out after 3 seconds)
  const resetFadeTimer = useCallback(() => {
    setControlsVisible(true)
    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current)
    }
    fadeTimeoutRef.current = setTimeout(() => {
      if (!settingsOpen && !isOverviewMode) {
        setControlsVisible(false)
      }
    }, 3000)
  }, [settingsOpen, isOverviewMode])

  useEffect(() => {
    resetFadeTimer()
    return () => {
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current)
      }
    }
  }, [resetFadeTimer])

  // 6. Native Fullscreen support
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(err => console.warn("Fullscreen request failed:", err))
    } else {
      document.exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(err => console.warn("Fullscreen exit failed:", err))
    }
    resetFadeTimer()
  }

  // Update fullscreen state in case it changes via escape key
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  // 7. Click & Hold / Touch & Hold (3-sec Overview Mode activator)
  const startHoldTimer = useCallback((clientX: number, clientY: number) => {
    if (isOverviewMode) return

    holdStartX.current = clientX
    holdStartY.current = clientY

    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current)
    }

    holdTimerRef.current = setTimeout(() => {
      console.log("3-second hold reached. Entering Overview Mode...")
      setIsOverviewMode(true)
      setControlsVisible(false) // Hide header buttons in overview
      holdTimerRef.current = null
    }, 3000)
  }, [isOverviewMode])

  const cancelHoldTimer = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current)
      holdTimerRef.current = null
    }
    holdStartX.current = null
    holdStartY.current = null
  }, [])

  const checkMoveHold = useCallback((clientX: number, clientY: number) => {
    if (holdStartX.current === null || holdStartY.current === null) return
    const tolerance = 15 // allow 15px shifting tolerance before cancelling
    const dx = holdStartX.current - clientX
    const dy = holdStartY.current - clientY
    if (Math.sqrt(dx * dx + dy * dy) > tolerance) {
      cancelHoldTimer()
    }
  }, [cancelHoldTimer])

  // 8. Touch gesture & Double-tap Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    resetFadeTimer()
    const touch = e.touches[0]
    touchStartY.current = touch.clientY
    touchStartX.current = touch.clientX
    
    // Start hold timer
    startHoldTimer(touch.clientX, touch.clientY)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    cancelHoldTimer()
    
    if (touchStartY.current === null || touchStartX.current === null) return

    const touch = e.changedTouches[0]
    const diffY = touchStartY.current - touch.clientY
    const diffX = touchStartX.current - touch.clientX
    const swipeThreshold = 50

    touchStartY.current = null
    touchStartX.current = null

    // Block page swipe if in Overview Mode
    if (isOverviewMode) return

    // Determine vertical swipe (Up/Down) to change clock face index
    if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > swipeThreshold) {
      if (diffY > 0) {
        // Swiped Up -> Next Face (Slides up from bottom)
        setCurrentFace((prev) => (prev + 1) % 3)
        setSlideAnimation("animate-slide-up-enter")
      } else {
        // Swiped Down -> Prev Face (Slides down from top)
        setCurrentFace((prev) => (prev - 1 + 3) % 3)
        setSlideAnimation("animate-slide-down-enter")
      }
      return
    }

    // Capture double tap for settings overlay
    const currentTimeMs = Date.now()
    const tapLength = currentTimeMs - lastTapTime.current
    if (tapLength < 300 && tapLength > 0) {
      setSettingsOpen(true)
      e.preventDefault()
    }
    lastTapTime.current = currentTimeMs
  }

  const handleMouseMove = () => {
    resetFadeTimer()
  }

  const handleFaceChange = (faceIdx: number) => {
    setSlideAnimation("animate-slide-up-enter")
    setCurrentFace(faceIdx)
  }

  const selectFaceFromOverview = (faceIdx: number) => {
    setSlideAnimation("animate-slide-up-enter")
    setCurrentFace(faceIdx)
    setIsOverviewMode(false)
  }

  // Render active face based on index
  const renderClockFace = () => {
    switch (currentFace) {
      case 0:
        return (
          <MinimalClock 
            time={currentTime} 
            theme={accentTheme} 
            burnInShift={burnInShift}
            battery={battery}
          />
        )
      case 1:
        return (
          <WordClock 
            time={currentTime} 
            theme={accentTheme} 
            burnInShift={burnInShift}
          />
        )
      case 2:
        return (
          <DashboardClock 
            time={currentTime} 
            theme={accentTheme} 
            burnInShift={burnInShift}
            battery={battery}
            wakeLockActive={wakeLockActive}
            dashboardLayout={dashboardLayout}
          />
        )
      default:
        return null
    }
  }

  // 9. Overview Deck Render Mode
  if (isOverviewMode) {
    return (
      <main className="relative flex h-screen w-screen flex-col items-center justify-center bg-black/95 font-sans text-zinc-100 overflow-hidden select-none p-6 md:p-12">
        {/* Global Low Intensity Bedside Night Mode Red Layer Filter */}
        {nightMode && (
          <div className="pointer-events-none absolute inset-0 z-50 bg-red-950/20 mix-blend-color backdrop-brightness-[0.25]" />
        )}
        
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl md:text-3xl font-black tracking-widest uppercase bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Navigation Deck
          </h1>
          <p className="text-xs text-zinc-500 font-mono mt-1">Tap a card to zoom into dashboard</p>
        </div>

        {/* 3 Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
          {[
            { idx: 0, label: "Digital Minimal", desc: "Clean readout with ambient glow" },
            { idx: 1, label: "Typography Word", desc: "Spelled out time & calendar" },
            { idx: 2, label: "Widgets Focus", desc: "Integrated system & climate monitors" }
          ].map((face) => {
            const isActive = currentFace === face.idx
            return (
              <div
                key={face.idx}
                onClick={() => selectFaceFromOverview(face.idx)}
                className={`relative flex flex-col justify-between h-[230px] md:h-[270px] p-5 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden group select-none ${
                  isActive
                    ? "border-purple-500 bg-zinc-950 shadow-[0_0_30px_rgba(168,85,247,0.25)]"
                    : "border-zinc-900 bg-zinc-950/40 hover:border-zinc-700 hover:bg-zinc-950/70 hover:scale-[1.02]"
                }`}
              >
                {/* Live preview container */}
                <div className="w-full flex-grow flex items-center justify-center overflow-hidden border border-zinc-900/60 rounded-xl bg-black/40 relative">
                  <div className="absolute inset-0 scale-[0.4] origin-center pointer-events-none flex items-center justify-center">
                    {face.idx === 0 && (
                      <MinimalClock 
                        time={currentTime} 
                        theme={accentTheme} 
                        burnInShift={{ x: 0, y: 0 }}
                        battery={battery}
                      />
                    )}
                    {face.idx === 1 && (
                      <WordClock 
                        time={currentTime} 
                        theme={accentTheme} 
                        burnInShift={{ x: 0, y: 0 }}
                      />
                    )}
                    {face.idx === 2 && (
                      <DashboardClock 
                        time={currentTime} 
                        theme={accentTheme} 
                        burnInShift={{ x: 0, y: 0 }}
                        battery={battery}
                        wakeLockActive={wakeLockActive}
                        dashboardLayout={dashboardLayout}
                      />
                    )}
                  </div>
                </div>

                {/* Card Title & Desc */}
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <h3 className={`text-xs font-bold uppercase tracking-wider ${isActive ? "text-purple-400" : "text-zinc-300"}`}>
                      {face.label}
                    </h3>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{face.desc}</p>
                  </div>
                  {isActive && (
                    <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">
                      ACTIVE
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Back Button */}
        <button
          onClick={() => setIsOverviewMode(false)}
          className="mt-8 px-5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 active:scale-95 transition-all text-xs font-bold uppercase tracking-wider"
        >
          Resume Dashboard
        </button>
      </main>
    )
  }

  // 10. Normal Dashboard Render Mode
  return (
    <main 
      className={`relative flex h-screen w-screen flex-col items-center justify-center bg-black font-sans text-zinc-100 overflow-hidden transition-all duration-500 select-none ${
        nightMode ? "brightness-[0.4]" : "brightness-100"
      }`}
      onTouchStart={handleTouchStart}
      onTouchMove={(e) => checkMoveHold(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={cancelHoldTimer}
      onMouseDown={(e) => {
        if (e.button === 0) startHoldTimer(e.clientX, e.clientY)
      }}
      onMouseMove={(e) => {
        handleMouseMove()
        checkMoveHold(e.clientX, e.clientY)
      }}
      onMouseUp={cancelHoldTimer}
      onMouseLeave={cancelHoldTimer}
    >
      
      {/* Global Low Intensity Bedside Night Mode Red Layer Filter */}
      {nightMode && (
        <div className="pointer-events-none fixed inset-0 z-50 bg-red-950/20 mix-blend-color backdrop-brightness-[0.25]" />
      )}

      {/* Clock Face Display Container */}
      <div className="h-full w-full flex items-center justify-center overflow-hidden">
        <div
          key={`${currentFace}-${slideAnimation}`}
          className={`h-full w-full flex items-center justify-center ${slideAnimation}`}
          style={{ transform: `scale(${scale})`, transformOrigin: "center" }}
        >
          {renderClockFace()}
        </div>
      </div>

      {/* Auto-fading Floating Header (Controls Utility Bar) */}
      <div 
        className={`absolute top-0 left-0 right-0 z-40 flex items-center justify-between p-6 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-500 ease-in-out ${
          controlsVisible || settingsOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Status Indicators */}
        <div className="flex items-center gap-4 text-xs font-mono text-zinc-500">
          <div className="flex items-center gap-1.5">
            <span className={`inline-block h-2 w-2 rounded-full ${wakeLockActive ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
            <span>Wake Lock: {wakeLockActive ? "HOLDING" : "OFF"}</span>
          </div>
          {battery.charging && (
            <div className="flex items-center gap-1 text-amber-500">
              <span className="text-[10px] animate-pulse">CHARGING</span>
            </div>
          )}
        </div>

        {/* Floating Utility Controls (Fullscreen & Settings) */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleFullscreen}
            className="flex items-center justify-center h-9 w-9 rounded-xl border border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-all active:scale-95"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="h-4.5 w-4.5" /> : <Maximize2 className="h-4.5 w-4.5" />}
          </button>
          
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex items-center justify-center h-9 w-9 rounded-xl border border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-all active:scale-95"
            title="Dashboard Settings"
          >
            <Settings className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* Hidden Double-Tap Overlay Hint on First Interaction */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 text-[10px] font-mono text-zinc-600 tracking-wider bg-zinc-950/20 px-3 py-1 rounded-full border border-zinc-900/10 pointer-events-none opacity-50">
        Swipe Up/Down to shift faces • Hold 3 sec for Overview
      </div>

      {/* Glassmorphic Settings Control overlay drawer */}
      <SettingsOverlay
        isOpen={settingsOpen}
        onClose={() => {
          setSettingsOpen(false)
          resetFadeTimer()
        }}
        accentTheme={accentTheme}
        setAccentTheme={setAccentTheme}
        nightMode={nightMode}
        setNightMode={setNightMode}
        burnInProtection={burnInProtection}
        setBurnInProtection={setBurnInProtection}
        currentFace={currentFace}
        setCurrentFace={handleFaceChange}
        wakeLockActive={wakeLockActive}
        wakeLockError={wakeLockError}
        triggerWakeLock={reacquireWakeLock}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        scale={scale}
        setScale={setScale}
        dashboardLayout={dashboardLayout}
        setDashboardLayout={setDashboardLayout}
      />
    </main>
  )
}

export default App
