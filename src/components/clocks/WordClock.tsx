import type { AccentTheme } from "../SettingsOverlay"

interface ClockProps {
  time: Date
  theme: AccentTheme
  burnInShift: { x: number; y: number }
}

const ONES = [
  "ZERO", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE",
  "TEN", "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN",
  "SEVENTEEN", "EIGHTEEN", "NINETEEN"
]

const TENS = [
  "", "", "TWENTY", "THIRTY", "FORTY", "FIFTY"
]

function minutesToWords(m: number): string {
  if (m === 0) return "O'CLOCK"
  if (m < 20) return ONES[m]
  
  const tenDigit = Math.floor(m / 10)
  const oneDigit = m % 10
  
  return `${TENS[tenDigit]}${oneDigit > 0 ? " " + ONES[oneDigit] : ""}`
}

function hoursToWords(h: number): string {
  const adjustedHour = h % 12 === 0 ? 12 : h % 12
  return ONES[adjustedHour]
}

export function WordClock({ time, theme, burnInShift }: ClockProps) {
  const rawHours = time.getHours()
  const rawMinutes = time.getMinutes()

  const wordItIs = "IT IS"
  const wordHour = hoursToWords(rawHours)
  const wordMinute = minutesToWords(rawMinutes)
  const amPm = rawHours >= 12 ? "PM" : "AM"

  // Calendar generation helpers
  const currentYear = time.getFullYear()
  const currentMonthIdx = time.getMonth() // 0-indexed
  const todayDate = time.getDate()

  const monthName = time.toLocaleDateString("en-US", { month: "long" })
  
  // Get days in current month
  const totalDays = new Date(currentYear, currentMonthIdx + 1, 0).getDate()
  // Get starting day of the week (0 = Sun, 1 = Mon...)
  const firstDayIndex = new Date(currentYear, currentMonthIdx, 1).getDay()

  // Generate grid cells (empty pads + days)
  const calendarCells: (number | null)[] = []
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null)
  }
  for (let d = 1; d <= totalDays; d++) {
    calendarCells.push(d)
  }

  // Theme styling mapping
  const getThemeColor = () => {
    switch (theme) {
      case "aurora":
        return "bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]"
      case "amber":
        return "text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]"
      case "emerald":
        return "text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]"
      case "blue":
        return "text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.4)]"
      case "rose":
        return "text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.4)]"
      case "stealth":
      default:
        return "text-zinc-400"
    }
  }

  const getCalendarHighlight = () => {
    switch (theme) {
      case "aurora":
        return "bg-gradient-to-tr from-blue-500 to-purple-500 text-white shadow-lg shadow-purple-500/30"
      case "amber":
        return "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
      case "emerald":
        return "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
      case "blue":
        return "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
      case "rose":
        return "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
      case "stealth":
      default:
        return "bg-zinc-800 text-zinc-100"
    }
  }

  const accentColorClass = getThemeColor()
  const highlightClass = getCalendarHighlight()

  return (
    <div className="relative flex h-full w-full items-center justify-center p-8 lg:p-12 overflow-hidden select-none">
      {/* Burn-in protection wrapper */}
      <div 
        className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-16 w-full max-w-6xl transition-transform duration-700 ease-out"
        style={{ transform: `translate(${burnInShift.x}px, ${burnInShift.y}px)` }}
      >
        
        {/* Left Column: Typographic Spelled-out Clock */}
        <div className="col-span-1 md:col-span-7 flex flex-col justify-center space-y-2 md:space-y-4">
          <div className="text-[2.2vw] md:text-[1.8vw] font-bold tracking-widest text-zinc-600 uppercase">
            {wordItIs}
          </div>
          
          <div className={`text-[8vw] md:text-[6.5vw] font-black leading-none tracking-tighter ${accentColorClass}`}>
            {wordHour}
          </div>
          
          <div className="text-[6.5vw] md:text-[5.5vw] font-black leading-none tracking-tight text-zinc-200">
            {wordMinute}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <span className="text-[1.8vw] md:text-[1.2vw] font-mono tracking-wider px-2 py-0.5 rounded border border-zinc-800 bg-zinc-950/60 text-zinc-500">
              {amPm}
            </span>
            <span className="text-[1.8vw] md:text-[1.2vw] font-mono text-zinc-600">
              {time.getHours().toString().padStart(2, "0")}:{time.getMinutes().toString().padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* Right Column: Calendar Widget */}
        <div className="col-span-1 md:col-span-5 flex flex-col justify-center border-t md:border-t-0 md:border-l border-zinc-900 pt-6 md:pt-0 md:pl-8 lg:pl-16">
          <div className="mb-4">
            <span className={`text-[3.5vw] md:text-[2.2vw] font-black tracking-widest uppercase ${accentColorClass}`}>
              {monthName}
            </span>
            <span className="ml-2 font-mono text-lg text-zinc-600">{currentYear}</span>
          </div>

          {/* Mini Calendar Grid */}
          <div className="w-full">
            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 text-center text-[1.8vw] md:text-[1vw] font-bold text-zinc-600 mb-2">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
                <div key={idx} className="w-full py-1">{day}</div>
              ))}
            </div>

            {/* Days list */}
            <div className="grid grid-cols-7 gap-1">
              {calendarCells.map((day, cellIdx) => {
                if (day === null) {
                  return <div key={`empty-${cellIdx}`} className="aspect-square" />
                }

                const isToday = day === todayDate
                return (
                  <div
                    key={`day-${day}`}
                    className={`aspect-square flex items-center justify-center rounded-lg text-[1.8vw] md:text-[1.1vw] font-semibold transition-all ${
                      isToday
                        ? `${highlightClass} scale-105 font-bold`
                        : "text-zinc-500 hover:bg-zinc-900/40 hover:text-zinc-300"
                    }`}
                  >
                    {day}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
