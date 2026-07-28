import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ParticleWave = () => {
  const pointsRef = useRef();
  
  // Create a grid of particles
  const count = 100;
  const separation = 0.2;
  
  const [positions, phases] = useMemo(() => {
    const positions = new Float32Array(count * count * 3);
    const phases = new Float32Array(count * count);
    
    let i = 0;
    let i3 = 0;
    for (let ix = 0; ix < count; ix++) {
      for (let iy = 0; iy < count; iy++) {
        positions[i3] = ix * separation - (count * separation) / 2; // x
        positions[i3 + 1] = 0; // y
        positions[i3 + 2] = iy * separation - (count * separation) / 2; // z
        
        phases[i] = Math.random() * Math.PI * 2;
        
        i++;
        i3 += 3;
      }
    }
    return [positions, phases];
  }, [count, separation]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const positions = pointsRef.current.geometry.attributes.position.array;
    
    let i = 0;
    let i3 = 0;
    for (let ix = 0; ix < count; ix++) {
      for (let iy = 0; iy < count; iy++) {
        // Complex wave math for organic feel
        const x = positions[i3];
        const z = positions[i3 + 2];
        
        const waveX = Math.sin(x * 0.5 + time * 0.5);
        const waveZ = Math.cos(z * 0.5 + time * 0.3);
        const noise = Math.sin(phases[i] + time * 0.8) * 0.1;
        
        positions[i3 + 1] = (waveX + waveZ) * 0.5 + noise;
        
        i++;
        i3 += 3;
      }
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    
    // Slow rotation
    pointsRef.current.rotation.y = time * 0.05;
    pointsRef.current.rotation.x = Math.sin(time * 0.1) * 0.1 + 0.2;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#ffffff"
        transparent
        opacity={0.4}
        sizeAttenuation={true}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default function Hero3DCanvas() {
  return (
    <div className="absolute inset-0 w-full h-full -z-10 bg-black">
      <Canvas
        camera={{ position: [0, 4, 10], fov: 45 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <fog attach="fog" args={['#000000', 5, 20]} />
        <ambientLight intensity={0.5} />
        <ParticleWave />
      </Canvas>
    </div>
  );
}
