"use client"

import { Line } from "@react-three/drei"

interface OrbitTrailProps {
  points: [number, number, number][]
  color: string
}

export default function OrbitTrail({ points, color }: OrbitTrailProps) {
  if (points.length < 2) return null

  return <Line points={points} color={color} lineWidth={1} transparent opacity={0.6} />
}
