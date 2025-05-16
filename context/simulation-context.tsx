"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { twoline2satrec, radiansToDegrees } from "satellite.js"
import { fetchTLEData } from "@/lib/tle-loader"

export type OrbitType = "sun-synchronous" | "non-polar"

export interface BeaconParams {
  orbitType: OrbitType
  altitude: number // in km
  inclination?: number // for non-polar orbits, in degrees
  localSolarTime?: number // for sun-synchronous orbits, in hours (0-24)
}

export interface Satellite {
  id: string
  name: string
  satrec: any
  position: {
    x: number
    y: number
    z: number
  }
  isIridium: boolean
}

export interface Handshake {
  startTime: Date
  endTime?: Date
  iridiumId: string
}

export interface SimulationStats {
  handshakeCount: number
  totalBlackoutTime: number // in seconds
  averageBlackoutDuration: number // in seconds
  currentlyInCoverage: boolean
  lastBlackoutStart?: Date
}

interface SimulationContextType {
  isLoading: boolean
  isRunning: boolean
  timeSpeed: number
  currentTime: Date
  satellites: Satellite[]
  beaconParams: BeaconParams
  stats: SimulationStats
  handshakes: Handshake[]
  setBeaconParams: (params: BeaconParams) => void
  startSimulation: () => void
  stopSimulation: () => void
  setTimeSpeed: (speed: number) => void
  resetSimulation: () => void
}

const defaultBeaconParams: BeaconParams = {
  orbitType: "sun-synchronous",
  altitude: 500,
  localSolarTime: 10.5,
}

