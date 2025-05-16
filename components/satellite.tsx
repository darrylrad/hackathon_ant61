"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Html } from "@react-three/drei"

interface SatelliteProps {
  position: [number, number, number]
  isBeacon: boolean
  name: string
}

export default function Satellite({ position, isBeacon, name }: SatelliteProps) {
  const meshRef = useRef<any>()

  useFrame(() => {
    if (meshRef.current) {
      // Add some subtle animation to make satellites more visible
      meshRef.current.rotation.x += 0.01
      meshRef.current.rotation.y += 0.01
    }
  })

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <boxGeometry args={[100, 100, 100]} />
        <meshStandardMaterial color={isBeacon ? "#ff9900" : "#00ffff"} />
      </mesh>
      <Html distanceFactor={1000}>
        <div className="text-white bg-black bg-opacity-50 px-2 py-1 rounded text-xs">{name}</div>
      </Html>
    </group>
  )
}
