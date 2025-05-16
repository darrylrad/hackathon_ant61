"use client"
import OrbitSimulator from "@/components/orbit-simulator"
import ControlPanel from "@/components/control-panel"
import StatsPanel from "@/components/stats-panel"
import { SimulationProvider } from "@/context/simulation-context"

export default function Home() {
  return (
    <SimulationProvider>
      <main className="flex min-h-screen flex-col items-center justify-between">
        <div className="w-full h-screen flex">
          <div className="w-3/4 h-full">
            <OrbitSimulator />
          </div>
          <div className="w-1/4 h-full bg-slate-900 text-white p-4 flex flex-col">
            <h1 className="text-2xl font-bold mb-6">Beacon-Orbit Simulator</h1>
            <ControlPanel />
            <StatsPanel />
          </div>
        </div>
      </main>
    </SimulationProvider>
  )
}
