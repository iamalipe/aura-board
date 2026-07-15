import { Cpu } from "lucide-react"

interface SystemWidgetProps {
  cpuLoad: number
  cpuHistory: number[]
  theme: "aurora" | "amber" | "emerald" | "blue" | "rose" | "stealth"
}

export function SystemWidget({ cpuLoad, cpuHistory, theme }: SystemWidgetProps) {
  // Generate SVG path for CPU sparkline
  const sparklineWidth = 140
  const sparklineHeight = 32
  
  const points = cpuHistory.map((val, idx) => {
    const x = (idx / (cpuHistory.length - 1)) * sparklineWidth
    const y = sparklineHeight - (val / 100) * sparklineHeight
    return `${x},${y}`
  }).join(" ")

  const getThemeClass = () => {
    switch (theme) {
      case "aurora":
        return {
          fill: "stroke-purple-400 fill-purple-400/10",
          bar: "bg-gradient-to-r from-blue-500 to-purple-500"
        }
      case "amber":
        return {
          fill: "stroke-amber-500 fill-amber-500/10",
          bar: "bg-amber-500"
        }
      case "emerald":
        return {
          fill: "stroke-emerald-500 fill-emerald-500/10",
          bar: "bg-emerald-500"
        }
      case "blue":
        return {
          fill: "stroke-blue-500 fill-blue-500/10",
          bar: "bg-blue-500"
        }
      case "rose":
        return {
          fill: "stroke-rose-500 fill-rose-500/10",
          bar: "bg-rose-500"
        }
      case "stealth":
      default:
        return {
          fill: "stroke-zinc-500 fill-zinc-500/5",
          bar: "bg-zinc-600"
        }
    }
  }

  const styles = getThemeClass()

  return (
    <div className="flex flex-col justify-between h-full w-full">
      <div className="flex items-center justify-between border-b border-zinc-900/60 pb-3">
        <span className="text-xs font-bold tracking-wider text-zinc-500 uppercase flex items-center gap-1.5">
          <Cpu className="h-4 w-4" />
          System Health
        </span>
        <span className="text-[10px] font-mono text-zinc-600">Diagnostics</span>
      </div>

      {/* Sparkline */}
      <div className="flex items-center justify-between my-3">
        <div>
          <span className="text-[10px] text-zinc-500 block">CPU Util</span>
          <span className="text-xl font-black text-zinc-100 font-mono">{cpuLoad}%</span>
        </div>
        
        {/* SVG Sparkline */}
        <div className="h-8 w-[140px] bg-zinc-950/20 border border-zinc-900/40 rounded overflow-hidden">
          <svg className="h-full w-full overflow-visible">
            <polyline
              fill="none"
              strokeWidth="1.5"
              points={points}
              className={`transition-all duration-300 ${styles.fill.split(" ")[0]}`}
            />
          </svg>
        </div>
      </div>

      {/* RAM Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[9px] font-mono text-zinc-500">
          <span>Memory usage</span>
          <span className="text-zinc-400">1.4 GB / 2.0 GB (70%)</span>
        </div>
        <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-900/40">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${styles.bar}`} 
            style={{ width: "70%" }} 
          />
        </div>
      </div>
    </div>
  )
}
