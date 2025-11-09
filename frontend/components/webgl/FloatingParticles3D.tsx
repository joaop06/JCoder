'use client';

import { Mesh } from 'three';
import * as THREE from 'three';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';

function Particle({ position, index }: { position: [number, number, number]; index: number }) {
  const meshRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      // Smooth floating movement
      const time = clock.getElapsedTime();
      meshRef.current.position.y = position[1] + Math.sin(time + index) * 0.3;
      meshRef.current.position.x = position[0] + Math.cos(time * 0.5 + index) * 0.2;

      // Subtle rotation
      meshRef.current.rotation.x = time * 0.2;
      meshRef.current.rotation.y = time * 0.3;

      // Pulsating scale
      const scale = 1 + Math.sin(time * 2 + index) * 0.1;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <octahedronGeometry args={[0.05, 0]} />
      <meshStandardMaterial
        color={new THREE.Color().setHSL(0.55 + index * 0.1, 0.8, 0.6)}
        emissive={new THREE.Color().setHSL(0.55 + index * 0.1, 0.8, 0.3)}
        emissiveIntensity={0.5}
        transparent
        opacity={0.4}
      />
    </mesh>
  );
}

export default function FloatingParticles3D() {
  const particles = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 5 - 3,
      ] as [number, number, number],
      index: i,
    }));
  }, []);

  return (
    <>
      {particles.map((particle, i) => (
        <Particle key={i} position={particle.position} index={particle.index} />
      ))}
    </>
  );
}

