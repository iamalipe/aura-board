import { useEffect, useState, useCallback, useRef } from "react"

export interface UseWakeLockReturn {
  active: boolean
  error: string | null
  request: () => Promise<boolean>
  release: () => Promise<void>
}

export function useWakeLock(): UseWakeLockReturn {
  const [active, setActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Use any to prevent compile-time errors if standard TS DOM types lack WakeLockSentinel
  const wakeLockRef = useRef<any>(null)

  const request = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined" || !("wakeLock" in navigator)) {
      setError("Screen Wake Lock is not supported in this browser.")
      return false
    }

    try {
      // Release existing if any to avoid stacking
      if (wakeLockRef.current) {
        await wakeLockRef.current.release()
      }

      const lock = await (navigator as any).wakeLock.request("screen")
      wakeLockRef.current = lock
      setActive(true)
      setError(null)

      lock.addEventListener("release", () => {
        setActive(false)
        console.log("[Wake Lock] Released by browser/system")
      })

      console.log("[Wake Lock] Acquired successfully")
      return true
    } catch (err: any) {
      console.warn("[Wake Lock] Failed to acquire:", err)
      setError(err?.message || "Failed to acquire wake lock")
      setActive(false)
      return false
    }
  }, [])

  const release = useCallback(async (): Promise<void> => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release()
        wakeLockRef.current = null
        setActive(false)
        console.log("[Wake Lock] Released manually")
      } catch (err: any) {
        console.warn("[Wake Lock] Error during manual release:", err)
      }
    }
  }, [])

  useEffect(() => {
    // Acquire wake lock on mount
    request()

    // Handle visibility changes (e.g. app goes to background and comes back)
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible") {
        console.log("[Wake Lock] Page became visible, re-requesting...")
        await request()
      }
    }

    // Handle connection changes or coming back online if needed,
    // but visibilitychange is the primary catalyst for wake lock loss
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      release()
    }
  }, [request, release])

  return { active, error, request, release }
}
