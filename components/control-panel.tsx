"use client"

import { useState } from "react"
import { useSimulation, type OrbitType } from "@/context/simulation-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import ExportData from "./export-data"

export default function ControlPanel() {
  const {
    isRunning,
    timeSpeed,
    beaconParams,
    startSimulation,
    stopSimulation,
    setTimeSpeed,
    setBeaconParams,
    resetSimulation,
  } = useSimulation()

  const [altitude, setAltitude] = useState(beaconParams.altitude.toString())
  const [inclination, setInclination] = useState(beaconParams.inclination?.toString() || "45")
  const [localSolarTime, setLocalSolarTime] = useState(beaconParams.localSolarTime?.toString() || "10.5")
  const [orbitType, setOrbitType] = useState<OrbitType>(beaconParams.orbitType)

  const handleApplyParams = () => {
    setBeaconParams({
      orbitType,
      altitude: Number(altitude),
      inclination: orbitType === "non-polar" ? Number(inclination) : undefined,
      localSolarTime: orbitType === "sun-synchronous" ? Number(localSolarTime) : undefined,
    })
  }

  return (
    <div className="space-y-6 mb-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Beacon Orbit Parameters</h2>

        <div className="space-y-2">
          <Label htmlFor="orbit-type">Orbit Type</Label>
          <RadioGroup
            id="orbit-type"
            value={orbitType}
            onValueChange={(value) => setOrbitType(value as OrbitType)}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sun-synchronous" id="sun-sync" />
              <Label htmlFor="sun-sync">Sun-synchronous</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="non-polar" id="non-polar" />
              <Label htmlFor="non-polar">Non-polar</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="altitude">Altitude (km)</Label>
          <Input
            id="altitude"
            type="number"
            value={altitude}
            onChange={(e) => setAltitude(e.target.value)}
            min="200"
            max="2000"
          />
        </div>

        {orbitType === "sun-synchronous" ? (
          <div className="space-y-2">
            <Label htmlFor="lst">Local Solar Time (hours)</Label>
            <Input
              id="lst"
              type="number"
              value={localSolarTime}
              onChange={(e) => setLocalSolarTime(e.target.value)}
              min="0"
              max="24"
              step="0.5"
            />
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="inclination">Inclination (degrees)</Label>
            <Input
              id="inclination"
              type="number"
              value={inclination}
              onChange={(e) => setInclination(e.target.value)}
              min="0"
              max="180"
            />
          </div>
        )}

        <Button onClick={handleApplyParams} className="w-full">
          Apply Parameters
        </Button>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Simulation Controls</h2>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="time-speed">Time Speed: {timeSpeed}x</Label>
          </div>
          <Slider
            id="time-speed"
            min={1}
            max={1000}
            step={1}
            value={[timeSpeed]}
            onValueChange={(value) => setTimeSpeed(value[0])}
          />
        </div>

        <div className="flex space-x-2">
          {isRunning ? (
            <Button onClick={stopSimulation} variant="destructive" className="flex-1">
              Pause
            </Button>
          ) : (
            <Button onClick={startSimulation} className="flex-1">
              Start
            </Button>
          )}
          <Button onClick={resetSimulation} variant="outline" className="flex-1">
            Reset
          </Button>
        </div>
      </div>
      <div className="mt-4">
        <ExportData />
      </div>
    </div>
  )
}
