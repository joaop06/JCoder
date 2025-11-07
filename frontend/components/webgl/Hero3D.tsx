'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import * as THREE from 'three';

interface Hero3DProps {
  mouse: { x: number; y: number };
  windowSize: { width: number; height: number };
}

export default function Hero3D({ mouse, windowSize }: Hero3DProps) {
  const logoRef = useRef<Mesh>(null);
  const ringRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    if (logoRef.current) {
      // Rotação suave baseada no tempo e mouse
      const mouseX = (mouse.x / windowSize.width - 0.5) * 0.5;
      const mouseY = -(mouse.y / windowSize.height - 0.5) * 0.5;
      
      logoRef.current.rotation.y = time * 0.2 + mouseX;
      logoRef.current.rotation.x = Math.sin(time * 0.5) * 0.1 + mouseY;
      
      // Flutuação suave
      logoRef.current.position.y = Math.sin(time) * 0.2;
    }
    
    if (ringRef.current) {
      // Anel rotacionando ao redor
      ringRef.current.rotation.z = time * 0.3;
      ringRef.current.rotation.x = time * 0.2;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Anel decorativo */}
      <mesh ref={ringRef} position={[0, 0, -1]}>
        <torusGeometry args={[1.2, 0.05, 16, 100]} />
        <meshStandardMaterial
          color={new THREE.Color().setHSL(0.55, 0.8, 0.6)}
          emissive={new THREE.Color().setHSL(0.55, 0.8, 0.3)}
          emissiveIntensity={0.5}
          transparent
          opacity={0.3}
        />
      </mesh>
      
      {/* Esfera central (logo placeholder) */}
      <mesh ref={logoRef}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial
          color={new THREE.Color().setHSL(0.55, 0.8, 0.5)}
          emissive={new THREE.Color().setHSL(0.55, 0.8, 0.2)}
          emissiveIntensity={0.3}
          transparent
          opacity={0.2}
        />
      </mesh>
    </group>
  );
}

