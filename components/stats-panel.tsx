"use client"

import { useSimulation } from "@/context/simulation-context"

export default function StatsPanel() {
  const { stats, currentTime, isRunning } = useSimulation()

  // Format time as HH:MM:SS
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  // Format duration in seconds to HH:MM:SS
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="mt-auto space-y-4">
      <h2 className="text-xl font-semibold">Simulation Stats</h2>

      <div className="bg-slate-800 p-4 rounded-md space-y-2">
        <div className="flex justify-between">
          <span>Current Time:</span>
          <span>{formatTime(currentTime)}</span>
        </div>

        <div className="flex justify-between">
          <span>Status:</span>
          <span className={stats.currentlyInCoverage ? "text-green-400" : "text-red-400"}>
            {stats.currentlyInCoverage ? "In Coverage" : "Blackout"}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Handshake Count:</span>
          <span>{stats.handshakeCount}</span>
        </div>

        <div className="flex justify-between">
          <span>Total Blackout Time:</span>
          <span>{formatDuration(stats.totalBlackoutTime)}</span>
        </div>

        <div className="flex justify-between">
          <span>Avg. Blackout Duration:</span>
          <span>{formatDuration(stats.averageBlackoutDuration)}</span>
        </div>
      </div>
    </div>
  )
}
