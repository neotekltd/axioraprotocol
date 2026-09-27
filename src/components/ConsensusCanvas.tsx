'use client';
import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Isolated ambient 3D: consensus nodes + drifting particles. Lazy-loaded,
// client-only, never blocks first paint. Original Axiora geometry.
function Nodes() {
  const group = useRef<THREE.Group>(null);
  const positions = useMemo(
    () => [
      [-2.2, 1.1, 0],
      [-2.2, -1.1, 0],
      [2.2, 1.1, 0],
      [2.2, -1.1, 0],
      [0, 0, 0],
    ] as const,
    []
  );
  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.12) * 0.35;
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.08;
  });
  const spokes = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pts: number[] = [];
    positions.forEach((p, i) => {
      if (i === positions.length - 1) return;
      pts.push(p[0], p[1], p[2], 0, 0, 0);
    });
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3));
    return g;
  }, [positions]);
  return (
    <group ref={group}>
      <lineSegments geometry={spokes}>
        <lineBasicMaterial color="#00D294" transparent opacity={0.35} />
      </lineSegments>
      {positions.map((p, i) => (
        <mesh key={i} position={[p[0], p[1], p[2]]}>
          <sphereGeometry args={[i === 4 ? 0.14 : 0.08, 24, 24]} />
          <meshStandardMaterial
            color={i === 4 ? '#00D294' : '#0a3d2c'}
            emissive={i === 4 ? '#00D294' : '#06301f'}
            emissiveIntensity={i === 4 ? 0.9 : 0.7}
            roughness={0.35}
            metalness={0.1}
          />
        </mesh>
      ))}
      <gridHelper args={[6, 12, '#134e3a', '#0a1a14']} position={[0, -1.8, 0]} />
    </group>
  );
}

function Particles({ count = 220 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 5;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    return g;
  }, [count]);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.02;
  });
  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial color="#34F5A5" size={0.025} transparent opacity={0.55} />
    </points>
  );
}

export function ConsensusCanvas() {
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 50 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.6} />
      <pointLight position={[4, 4, 4]} color="#00D294" intensity={2.5} distance={14} />
      <Nodes />
      <Particles />
    </Canvas>
  );
}
