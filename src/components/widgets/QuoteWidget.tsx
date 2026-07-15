import { useState, useEffect } from "react"
import { Quote } from "lucide-react"

const QUOTES = [
  { text: "Simplify, then add lightness.", author: "Colin Chapman" },
  { text: "Make it simple, but significant.", author: "Don Draper" },
  { text: "Design is not just what it looks like. Design is how it works.", author: "Steve Jobs" },
  { text: "Detail is not the detail. It is the design.", author: "Charles Eames" },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" }
]

export function QuoteWidget() {
  const [quoteIdx, setQuoteIdx] = useState(0)
  const [fade, setFade] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setQuoteIdx((prev) => (prev + 1) % QUOTES.length)
        setFade(true)
      }, 500) // matches fade-out duration
    }, 10000) // change quote every 10 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col justify-between h-full w-full">
      <div className="flex items-center justify-between border-b border-zinc-900/60 pb-3">
        <span className="text-xs font-bold tracking-wider text-zinc-500 uppercase flex items-center gap-1.5">
          <Quote className="h-4 w-4" />
          Aura Inspiration
        </span>
        <span className="text-[10px] font-mono text-zinc-600">Daily Focus</span>
      </div>

      <div className="my-auto py-2">
        <p className={`text-xs font-medium italic text-zinc-300 leading-relaxed transition-opacity duration-500 ${
          fade ? "opacity-100" : "opacity-0"
        }`}>
          “{QUOTES[quoteIdx].text}”
        </p>
        <p className={`text-[10px] text-zinc-500 font-mono mt-1 text-right transition-opacity duration-500 ${
          fade ? "opacity-100" : "opacity-0"
        }`}>
          — {QUOTES[quoteIdx].author}
        </p>
      </div>

      <div className="h-1 bg-zinc-900/40 rounded-full overflow-hidden">
        <div 
          className="h-full bg-purple-500/40 animate-pulse" 
          style={{ width: "30%" }} 
        />
      </div>
    </div>
  )
}