const defaultStats: SimulationStats = {
  handshakeCount: 0,
  totalBlackoutTime: 0,
  averageBlackoutDuration: 0,
  currentlyInCoverage: false,
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined)

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [isRunning, setIsRunning] = useState(false)
  const [timeSpeed, setTimeSpeed] = useState(60) // 60x speed by default
  const [currentTime, setCurrentTime] = useState(new Date())
  const [satellites, setSatellites] = useState<Satellite[]>([])
  const [beaconParams, setBeaconParams] = useState<BeaconParams>(defaultBeaconParams)
  const [stats, setStats] = useState<SimulationStats>(defaultStats)
  const [handshakes, setHandshakes] = useState<Handshake[]>([])
  const [activeHandshake, setActiveHandshake] = useState<Handshake | null>(null)

  // Load TLE data on mount
  useEffect(() => {
    const loadTLEData = async () => {
      try {
        setIsLoading(true)
        const tleData = await fetchTLEData()

        // Process TLE data into satellite objects
        const iridiumSatellites = tleData.map((tle, index) => {
          const satrec = twoline2satrec(tle.line1, tle.line2)
          return {
            id: `iridium-${index}`,
            name: tle.name || `Iridium ${index}`,
            satrec,
            position: { x: 0, y: 0, z: 0 },
            isIridium: true,
          }
        })

        // Add beacon satellite
        const beaconSatellite = createBeaconSatellite(beaconParams)

        setSatellites([...iridiumSatellites, beaconSatellite])
        setIsLoading(false)
      } catch (error) {
        console.error("Failed to load TLE data:", error)
        setIsLoading(false)
      }
    }

    loadTLEData()
  }, [])

  // Update beacon satellite when params change
  useEffect(() => {
    if (satellites.length > 0) {
      const beaconSatellite = createBeaconSatellite(beaconParams)

      // Replace the beacon satellite in the satellites array
      setSatellites((prevSatellites) => {
        const iridiumSatellites = prevSatellites.filter((sat) => sat.isIridium)
        return [...iridiumSatellites, beaconSatellite]
      })
    }
  }, [beaconParams])

  // Simulation loop
  useEffect(() => {
    if (!isRunning || isLoading) return

    const intervalId = setInterval(() => {
      setCurrentTime((prevTime) => {
        const newTime = new Date(prevTime.getTime() + 1000 * timeSpeed)
        updateSatellitePositions(newTime)
        checkHandshakes(newTime)
        return newTime
      })
    }, 1000)

    return () => clearInterval(intervalId)
  }, [isRunning, isLoading, timeSpeed, satellites])

  // Create beacon satellite based on parameters
  const createBeaconSatellite = (params: BeaconParams) => {
    // This is a simplified placeholder - in a real implementation,
    // you would generate proper TLE data or orbital elements based on the params

    // For now, we'll create a dummy satrec object
    const dummySatrec = {} as any // This would be replaced with actual orbital elements

    return {
      id: "beacon",
      name: "Beacon Satellite",
      satrec: dummySatrec,
      position: { x: 0, y: 0, z: 0 },
      isIridium: false,
    }
  }

  // Update satellite positions based on current time
  const updateSatellitePositions = (time: Date) => {
    setSatellites((prevSatellites) => {
      return prevSatellites.map((satellite) => {
        try {
          // PLACEHOLDER: Replace with actual satellite.js calculations
          // For actual implementation:
          // 1. Use satellite.propagate(satrec, time) to get ECI position
          // 2. Convert ECI to ECEF coordinates using satellite.eciToEcf()
          // 3. Scale the coordinates appropriately for visualization

          // Random orbit calculation for demonstration
          const timeOffset = time.getTime() / 1000 // Convert to seconds
          const satId = Number.parseInt(satellite.id.split("-")[1] || "0")

          // Orbital parameters (random but consistent for each satellite)
          const semiMajorAxis = 7000 + (satId % 10) * 200 // km from Earth center
          const eccentricity = 0.001 + (satId % 5) * 0.0005 // Nearly circular
          const inclination = 86.4 + (satId % 20) * 0.1 // Degrees (near polar for Iridium)
          const period = 100 * (1 + (satId % 10) * 0.01) // Minutes

          // Convert period to angular velocity
          const angularVelocity = (2 * Math.PI) / (period * 60) // radians per second

          // Calculate position based on time
          const angle = timeOffset * angularVelocity + satId * 0.5 // Current angle in orbit

          // Apply inclination and calculate 3D position
          const x = semiMajorAxis * Math.cos(angle)
          const y = semiMajorAxis * Math.sin(angle) * Math.cos((inclination * Math.PI) / 180)
          const z = semiMajorAxis * Math.sin(angle) * Math.sin((inclination * Math.PI) / 180)

          // For Beacon satellite, use different parameters if it's not an Iridium
          let position
          if (!satellite.isIridium) {
            // PLACEHOLDER: Replace with actual beacon orbit calculation based on beaconParams
            // For actual implementation:
            // 1. Generate TLE or orbital elements from beaconParams
            // 2. Create satrec object and propagate

            // For now, create a different orbit for the beacon
            const beaconAltitude = beaconParams.altitude
            const beaconRadius = 6371 + beaconAltitude // Earth radius + altitude
            const beaconInclination = beaconParams.orbitType === "sun-synchronous" ? 98 : beaconParams.inclination || 45
            const beaconPeriod = 90 // Minutes
            const beaconAngularVelocity = (2 * Math.PI) / (beaconPeriod * 60)
            const beaconAngle = timeOffset * beaconAngularVelocity

            position = {
              x: beaconRadius * Math.cos(beaconAngle),
              y: beaconRadius * Math.sin(beaconAngle) * Math.cos((beaconInclination * Math.PI) / 180),
              z: beaconRadius * Math.sin(beaconAngle) * Math.sin((beaconInclination * Math.PI) / 180),
            }
          } else {
            position = { x, y, z }
          }

          return { ...satellite, position }
        } catch (error) {
          console.error(`Error updating position for satellite ${satellite.id}:`, error)
          return satellite
        }
      })
    })
  }

  // Check for handshakes between beacon and Iridium satellites
  const checkHandshakes = (time: Date) => {
    const beacon = satellites.find((sat) => !sat.isIridium)
    if (!beacon) return

    const iridiumSats = satellites.filter((sat) => sat.isIridium)
    let inCoverage = false

    for (const iridiumSat of iridiumSats) {
      const isInCone = checkIfInCommunicationCone(beacon, iridiumSat)

      if (isInCone) {
        inCoverage = true

        // Check if we need to start a new handshake
        if (!activeHandshake) {
          const newHandshake: Handshake = {
            startTime: new Date(time),
            iridiumId: iridiumSat.id,
          }
          setActiveHandshake(newHandshake)
          setHandshakes((prev) => [...prev, newHandshake])
          setStats((prev) => ({
            ...prev,
            handshakeCount: prev.handshakeCount + 1,
            currentlyInCoverage: true,
          }))
        }
        break
      }
    }

    // If not in coverage but was in coverage before, end the handshake
    if (!inCoverage && activeHandshake) {
      setHandshakes((prev) => prev.map((h) => (h === activeHandshake ? { ...h, endTime: new Date(time) } : h)))
      setActiveHandshake(null)
      setStats((prev) => {
        const newStats = { ...prev, currentlyInCoverage: false }
        if (!prev.lastBlackoutStart) {
          newStats.lastBlackoutStart = new Date(time)
        }
        return newStats
      })
    }

    // If in coverage but was in blackout before, calculate blackout duration
    if (inCoverage && stats.lastBlackoutStart) {
      const blackoutDuration = (time.getTime() - stats.lastBlackoutStart.getTime()) / 1000
      setStats((prev) => {
        const newTotalBlackout = prev.totalBlackoutTime + blackoutDuration
        const newHandshakeCount = prev.handshakeCount
        return {
          ...prev,
          totalBlackoutTime: newTotalBlackout,
          averageBlackoutDuration: newTotalBlackout / (newHandshakeCount > 0 ? newHandshakeCount : 1),
          currentlyInCoverage: true,
          lastBlackoutStart: undefined,
        }
      })
    }
  }

  // Check if beacon is within communication cone of an Iridium satellite
  const checkIfInCommunicationCone = (beacon: Satellite, iridium: Satellite) => {
    // Calculate vector from iridium to beacon
    const vectorToBeacon = {
      x: beacon.position.x - iridium.position.x,
      y: beacon.position.y - iridium.position.y,
      z: beacon.position.z - iridium.position.z,
    }

    // Calculate vector from iridium to Earth center (nadir direction)
    const nadirVector = {
      x: -iridium.position.x,
      y: -iridium.position.y,
      z: -iridium.position.z,
    }

    // Normalize vectors
    const magnitudeToBeacon = Math.sqrt(
      vectorToBeacon.x * vectorToBeacon.x + vectorToBeacon.y * vectorToBeacon.y + vectorToBeacon.z * vectorToBeacon.z,
    )

    const magnitudeNadir = Math.sqrt(
      nadirVector.x * nadirVector.x + nadirVector.y * nadirVector.y + nadirVector.z * nadirVector.z,
    )

    const normalizedToBeacon = {
      x: vectorToBeacon.x / magnitudeToBeacon,
      y: vectorToBeacon.y / magnitudeToBeacon,
      z: vectorToBeacon.z / magnitudeToBeacon,
    }

    const normalizedNadir = {
      x: nadirVector.x / magnitudeNadir,
      y: nadirVector.y / magnitudeNadir,
      z: nadirVector.z / magnitudeNadir,
    }

    // Calculate dot product
    const dotProduct =
      normalizedToBeacon.x * normalizedNadir.x +
      normalizedToBeacon.y * normalizedNadir.y +
      normalizedToBeacon.z * normalizedNadir.z

    // Calculate angle in radians and convert to degrees
    const angleRadians = Math.acos(dotProduct)
    const angleDegrees = radiansToDegrees(angleRadians)

    // Check if angle is within 62 degrees
    return angleDegrees <= 62
  }

  const startSimulation = useCallback(() => {
    setIsRunning(true)
  }, [])

  const stopSimulation = useCallback(() => {
    setIsRunning(false)
  }, [])

  const resetSimulation = useCallback(() => {
    setIsRunning(false)
    setCurrentTime(new Date())
    setStats(defaultStats)
    setHandshakes([])
    setActiveHandshake(null)
  }, [])

  const value = {
    isLoading,
    isRunning,
    timeSpeed,
    currentTime,
    satellites,
    beaconParams,
    stats,
    handshakes,
    setBeaconParams,
    startSimulation,
    stopSimulation,
    setTimeSpeed,
    resetSimulation,
  }

  return <SimulationContext.Provider value={value}>{children}</SimulationContext.Provider>
}

export const useSimulation = () => {
  const context = useContext(SimulationContext)
  if (context === undefined) {
    throw new Error("useSimulation must be used within a SimulationProvider")
  }
  return context
}
