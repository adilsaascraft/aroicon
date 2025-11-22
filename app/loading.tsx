"use client"
import { useEffect, useState } from "react"

export default function Loading() {
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setPulse((prev) => !prev), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="relative flex items-center justify-center">
        
        {/* Outer Soft Glow Ring */}
        <div
          className={`
            absolute w-40 h-40 rounded-full 
            bg-sky-400/20 blur-xl 
            transition-all duration-700
            ${pulse ? "scale-110 opacity-70" : "scale-90 opacity-40"}
          `}
        ></div>

        {/* Middle Ring */}
        <div
          className={`
            absolute w-28 h-28 rounded-full 
            bg-sky-500/25 blur-lg 
            transition-all duration-700
            ${pulse ? "scale-110 opacity-80" : "scale-90 opacity-50"}
          `}
        ></div>

        {/* Inner Ring */}
        <div
          className={`
            absolute w-16 h-16 rounded-full 
            bg-sky-600/30 blur-md 
            transition-all duration-700
            ${pulse ? "scale-110 opacity-90" : "scale-90 opacity-60"}
          `}
        ></div>

        {/* Center Text */}
        <span
          className={`
            text-sky-800 font-semibold text-center text-lg tracking-wide
            transition-opacity duration-700
            ${pulse ? "opacity-100" : "opacity-60"}
          `}
        >
          Powered by SaaScraft Studio
        </span>
      </div>
    </div>
  )
}
