import { Battery, BatteryCharging } from "lucide-react"
import type { AccentTheme } from "../SettingsOverlay"

interface ClockProps {
  time: Date
  theme: AccentTheme
  burnInShift: { x: number; y: number }
  battery: { level: number; charging: boolean }
}

export function MinimalClock({ time, theme, burnInShift, battery }: ClockProps) {
  // Format hours and minutes
  const hours = time.getHours().toString().padStart(2, "0")
  const minutes = time.getMinutes().toString().padStart(2, "0")
  const seconds = time.getSeconds().toString().padStart(2, "0")

  // Format date: e.g. "Wednesday, July 15, 2026"
  const dateString = time.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  // Theme-specific glow gradients and text color accents
  const getThemeStyles = () => {
    switch (theme) {
      case "aurora":
        return {
          glow: "bg-gradient-to-tr from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-[80px]",
          text: "bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(192,132,252,0.25)]",
          accent: "text-purple-400",
        }
      case "amber":
        return {
          glow: "bg-amber-500/10 blur-[80px]",
          text: "text-amber-500 drop-shadow-[0_0_30px_rgba(245,158,11,0.3)]",
          accent: "text-amber-400",
        }
      case "emerald":
        return {
          glow: "bg-emerald-500/10 blur-[80px]",
          text: "text-emerald-500 drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]",
          accent: "text-emerald-400",
        }
      case "blue":
        return {
          glow: "bg-blue-500/10 blur-[80px]",
          text: "text-blue-500 drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]",
          accent: "text-blue-400",
        }
      case "rose":
        return {
          glow: "bg-rose-500/10 blur-[80px]",
          text: "text-rose-500 drop-shadow-[0_0_30px_rgba(244,63,94,0.3)]",
          accent: "text-rose-400",
        }
      case "stealth":
      default:
        return {
          glow: "hidden",
          text: "text-zinc-400",
          accent: "text-zinc-600",
        }
    }
  }

  const styles = getThemeStyles()

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
      {/* Background ambient glow */}
      <div className={`absolute -inset-10 -z-10 rounded-full transition-all duration-1000 ${styles.glow}`} />

      {/* Burn-in protection wrapper */}
      <div 
        className="flex flex-col items-center justify-center transition-transform duration-700 ease-out"
        style={{ transform: `translate(${burnInShift.x}px, ${burnInShift.y}px)` }}
      >
        {/* Battery Indicator badge */}
        <div className="mb-6 flex items-center gap-1.5 rounded-full border border-zinc-800/40 bg-zinc-950/40 px-3 py-1 text-xs text-zinc-500 backdrop-blur-sm select-none">
          {battery.charging ? (
            <BatteryCharging className={`h-3.5 w-3.5 ${styles.accent} animate-pulse`} />
          ) : (
            <Battery className="h-3.5 w-3.5" />
          )}
          <span className="font-medium font-mono">{battery.level}%</span>
        </div>

        {/* Huge Digital Clock Face */}
        <div className="flex items-baseline font-black tracking-tighter">
          {/* Time digits */}
          <span className={`text-[12vw] leading-none select-all ${styles.text}`}>
            {hours}
          </span>
          <span className={`text-[11vw] leading-none mx-2 font-light select-none ${styles.accent} animate-pulse`}>
            :
          </span>
          <span className={`text-[12vw] leading-none select-all ${styles.text}`}>
            {minutes}
          </span>
          {/* Small running seconds */}
          <span className="text-[3vw] leading-none ml-4 font-mono font-medium text-zinc-600 select-all">
            {seconds}
          </span>
        </div>

        {/* Date Display */}
        <div className="mt-8 text-center select-all">
          <p className="text-[1.8vw] font-medium tracking-widest text-zinc-400 uppercase">
            {dateString}
          </p>
        </div>
      </div>
    </div>
  )
}
