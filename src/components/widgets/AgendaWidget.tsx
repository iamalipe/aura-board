import { Calendar } from "lucide-react"

interface AgendaWidgetProps {
  time: Date
}

export function AgendaWidget({ time }: AgendaWidgetProps) {
  // Determine if a meeting is completed based on current hour/minute
  const isPast = (hour: number, minute: number = 0) => {
    const curHour = time.getHours()
    const curMin = time.getMinutes()
    return curHour > hour || (curHour === hour && curMin > minute)
  }

  const events = [
    { timeStr: "10:30 AM", title: "Daily Team Sync", isCompleted: isPast(10, 30) },
    { timeStr: "02:00 PM", title: "Refactor Planning", isCompleted: isPast(14, 0) },
    { timeStr: "05:00 PM", title: "Release Deployment", isCompleted: isPast(17, 0) }
  ]

  return (
    <div className="flex flex-col justify-between h-full w-full">
      <div className="flex items-center justify-between border-b border-zinc-900/60 pb-3">
        <span className="text-xs font-bold tracking-wider text-zinc-500 uppercase flex items-center gap-1.5">
          <Calendar className="h-4 w-4" />
          Today's Schedule
        </span>
        <span className="text-[10px] font-mono text-emerald-500">Auto Sync On</span>
      </div>

      <div className="mt-3 space-y-2 flex-grow overflow-y-auto max-h-[140px] pr-1">
        {events.map((event, idx) => (
          <div key={idx} className="flex items-center justify-between bg-zinc-950/50 hover:bg-zinc-950 border border-zinc-900/40 rounded-xl px-3 py-2 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] font-mono font-semibold text-zinc-600 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                {event.timeStr}
              </span>
              <span className={`font-semibold tracking-wide ${event.isCompleted ? "line-through text-zinc-600" : "text-zinc-300"}`}>
                {event.title}
              </span>
            </div>
            <span className={`h-1.5 w-1.5 rounded-full ${event.isCompleted ? "bg-zinc-700" : "bg-purple-500 animate-pulse"}`} />
          </div>
        ))}
      </div>
    </div>
  )
}
