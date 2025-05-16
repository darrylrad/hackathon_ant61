"use client"

import { useState } from "react"
import { useSimulation } from "@/context/simulation-context"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function ExportData() {
  const { stats, handshakes, currentTime } = useSimulation()
  const [isOpen, setIsOpen] = useState(false)

  // Format handshakes data for export
  const formatHandshakesData = () => {
    return handshakes.map((handshake) => ({
      iridiumId: handshake.iridiumId,
      startTime: handshake.startTime.toISOString(),
      endTime: handshake.endTime ? handshake.endTime.toISOString() : "ongoing",
      duration: handshake.endTime
        ? ((handshake.endTime.getTime() - handshake.startTime.getTime()) / 1000).toFixed(1) + "s"
        : "ongoing",
    }))
  }

  // Format stats data for export
  const formatStatsData = () => {
    return {
      simulationTime: currentTime.toISOString(),
      handshakeCount: stats.handshakeCount,
      totalBlackoutTime: stats.totalBlackoutTime.toFixed(1) + "s",
      averageBlackoutDuration: stats.averageBlackoutDuration.toFixed(1) + "s",
      currentStatus: stats.currentlyInCoverage ? "In Coverage" : "Blackout",
    }
  }

  // Export data as JSON
  const exportAsJson = () => {
    const data = {
      stats: formatStatsData(),
      handshakes: formatHandshakesData(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `beacon-simulation-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Export data as CSV
  const exportAsCsv = () => {
    const handshakesData = formatHandshakesData()

    // Create CSV header
    let csv = "Iridium ID,Start Time,End Time,Duration\n"

    // Add handshakes data
    handshakesData.forEach((handshake) => {
      csv += `${handshake.iridiumId},${handshake.startTime},${handshake.endTime},${handshake.duration}\n`
    })

    // Create and download the file
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `beacon-handshakes-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          Export Data
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Simulation Data</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="text-sm">Export your simulation results for analysis or presentation.</div>
          <div className="flex space-x-2">
            <Button onClick={exportAsJson} className="flex-1">
              Export as JSON
            </Button>
            <Button onClick={exportAsCsv} className="flex-1">
              Export as CSV
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
