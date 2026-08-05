"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { Trip } from "@/lib/trips";
import Link from "next/link";

function latLngToVec3(lat: number, lng: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function GlobeScene({ trips }: { trips: Trip[] }) {
  const group = useRef<THREE.Group>(null);
  const markers = useMemo(
    () =>
      trips
        .filter((t) => Number.isFinite(t.lat) && Number.isFinite(t.lng) && !(t.lat === 0 && t.lng === 0))
        .map((t) => ({ trip: t, pos: latLngToVec3(t.lat, t.lng, 1.02) })),
    [trips],
  );

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.08;
  });

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 2, 3]} intensity={1.2} />
      <group ref={group}>
        <Sphere args={[1, 64, 64]}>
          <meshStandardMaterial color="#1f6b68" roughness={0.85} metalness={0.1} />
        </Sphere>
        <Sphere args={[1.01, 64, 64]}>
          <meshStandardMaterial
            color="#9ec5c2"
            transparent
            opacity={0.18}
            roughness={1}
            wireframe
          />
        </Sphere>
        {markers.map(({ trip, pos }) => (
          <mesh key={trip.id} position={pos}>
            <sphereGeometry args={[0.035, 16, 16]} />
            <meshStandardMaterial color="#e9eef3" emissive="#1f6b68" emissiveIntensity={0.4} />
          </mesh>
        ))}
      </group>
      <OrbitControls enablePan={false} minDistance={2.2} maxDistance={4.5} autoRotate={false} />
    </>
  );
}

export function TripGlobe({ trips }: { trips: Trip[] }) {
  const first = trips.find(
    (t) => Number.isFinite(t.lat) && Number.isFinite(t.lng) && !(t.lat === 0 && t.lng === 0),
  );

  return (
    <div className="relative h-[70vh] min-h-[420px] w-full overflow-hidden bg-[#152029]">
      <Canvas camera={{ position: [0, 0.4, 2.8], fov: 42 }}>
        <GlobeScene trips={trips} />
      </Canvas>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.22em] text-white/60">Interactive globe</p>
        <p className="mt-2 max-w-md text-sm text-white/80">
          Drag to orbit. Pins mark mapped trips
          {first ? (
            <>
              {" "}
              — start with{" "}
              <Link href={`/trips/${first.id}`} className="pointer-events-auto underline">
                {first.title}
              </Link>
            </>
          ) : null}
          .
        </p>
      </div>
    </div>
  );
}
