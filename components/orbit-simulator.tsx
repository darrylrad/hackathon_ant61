"use client"

import { useRef, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Stars } from "@react-three/drei"
import { useSimulation } from "@/context/simulation-context"
import Earth from "./earth"
import Satellite from "./satellite"
import OrbitTrail from "./orbit-trail"
import CommunicationCone from "./communication-cone"

// Add these imports at the top
import { useFrame } from "@react-three/fiber"
import { Suspense, useMemo } from "react"
import { type InstancedMesh, Matrix4, Object3D } from "three"

// Replace the Scene component with this optimized version:
const Scene = () => {
  const { satellites, currentTime, stats } = useSimulation()
  const orbitTrailsRef = useRef<any>({})

  // Generate orbit trails for each satellite
  useEffect(() => {
    // This would be implemented with actual orbital calculations
    // For now, we'll create placeholder orbit trails

    const generateOrbitTrail = (satellite: any) => {
      // PLACEHOLDER: Replace with actual orbit calculation
      // For actual implementation:
      // 1. Use satellite.js to propagate the satellite position at different time points
      // 2. Convert the positions to 3D coordinates

      const points: [number, number, number][] = []
      const satId = Number.parseInt(satellite.id.split("-")[1] || "0")

      // Orbital parameters (same as in updateSatellitePositions)
      const semiMajorAxis = 7000 + (satId % 10) * 200
      const inclination = 86.4 + (satId % 20) * 0.1

      // Generate points along the orbit
      const segments = 100
      for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2
        const x = semiMajorAxis * Math.cos(angle)
        const y = semiMajorAxis * Math.sin(angle) * Math.cos((inclination * Math.PI) / 180)
        const z = semiMajorAxis * Math.sin(angle) * Math.sin((inclination * Math.PI) / 180)
        points.push([x, y, z])
      }

      return points
    }

    // Generate orbit trails for all satellites
    const trails: Record<string, [number, number, number][]> = {}
    satellites.forEach((satellite) => {
      trails[satellite.id] = generateOrbitTrail(satellite)
    })

    orbitTrailsRef.current = trails
  }, [satellites])

  // Optimization: Use instanced mesh for Iridium satellites
  const iridiumSatellites = useMemo(() => {
    return satellites.filter((sat) => sat.isIridium)
  }, [satellites])

  const beaconSatellite = useMemo(() => {
    return satellites.find((sat) => !sat.isIridium)
  }, [satellites])

  // Instanced mesh for Iridium satellites
  const IridiumInstances = () => {
    const instancedMeshRef = useRef<InstancedMesh>(null)
    const tempObject = useMemo(() => new Object3D(), [])
    const matrix = useMemo(() => new Matrix4(), [])

    useFrame(() => {
      if (!instancedMeshRef.current) return

      iridiumSatellites.forEach((satellite, i) => {
        tempObject.position.set(satellite.position.x, satellite.position.y, satellite.position.z)
        tempObject.rotation.x += 0.01
        tempObject.rotation.y += 0.01
        tempObject.updateMatrix()
        instancedMeshRef.current!.setMatrixAt(i, tempObject.matrix)
      })

      instancedMeshRef.current.instanceMatrix.needsUpdate = true
    })

    return (
      <instancedMesh
        ref={instancedMeshRef}
        args={[undefined, undefined, iridiumSatellites.length]}
        frustumCulled={true}
      >
        <boxGeometry args={[100, 100, 100]} />
        <meshStandardMaterial color="#00ffff" />
      </instancedMesh>
    )
  }

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[100000, 10000, 50000]} intensity={1.5} />
      <hemisphereLight args={[0x3284ff, 0xffc87f, 0.6]} />

      <Suspense fallback={null}>
        <Earth />
      </Suspense>

      <Stars radius={100000} depth={50} count={5000} factor={4} saturation={0} fade />

      {/* Optimized rendering for Iridium satellites */}
      <IridiumInstances />

      {/* Render Beacon satellite individually */}
      {beaconSatellite && (
        <Satellite
          position={[beaconSatellite.position.x, beaconSatellite.position.y, beaconSatellite.position.z]}
          isBeacon={true}
          name={beaconSatellite.name}
        />
      )}

      {/* Communication cones */}
      {iridiumSatellites.map((satellite) => (
        <CommunicationCone
          key={`cone-${satellite.id}`}
          position={[satellite.position.x, satellite.position.y, satellite.position.z]}
          direction={[-satellite.position.x, -satellite.position.y, -satellite.position.z]}
          active={
            stats.currentlyInCoverage &&
            stats.handshakes?.length > 0 &&
            stats.handshakes[stats.handshakes.length - 1].iridiumId === satellite.id
          }
        />
      ))}

      {/* Orbit trails */}
      {satellites.map((satellite) => (
        <OrbitTrail
          key={`trail-${satellite.id}`}
          points={orbitTrailsRef.current[satellite.id] || []}
          color={satellite.isIridium ? "#00ffff" : "#ff9900"}
        />
      ))}

      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} minDistance={7000} maxDistance={20000} />
    </>
  )
}

// Update the OrbitSimulator component to include a loading state
export default function OrbitSimulator() {
  const { isLoading } = useSimulation()

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black">
        <div className="text-white text-xl">Loading satellite data...</div>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 15000], fov: 45 }}
        performance={{ min: 0.5 }} // Performance optimization
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}
