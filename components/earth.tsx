"use client"

import { useRef } from "react"
import { useFrame, useLoader } from "@react-three/fiber"
import { Sphere } from "@react-three/drei"
import * as THREE from "three"

export default function Earth() {
  const earthRef = useRef<any>()

  // Load Earth textures
  // PLACEHOLDER: Replace these URLs with actual texture URLs
  // You can find Earth textures at: https://www.solarsystemscope.com/textures/
  const [colorMap, normalMap, specularMap, cloudsMap] = useLoader(THREE.TextureLoader, [
    "/textures/earth_daymap.jpg", // Replace with: '/textures/earth_daymap.jpg'
    "/textures/earth_normal.jpg", // Replace with: '/textures/earth_normal.jpg'
    "/textures/earth_specular.jpg", // Replace with: '/textures/earth_specular.jpg'
    "/textures/earth_clouds.jpg", // Replace with: '/textures/earth_clouds.jpg'
  ])

  useFrame(() => {
    if (earthRef.current) {
      // Rotate Earth slowly
      earthRef.current.rotation.y += 0.0005
    }
  })

  return (
    <group>
      {/* Earth sphere */}
      <Sphere ref={earthRef} args={[6371, 64, 64]}>
        <meshPhongMaterial
          map={colorMap}
          normalMap={normalMap}
          specularMap={specularMap}
          shininess={5}
          specular={new THREE.Color(0x333333)}
        />
      </Sphere>

      {/* Cloud layer */}
      <Sphere args={[6371 + 20, 64, 64]}>
        <meshPhongMaterial map={cloudsMap} transparent={true} opacity={0.4} depthWrite={false} />
      </Sphere>
    </group>
  )
}
