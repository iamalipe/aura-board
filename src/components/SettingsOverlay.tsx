import { 
  X, Moon, Shield, Settings, 
  Maximize, Minimize, AlertCircle 
} from "lucide-react"

export type AccentTheme = "aurora" | "amber" | "emerald" | "blue" | "rose" | "stealth"

interface SettingsOverlayProps {
  isOpen: boolean
  onClose: () => void
  accentTheme: AccentTheme
  setAccentTheme: (theme: AccentTheme) => void
  nightMode: boolean
  setNightMode: (val: boolean) => void
  burnInProtection: boolean
  setBurnInProtection: (val: boolean) => void
  currentFace: number
  setCurrentFace: (face: number) => void
  wakeLockActive: boolean
  wakeLockError: string | null
  triggerWakeLock: () => void
  isFullscreen: boolean
  toggleFullscreen: () => void
  scale: number
  setScale: (val: number) => void
  dashboardLayout: "single" | "dual"
  setDashboardLayout: (layout: "single" | "dual") => void
}

export function SettingsOverlay({
  isOpen,
  onClose,
  accentTheme,
  setAccentTheme,
  nightMode,
  setNightMode,
  burnInProtection,
  setBurnInProtection,
  currentFace,
  setCurrentFace,
  wakeLockActive,
  wakeLockError,
  triggerWakeLock,
  isFullscreen,
  toggleFullscreen,
  scale,
  setScale,
  dashboardLayout,
  setDashboardLayout,
}: SettingsOverlayProps) {
  if (!isOpen) return null

  const themes: { id: AccentTheme; name: string; class: string }[] = [
    { id: "aurora", name: "Aurora", class: "bg-gradient-to-tr from-blue-400 via-purple-400 to-pink-400" },
    { id: "amber", name: "Amber", class: "bg-amber-500" },
    { id: "emerald", name: "Emerald", class: "bg-emerald-500" },
    { id: "blue", name: "Ocean Blue", class: "bg-blue-500" },
    { id: "rose", name: "Crimson", class: "bg-rose-500" },
    { id: "stealth", name: "Stealth", class: "bg-zinc-700" },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/90 text-zinc-100 shadow-2xl backdrop-blur-xl transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-900 px-6 py-4">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-purple-400 animate-spin-slow" />
            <h2 className="text-lg font-semibold tracking-wide">Dashboard Settings</h2>
          </div>
          <button 
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 transition-colors"
            aria-label="Close settings"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto p-6 space-y-6">
          
          {/* Section: Clock Face Selection */}
          <div className="space-y-2">
            <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Selected Clock Face</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { idx: 0, label: "Digital Minimal" },
                { idx: 1, label: "Typography Word" },
                { idx: 2, label: "Widgets Focus" }
              ].map((face) => (
                <button
                  key={face.idx}
                  onClick={() => setCurrentFace(face.idx)}
                  className={`rounded-lg py-2.5 px-3 text-sm font-medium transition-all duration-200 border ${
                    currentFace === face.idx
                      ? "bg-zinc-900 text-white border-zinc-700 shadow-md scale-[1.02]"
                      : "bg-zinc-950 text-zinc-400 border-transparent hover:bg-zinc-900/50 hover:text-zinc-200"
                  }`}
                >
                  {face.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-zinc-500 italic">Tip: You can also swipe Up or Down anywhere on the screen to change faces.</p>
          </div>

          {/* Section: Color Palette presets */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Aura Accent Theme</h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setAccentTheme(theme.id)}
                  className={`group relative flex flex-col items-center justify-center rounded-lg p-2 transition-all border ${
                    accentTheme === theme.id
                      ? "bg-zinc-900/60 border-zinc-700 shadow-inner"
                      : "bg-transparent border-zinc-900 hover:bg-zinc-900/20"
                  }`}
                >
                  <span className={`h-6 w-6 rounded-full ${theme.class} shadow-sm transition-transform duration-200 group-hover:scale-110`} />
                  <span className="mt-1 text-[10px] font-medium text-zinc-400 truncate w-full text-center">
                    {theme.name}
                  </span>
                  {accentTheme === theme.id && (
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500"></span>
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Section: Function Toggles */}
          <div className="space-y-3">
            <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Always-On Adjustments</h3>
            
            {/* Night Mode Toggle */}
            <div className="flex items-center justify-between rounded-xl bg-zinc-950 p-4 border border-zinc-900">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-zinc-900 p-2 text-rose-400">
                  <Moon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-zinc-200">Bedside Night Mode</h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Dims screen to ultra-low and shifts display to warning-red to prevent sleep disruption.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setNightMode(!nightMode)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  nightMode ? "bg-rose-600" : "bg-zinc-800"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    nightMode ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Dashboard Widget Configuration layout */}
            <div className="flex items-center justify-between rounded-xl bg-zinc-950 p-4 border border-zinc-900">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-zinc-900 p-2 text-purple-400">
                  <Settings className="h-5 w-5 animate-spin-slow" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-zinc-200">Dashboard Layout</h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Toggle between single widget or dual widgets focus panel.
                  </p>
                </div>
              </div>
              <div className="flex bg-zinc-900 border border-zinc-800 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  onClick={() => setDashboardLayout("single")}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    dashboardLayout === "single"
                      ? "bg-zinc-950 text-purple-400 border border-zinc-800 shadow"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Single
                </button>
                <button
                  onClick={() => setDashboardLayout("dual")}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    dashboardLayout === "dual"
                      ? "bg-zinc-950 text-purple-400 border border-zinc-800 shadow"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Dual
                </button>
              </div>
            </div>

            {/* Burn-in Protection Toggle */}
            <div className="flex items-center justify-between rounded-xl bg-zinc-950 p-4 border border-zinc-900">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-zinc-900 p-2 text-amber-400">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-zinc-200">OLED Burn-in Protection</h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Slowly and imperceptibly shifts screen elements by ±10px every 2 minutes to prevent pixel exhaustion.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setBurnInProtection(!burnInProtection)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  burnInProtection ? "bg-emerald-600" : "bg-zinc-800"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    burnInProtection ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Display Zoom Scale Slider */}
            <div className="flex flex-col gap-2 rounded-xl bg-zinc-950 p-4 border border-zinc-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-zinc-900 p-2 text-blue-400">
                    <Maximize className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-zinc-200">Display Zoom Scale</h4>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Adjust clock sizing to scale dynamically on physical screens.
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-zinc-300 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                  {Math.round(scale * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-3 mt-2 px-1">
                <span className="text-[10px] text-zinc-600 font-mono">50%</span>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.05"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="flex-1 h-1.5 rounded-lg bg-zinc-800 accent-purple-500 cursor-pointer outline-none"
                />
                <span className="text-[10px] text-zinc-600 font-mono">200%</span>
              </div>
            </div>
          </div>

          {/* Section: Diagnostics & Utilities */}
          <div className="space-y-3">
            <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">System Diagnostics</h3>

            {/* Screen Wake Lock Status */}
            <div className="flex items-center justify-between rounded-xl bg-zinc-950 p-3 border border-zinc-900 text-xs">
              <div className="flex items-center gap-2">
                <span className={`inline-block h-2 w-2 rounded-full ${wakeLockActive ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                <span className="font-medium text-zinc-300">Screen Wake Lock State:</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-mono px-2 py-0.5 rounded text-[10px] ${wakeLockActive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                  {wakeLockActive ? "HOLDING ACTIVE" : "RELEASED / INACTIVE"}
                </span>
                {!wakeLockActive && (
                  <button 
                    onClick={triggerWakeLock}
                    className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors text-[10px]"
                  >
                    Retry Lock
                  </button>
                )}
              </div>
            </div>

            {wakeLockError && (
              <div className="flex items-start gap-2 rounded-lg bg-red-950/30 border border-red-900/50 p-2.5 text-[11px] text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{wakeLockError}</span>
              </div>
            )}

            {/* Fullscreen Toggle */}
            <div className="flex items-center justify-between rounded-xl bg-zinc-950 p-3 border border-zinc-900 text-xs">
              <div className="flex items-center gap-2">
                <Maximize className="h-4 w-4 text-zinc-400" />
                <span className="font-medium text-zinc-300">Display Layout:</span>
              </div>
              <button
                onClick={toggleFullscreen}
                className="flex items-center gap-1.5 px-3 py-1 rounded bg-zinc-800 text-zinc-100 hover:bg-zinc-700 transition-colors font-medium text-[11px]"
              >
                {isFullscreen ? (
                  <>
                    <Minimize className="h-3.5 w-3.5" />
                    Exit Fullscreen
                  </>
                ) : (
                  <>
                    <Maximize className="h-3.5 w-3.5" />
                    Enter Fullscreen
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-900 bg-zinc-950/40 px-6 py-3 text-[10px] text-zinc-500 font-mono">
          <span>AuraBoard Foundation v0.0.1</span>
          <span>Double-tap screen to close</span>
        </div>
      </div>
    </div>
  )
}
