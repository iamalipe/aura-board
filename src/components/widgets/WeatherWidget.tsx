import { CloudSun, Sun, CloudRain } from "lucide-react"

export function WeatherWidget() {
  return (
    <div className="flex flex-col justify-between h-full w-full">
      <div className="flex items-center justify-between border-b border-zinc-900/60 pb-3">
        <span className="text-xs font-bold tracking-wider text-zinc-500 uppercase flex items-center gap-1.5">
          <CloudSun className="h-4 w-4" />
          Weather
        </span>
        <span className="text-[10px] font-mono text-zinc-600">New York, NY</span>
      </div>

      <div className="flex items-center justify-between my-3">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <CloudSun className="h-10 w-10 text-amber-500 animate-bounce-slow" />
            <span className="absolute bottom-0 right-0 h-3 w-3 bg-purple-500/20 rounded-full animate-ping" />
          </div>
          <div>
            <div className="text-2xl font-black text-zinc-100">72°F</div>
            <div className="text-[10px] text-zinc-500">Partly Sunny</div>
          </div>
        </div>
        <div className="text-right text-[10px] font-mono text-zinc-500">
          <div>H: 78° L: 62°</div>
          <div>Precip: 15%</div>
        </div>
      </div>

      {/* Hourly forecast */}
      <div className="grid grid-cols-3 gap-1 bg-zinc-950/60 rounded-xl p-1.5 border border-zinc-900/40 text-[10px]">
        {[
          { hr: "1 PM", temp: "74°", icon: <Sun className="h-3 w-3 text-amber-400" /> },
          { hr: "4 PM", temp: "76°", icon: <CloudSun className="h-3 w-3 text-amber-300" /> },
          { hr: "7 PM", temp: "69°", icon: <CloudRain className="h-3 w-3 text-blue-400" /> }
        ].map((item, idx) => (
          <div key={idx} className="flex flex-col items-center py-1">
            <span className="text-zinc-600 font-mono text-[9px]">{item.hr}</span>
            <span className="my-0.5">{item.icon}</span>
            <span className="font-bold text-zinc-400">{item.temp}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
