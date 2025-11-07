'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Mesh, ShaderMaterial } from 'three';
import * as THREE from 'three';

// Shader para criar uma malha 3D animada e sutil
const vertexShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  varying vec3 vPosition;
  varying vec3 vNormal;
  
  void main() {
    vPosition = position;
    vNormal = normal;
    
    vec3 pos = position;
    // Efeito de onda suave baseado no tempo e posição
    float wave = sin(pos.x * 0.5 + uTime) * 0.1 + 
                 cos(pos.y * 0.5 + uTime * 0.8) * 0.1;
    pos.z += wave;
    
    // Efeito sutil de interação com o mouse
    float mouseInfluence = length(uMouse - vec2(pos.x, pos.y)) * 0.01;
    pos.z += mouseInfluence * 0.2;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  varying vec3 vPosition;
  varying vec3 vNormal;
  
  void main() {
    // Cor baseada na posição e normal para criar profundidade
    vec3 color1 = vec3(0.0, 0.8, 1.0); // cyan
    vec3 color2 = vec3(0.2, 0.4, 1.0); // blue
    vec3 color3 = vec3(0.5, 0.3, 1.0); // purple
    
    float mixFactor = (vNormal.y + 1.0) * 0.5;
    vec3 color = mix(color1, mix(color2, color3, 0.5), mixFactor);
    
    // Opacidade muito baixa para manter minimalismo
    float alpha = 0.08;
    
    // Efeito de brilho sutil baseado na posição
    float glow = sin(vPosition.x * 0.5 + uTime) * 0.5 + 0.5;
    alpha *= glow * 0.5 + 0.5;
    
    gl_FragColor = vec4(color, alpha);
  }
`;

function AnimatedMesh({ mouse, windowSize }: { mouse: { x: number; y: number }; windowSize: { width: number; height: number } }) {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<ShaderMaterial>(null);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
      // Normalizar posição do mouse para o espaço 3D
      materialRef.current.uniforms.uMouse.value = [
        (mouse.x / windowSize.width) * 10 - 5,
        -(mouse.y / windowSize.height) * 10 + 5,
      ];
    }
  });

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: [0, 0] },
    }),
    []
  );

  return (
    <mesh ref={meshRef} rotation={[0, 0, 0]} position={[0, 0, -5]}>
      <planeGeometry args={[20, 20, 50, 50]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

interface WebGLBackgroundProps {
  mouse: { x: number; y: number };
  windowSize: { width: number; height: number };
}

export default function WebGLBackground({ mouse, windowSize }: WebGLBackgroundProps) {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ alpha: true, antialias: true }}
        style={{ width: '100%', height: '100%' }}
      >
        <AnimatedMesh mouse={mouse} windowSize={windowSize} />
      </Canvas>
    </div>
  );
}

