import { useState, useEffect, useRef } from "react"
import { Battery, BatteryCharging, ChevronLeft, ChevronRight } from "lucide-react"
import type { AccentTheme } from "../SettingsOverlay"
import { WeatherWidget } from "../widgets/WeatherWidget"
import { SystemWidget } from "../widgets/SystemWidget"
import { AgendaWidget } from "../widgets/AgendaWidget"
import { QuoteWidget } from "../widgets/QuoteWidget"

interface ClockProps {
  time: Date
  theme: AccentTheme
  burnInShift: { x: number; y: number }
  battery: { level: number; charging: boolean }
  wakeLockActive: boolean
  dashboardLayout?: "single" | "dual"
}

// Reusable swipeable widget slot container
interface WidgetSlotProps {
  initialIdx: number
  widgets: { id: string; component: React.ReactNode }[]
}

function WidgetSlot({ initialIdx, widgets }: WidgetSlotProps) {
  const [activeIdx, setActiveIdx] = useState(initialIdx)
  
  // Swipe touch trackers
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchStartX.current = touch.clientX
    touchStartY.current = touch.clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return

    const touch = e.changedTouches[0]
    const diffX = touchStartX.current - touch.clientX
    const diffY = touchStartY.current - touch.clientY
    const swipeThreshold = 45 // horizontal swipe trigger

    touchStartX.current = null
    touchStartY.current = null

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > swipeThreshold) {
      if (diffX > 0) {
        // Swiped Left -> Go Next Widget
        setActiveIdx((prev) => (prev + 1) % widgets.length)
      } else {
        // Swiped Right -> Go Prev Widget
        setActiveIdx((prev) => (prev - 1 + widgets.length) % widgets.length)
      }
    }
  }

  return (
    <div 
      className="group relative flex flex-col justify-between p-5 rounded-2xl border border-zinc-900 bg-zinc-950/40 backdrop-blur-md transition-all duration-300 hover:border-zinc-800/80 hover:bg-zinc-950/50"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Active Widget Render */}
      <div className="flex-1 w-full h-full min-h-[160px]">
        {widgets[activeIdx].component}
      </div>

      {/* Slide Controls and Pagination Dot indicators */}
      <div className="mt-4 flex items-center justify-between border-t border-zinc-900/40 pt-2.5">
        {/* Left Arrow */}
        <button
          onClick={() => setActiveIdx((prev) => (prev - 1 + widgets.length) % widgets.length)}
          className="rounded-lg p-1 text-zinc-600 hover:bg-zinc-900/60 hover:text-zinc-300 active:scale-95 transition-all opacity-0 group-hover:opacity-100"
          aria-label="Previous Widget"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>

        {/* Dots */}
        <div className="flex gap-1.5 mx-auto">
          {widgets.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIdx(idx)}
              className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                activeIdx === idx 
                  ? "bg-purple-400 w-3" 
                  : "bg-zinc-800 hover:bg-zinc-600"
              }`}
              aria-label={`Go to widget page ${idx + 1}`}
            />
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => setActiveIdx((prev) => (prev + 1) % widgets.length)}
          className="rounded-lg p-1 text-zinc-600 hover:bg-zinc-900/60 hover:text-zinc-300 active:scale-95 transition-all opacity-0 group-hover:opacity-100"
          aria-label="Next Widget"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

export function DashboardClock({ 
  time, 
  theme, 
  burnInShift, 
  battery, 
  wakeLockActive,
  dashboardLayout = "dual" // Default to dual-slot
}: ClockProps) {
  // Sparkline data for CPU Monitor
  const [cpuHistory, setCpuHistory] = useState<number[]>([
    22, 28, 25, 32, 40, 38, 42, 35, 30, 34, 28, 30, 36, 45, 38
  ])
  const [currentCpu, setCurrentCpu] = useState(38)

  // Update CPU sparkline on time change
  useEffect(() => {
    const change = Math.floor(Math.random() * 13) - 6
    const nextCpu = Math.max(8, Math.min(92, currentCpu + change))
    setCurrentCpu(nextCpu)
    setCpuHistory((prev) => [...prev.slice(1), nextCpu])
  }, [time])

  // Formats
  const hours = time.getHours().toString().padStart(2, "0")
  const minutes = time.getMinutes().toString().padStart(2, "0")
  const seconds = time.getSeconds().toString().padStart(2, "0")
  const dateString = time.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric"
  })

  // Theme styling map
  const getThemeClass = () => {
    switch (theme) {
      case "aurora":
        return {
          glow: "shadow-[0_0_50px_rgba(168,85,247,0.15)]",
          border: "border-purple-500/20",
          text: "bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent",
          badge: "bg-purple-500/10 text-purple-400 border-purple-500/20"
        }
      case "amber":
        return {
          glow: "shadow-[0_0_50px_rgba(245,158,11,0.15)]",
          border: "border-amber-500/20",
          text: "text-amber-500",
          badge: "bg-amber-500/10 text-amber-400 border-amber-500/20"
        }
      case "emerald":
        return {
          glow: "shadow-[0_0_50px_rgba(16,185,129,0.15)]",
          border: "border-emerald-500/20",
          text: "text-emerald-500",
          badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
        }
      case "blue":
        return {
          glow: "shadow-[0_0_50px_rgba(59,130,246,0.15)]",
          border: "border-blue-500/20",
          text: "text-blue-500",
          badge: "bg-blue-500/10 text-blue-400 border-blue-500/20"
        }
      case "rose":
        return {
          glow: "shadow-[0_0_50px_rgba(244,63,94,0.15)]",
          border: "border-rose-500/20",
          text: "text-rose-500",
          badge: "bg-rose-500/10 text-rose-400 border-rose-500/20"
        }
      case "stealth":
      default:
        return {
          glow: "shadow-none",
          border: "border-zinc-900",
          text: "text-zinc-400",
          badge: "bg-zinc-900 text-zinc-500 border-zinc-800"
        }
    }
  }

  const styles = getThemeClass()

  // Master lists of widgets available for expansion cycling
  const widgetList = [
    { id: "weather", component: <WeatherWidget /> },
    { id: "system", component: <SystemWidget cpuLoad={currentCpu} cpuHistory={cpuHistory} theme={theme} /> },
    { id: "agenda", component: <AgendaWidget time={time} /> },
    { id: "quote", component: <QuoteWidget /> }
  ]

  return (
    <div className="relative flex h-full w-full items-center justify-center p-6 md:p-10 select-none overflow-hidden">
      
      {/* Main Grid Wrapper with Burn-in Shift */}
      <div 
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full max-w-6xl transition-transform duration-700 ease-out"
        style={{ transform: `translate(${burnInShift.x}px, ${burnInShift.y}px)` }}
      >
        
        {/* Left Column: Clock Info Card */}
        <div className={`flex flex-col justify-between p-6 rounded-2xl border bg-zinc-950/40 backdrop-blur-md transition-all duration-500 ${
          dashboardLayout === "single" 
            ? "lg:col-span-7 my-4 py-8" 
            : "lg:col-span-4"
        } ${styles.border} ${styles.glow}`}>
          
          {/* Top header badge */}
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-mono font-bold tracking-widest px-2.5 py-0.5 rounded-full border uppercase ${styles.badge}`}>
              AuraBoard System
            </span>
            <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-mono">
              {battery.charging ? (
                <BatteryCharging className="h-3.5 w-3.5 animate-pulse text-amber-500" />
              ) : (
                <Battery className="h-3.5 w-3.5" />
              )}
              <span>{battery.level}%</span>
            </div>
          </div>

          {/* Central digital time display */}
          <div className="my-8 flex flex-col">
            <div className="flex items-baseline font-black tracking-tighter">
              <span className={`text-[7vw] ${dashboardLayout === "single" ? "lg:text-[5.5vw]" : "lg:text-[4.5vw]"} leading-none ${styles.text}`}>
                {hours}:{minutes}
              </span>
              <span className="text-[2.5vw] lg:text-[1.8vw] leading-none ml-2 font-mono font-medium text-zinc-600">
                {seconds}
              </span>
            </div>
            
            <p className="text-sm font-semibold tracking-widest text-zinc-400 uppercase mt-2">
              {dateString}
            </p>
          </div>

          {/* Diagnostics state */}
          <div className="flex items-center gap-2 border-t border-zinc-900/60 pt-4 text-[11px] font-mono text-zinc-500">
            <span className={`h-2 w-2 rounded-full ${wakeLockActive ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
            <span>WakeLock: {wakeLockActive ? "ACTIVE" : "STANDBY"}</span>
          </div>
        </div>

        {/* Right Column: Dynamic Widgets Container */}
        {dashboardLayout === "single" ? (
          // Single Widget Focus
          <div className="lg:col-span-5 flex flex-col justify-stretch">
            <WidgetSlot initialIdx={0} widgets={widgetList} />
          </div>
        ) : (
          // Dual Widget Focus (2 columns of independent slots)
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Slot 1: Starts at Weather (0) */}
            <WidgetSlot initialIdx={0} widgets={widgetList} />
            {/* Slot 2: Starts at System Health (1) */}
            <WidgetSlot initialIdx={1} widgets={widgetList} />
          </div>
        )}

      </div>
    </div>
  )
}
