"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

interface CommunicationConeProps {
  position: [number, number, number]
  direction: [number, number, number]
  active: boolean
}

export default function CommunicationCone({ position, direction, active }: CommunicationConeProps) {
  const coneRef = useRef<any>()

  // Normalize direction vector
  const dirVector = new THREE.Vector3(direction[0], direction[1], direction[2]).normalize()

  // Create quaternion to rotate cone to point in the right direction
  const quaternion = new THREE.Quaternion()
  quaternion.setFromUnitVectors(
    new THREE.Vector3(0, -1, 0), // Default cone direction (pointing down)
    dirVector,
  )

  useFrame(() => {
    if (coneRef.current && active) {
      // Add subtle animation for active cones
      coneRef.current.material.opacity = 0.3 + Math.sin(Date.now() / 300) * 0.2
    }
  })

  return (
    <mesh position={position} quaternion={quaternion} ref={coneRef}>
      <coneGeometry args={[Math.tan((Math.PI * 62) / 180) * 5000, 5000, 32, 1, true]} />
      <meshBasicMaterial
        color={active ? "#00ff00" : "#ffffff"}
        transparent
        opacity={active ? 0.5 : 0.1}
        side={THREE.DoubleSide}
        wireframe={!active}
      />
    </mesh>
  )
}
