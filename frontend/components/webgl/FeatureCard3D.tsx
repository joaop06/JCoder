'use client';

import * as THREE from 'three';
import { useRef, useState, useEffect } from 'react';

interface FeatureCard3DProps {
  children: React.ReactNode;
  mouse: { x: number; y: number };
  index: number;
}

export default function FeatureCard3D({ children, mouse }: FeatureCard3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({ width: 1920, height: 1080 });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const updateWindowSize = () => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      };
      updateWindowSize();
      window.addEventListener('resize', updateWindowSize);
      return () => window.removeEventListener('resize', updateWindowSize);
    }
  }, []);

  useEffect(() => {
    if (!cardRef.current || typeof window === 'undefined') return;

    const targetX = (mouse.x / windowSize.width - 0.5) * 10;
    const targetY = -(mouse.y / windowSize.height - 0.5) * 10;

    setRotation((prev) => ({
      x: THREE.MathUtils.lerp(prev.x, targetY + (hovered ? 5 : 0), 0.05),
      y: THREE.MathUtils.lerp(prev.y, targetX + (hovered ? 5 : 0), 0.05),
    }));
  }, [mouse, hovered, windowSize]);

  return (
    <div
      ref={cardRef}
      className="transform-gpu transition-transform duration-300"
      style={{
        transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) translateZ(${hovered ? 10 : 0}px)`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </div>
  );
}

