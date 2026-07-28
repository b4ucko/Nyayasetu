import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, ScrollControls, Scroll, useScroll, Float, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';
import { Scale, ShieldCheck, ArrowRight } from 'lucide-react';

// --- Premium Materials ---
const woodMaterial = new THREE.MeshPhysicalMaterial({
  color: '#2a1a10',
  roughness: 0.15,
  metalness: 0.1,
  clearcoat: 1.0,
  clearcoatRoughness: 0.1,
});

const goldMaterial = new THREE.MeshPhysicalMaterial({
  color: '#ffd700',
  roughness: 0.2,
  metalness: 1.0,
  clearcoat: 0.5,
});

const marbleMaterial = new THREE.MeshPhysicalMaterial({
  color: '#f0f0f0',
  roughness: 0.3,
  metalness: 0.05,
  clearcoat: 0.1,
});

const paperMaterial = new THREE.MeshPhysicalMaterial({
  color: '#ffffff',
  roughness: 0.8,
  metalness: 0.0,
  transmission: 0.1,
  transparent: true,
  opacity: 0.9,
});

// --- 3D Components ---

function CourthousePillars() {
  const group = useRef();
  const scroll = useScroll();

  useFrame(() => {
    // Parallax effect: moving up as user scrolls down
    group.current.position.y = THREE.MathUtils.lerp(0, 10, scroll.offset);
  });

  return (
    <group ref={group}>
      {/* Pushed far out to frame the scene, not block the text */}
      <mesh material={marbleMaterial} position={[-7, -5, 2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.8, 0.8, 20, 32]} />
      </mesh>
      <mesh material={marbleMaterial} position={[7, -5, 2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.8, 0.8, 20, 32]} />
      </mesh>
      
      {/* Background Pillars */}
      <mesh material={marbleMaterial} position={[-12, -5, -8]} castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 1.5, 30, 32]} />
      </mesh>
      <mesh material={marbleMaterial} position={[12, -5, -8]} castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 1.5, 30, 32]} />
      </mesh>
    </group>
  );
}

function FloatingDocuments() {
  const group = useRef();
  const scroll = useScroll();

  // Create documents further back and wider so they don't clip the center text
  const docs = useMemo(() => {
    return Array.from({ length: 15 }).map(() => ({
      position: [
        (Math.random() - 0.5) * 20, // Wider spread
        (Math.random() - 0.5) * 20,
        -5 - Math.random() * 10 // Pushed back further
      ],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
      speed: Math.random() * 2 + 1
    }));
  }, []);

  useFrame(() => {
    const offset = scroll.offset;
    group.current.rotation.y = offset * Math.PI * 0.5;
    group.current.position.y = offset * 5;

    group.current.children.forEach((child, i) => {
      child.rotation.x += 0.002 * docs[i].speed;
      child.rotation.y += 0.003 * docs[i].speed;
    });
  });

  return (
    <group ref={group}>
      {docs.map((doc, i) => (
        <group key={i} position={doc.position} rotation={doc.rotation}>
          <mesh material={paperMaterial} castShadow receiveShadow>
            <boxGeometry args={[1.5, 2.1, 0.02]} />
          </mesh>
          <mesh material={woodMaterial} position={[0, 0.5, 0.015]}>
            <boxGeometry args={[1.0, 0.05, 0.01]} />
          </mesh>
          <mesh material={woodMaterial} position={[0, 0.3, 0.015]}>
            <boxGeometry args={[1.2, 0.05, 0.01]} />
          </mesh>
          <mesh material={woodMaterial} position={[0, 0.1, 0.015]}>
            <boxGeometry args={[0.8, 0.05, 0.01]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function ScalesOfJustice() {
  const group = useRef();
  const beam = useRef();
  const scroll = useScroll();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const offset = scroll.offset;

    // The Scales should be prominent on Page 2 (offset ~0.5), positioned on the LEFT 
    // to balance the text on the RIGHT.
    // Start deep background right, move to mid-ground left.
    group.current.position.x = THREE.MathUtils.lerp(5, -4, offset * 2);
    group.current.position.z = THREE.MathUtils.lerp(-20, -8, offset);
    group.current.position.y = THREE.MathUtils.lerp(5, -2, offset);
    
    // Tipping motion
    beam.current.rotation.z = Math.sin(time * 0.5) * 0.1 + (offset * 0.2);
  });

  return (
    <group ref={group} position={[5, 5, -20]}>
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.5}>
        {/* Base and Pillar */}
        <mesh material={goldMaterial} position={[0, -3, 0]} castShadow>
          <cylinderGeometry args={[1, 1.2, 0.5, 32]} />
        </mesh>
        <mesh material={goldMaterial} position={[0, -0.5, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.15, 5, 32]} />
        </mesh>
        
        {/* Tilting Beam */}
        <group ref={beam} position={[0, 2, 0]}>
          <mesh material={goldMaterial} castShadow>
             <cylinderGeometry args={[0.05, 0.05, 6, 32]} rotation={[0, 0, Math.PI / 2]} />
          </mesh>
          
          {/* Left Pan */}
          <group position={[-2.8, 0, 0]}>
            <mesh material={goldMaterial} position={[0, -2, 0]} castShadow>
              <cylinderGeometry args={[1, 1, 0.1, 32]} />
            </mesh>
            <mesh material={goldMaterial} position={[-0.9, -1, 0]} rotation={[0, 0, -0.4]}>
               <cylinderGeometry args={[0.01, 0.01, 2.2, 8]} />
            </mesh>
            <mesh material={goldMaterial} position={[0.9, -1, 0]} rotation={[0, 0, 0.4]}>
               <cylinderGeometry args={[0.01, 0.01, 2.2, 8]} />
            </mesh>
          </group>

          {/* Right Pan */}
          <group position={[2.8, 0, 0]}>
            <mesh material={goldMaterial} position={[0, -2, 0]} castShadow>
              <cylinderGeometry args={[1, 1, 0.1, 32]} />
            </mesh>
            <mesh material={goldMaterial} position={[-0.9, -1, 0]} rotation={[0, 0, -0.4]}>
               <cylinderGeometry args={[0.01, 0.01, 2.2, 8]} />
            </mesh>
            <mesh material={goldMaterial} position={[0.9, -1, 0]} rotation={[0, 0, 0.4]}>
               <cylinderGeometry args={[0.01, 0.01, 2.2, 8]} />
            </mesh>
          </group>
        </group>
      </Float>
    </group>
  );
}

function Gavel(props) {
  const group = useRef();
  const scroll = useScroll();

  useFrame(() => {
    const offset = scroll.offset; 

    // Rotation
    group.current.rotation.y = THREE.MathUtils.lerp(0, Math.PI * 2, offset);
    group.current.rotation.x = THREE.MathUtils.lerp(0.2, -0.2, offset);
    group.current.rotation.z = THREE.MathUtils.lerp(-0.4, 0.2, offset);

    // Choreographed Positions:
    // Page 1 (offset 0): Center, slightly below text
    // Page 2 (offset 0.5): Move to Left side (x = -3, y = 1) to balance right-aligned text
    // Page 3 (offset 1): Move back to Center (x = 0, y = -1.5) for the strike

    if (offset < 0.5) {
      // Transition from Page 1 to Page 2
      const localOffset = offset * 2; // 0 to 1
      group.current.position.x = THREE.MathUtils.lerp(0, -3.5, localOffset);
      group.current.position.y = THREE.MathUtils.lerp(-2.5, 0.5, localOffset);
      group.current.position.z = THREE.MathUtils.lerp(0, 2, localOffset);
    } else {
      // Transition from Page 2 to Page 3
      const localOffset = (offset - 0.5) * 2; // 0 to 1
      group.current.position.x = THREE.MathUtils.lerp(-3.5, 0, localOffset);
      group.current.position.z = THREE.MathUtils.lerp(2, 0, localOffset);
      
      // Strike animation at the very end
      if (localOffset > 0.8) {
        const strikeProgress = (localOffset - 0.8) * 5; // 0 to 1
        group.current.rotation.z -= Math.sin(strikeProgress * Math.PI) * 1.0;
        group.current.position.y = THREE.MathUtils.lerp(0.5, -2, 0.8) - Math.sin(strikeProgress * Math.PI) * 1.5;
      } else {
        group.current.position.y = THREE.MathUtils.lerp(0.5, -2, localOffset);
      }
    }
  });

  return (
    <group ref={group} {...props} dispose={null}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        {/* Handle */}
        <mesh material={woodMaterial} position={[0, -2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.15, 0.2, 4, 32]} />
        </mesh>
        {/* Head Base */}
        <mesh material={woodMaterial} position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
          <cylinderGeometry args={[0.5, 0.5, 2, 32]} />
        </mesh>
        {/* Gold Bands */}
        <mesh material={goldMaterial} position={[0.8, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.55, 0.55, 0.2, 32]} />
        </mesh>
        <mesh material={goldMaterial} position={[-0.8, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.55, 0.55, 0.2, 32]} />
        </mesh>
        {/* Head Ends */}
        <mesh material={woodMaterial} position={[1.1, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.4, 0.5, 0.4, 32]} />
        </mesh>
        <mesh material={woodMaterial} position={[-1.1, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.4, 0.5, 0.4, 32]} />
        </mesh>
        {/* Handle Detail */}
        <mesh material={goldMaterial} position={[0, -0.5, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.3, 32]} />
        </mesh>
        <mesh material={goldMaterial} position={[0, -3.5, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.25, 0.5, 32]} />
        </mesh>
      </Float>
    </group>
  );
}

function SoundingBlock(props) {
  const group = useRef();
  const scroll = useScroll();

  useFrame(() => {
    const offset = scroll.offset;
    // Block waits below, rises up to center to catch the strike at the end
    group.current.position.y = THREE.MathUtils.lerp(-10, -3.5, offset); 
    group.current.position.x = THREE.MathUtils.lerp(0, 0, offset); // Stay center
  });

  return (
    <group ref={group} {...props} dispose={null}>
      <mesh material={woodMaterial} position={[0, -0.2, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[2, 2.2, 0.4, 64]} />
      </mesh>
      <mesh material={goldMaterial} position={[0, 0.05, 0]}>
        <cylinderGeometry args={[1.8, 1.8, 0.1, 64]} />
      </mesh>
    </group>
  );
}

// --- HTML Content Overlay ---
function HtmlContent() {
  const navigate = useNavigate();
  
  return (
    <Scroll html style={{ width: '100%', height: '100%' }}>
      {/* Page 1: Hero (Centered) */}
      <div className="w-screen h-screen flex flex-col justify-center items-center text-center px-10 relative pointer-events-none">
        {/* Adjusted padding/margin so it sits nicely above the Gavel (which is at y=-2.5) */}
        <div className="pointer-events-auto bg-white/40 backdrop-blur-md p-8 rounded-3xl border border-white/60 shadow-2xl max-w-3xl -mt-32">
          <h1 className="text-5xl md:text-7xl font-black font-serif text-slate-900 tracking-tighter mb-6 leading-tight">
            Justice. Redefined.
          </h1>
          <p className="text-xl md:text-2xl font-medium text-slate-800 mb-8">
            A premium digital advocate empowering citizens with scheme matching and legal intelligence.
          </p>
          <div className="flex justify-center">
            <button onClick={() => navigate('/schemes')} className="bg-slate-900 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-slate-800 transition-colors flex items-center gap-3 shadow-xl">
              Explore Schemes <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Page 2: Features (Right Aligned to balance Left-side 3D objects) */}
      <div className="w-screen h-screen flex flex-col justify-center px-10 md:px-32 relative pointer-events-none">
        <div className="pointer-events-auto max-w-xl ml-auto md:mr-16 bg-white/40 backdrop-blur-xl p-10 rounded-3xl border border-white/60 shadow-2xl">
          <h2 className="text-4xl md:text-6xl font-bold font-serif text-slate-900 mb-10">Total Mastery</h2>
          
          <div className="space-y-8">
            <div className="flex gap-6 group cursor-pointer" onClick={() => navigate('/notices')}>
              <div className="w-14 h-14 rounded-2xl bg-slate-900 shadow-xl flex items-center justify-center shrink-0 border border-slate-700 group-hover:scale-110 transition-transform">
                <Scale className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">Legal Assessor</h3>
                <p className="text-slate-700 font-medium">Deconstruct complex court notices into actionable intelligence instantly.</p>
              </div>
            </div>
            
            <div className="flex gap-6 group cursor-pointer" onClick={() => navigate('/documents')}>
              <div className="w-14 h-14 rounded-2xl bg-slate-900 shadow-xl flex items-center justify-center shrink-0 border border-slate-700 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">Fraud Verifier</h3>
                <p className="text-slate-700 font-medium">Cryptographically authenticate state documents and certificates.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page 3: Call to action (Centered, sits above the striking gavel) */}
      <div className="w-screen h-screen flex flex-col justify-center items-center text-center px-10 relative pointer-events-none">
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-2xl p-16 rounded-[3rem] shadow-2xl border border-slate-700 max-w-4xl w-full -mt-48">
          <h2 className="text-5xl md:text-6xl font-bold font-serif text-white mb-6">Take Command</h2>
          <p className="text-xl text-slate-300 mb-10 font-light">Join thousands of citizens asserting their rights.</p>
          <button onClick={() => navigate('/login')} className="bg-white text-slate-900 px-10 py-4 rounded-full text-xl font-bold hover:bg-slate-100 transition-all hover:scale-105 shadow-2xl">
            Create Free Profile
          </button>
        </div>
      </div>
    </Scroll>
  );
}

export default function ScrollExperience() {
  return (
    <div className="w-full h-screen bg-[#F0F2F5] overflow-hidden">
      <Canvas
        shadows
        camera={{ position: [0, 0, 10], fov: 45 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <color attach="background" args={['#F0F2F5']} />
        <fog attach="fog" args={['#F0F2F5', 10, 40]} />
        
        <ambientLight intensity={1.5} />
        <directionalLight 
          castShadow 
          position={[10, 20, 15]} 
          intensity={2.5} 
          shadow-mapSize={[2048, 2048]} 
        />
        <spotLight position={[-10, 10, 10]} intensity={1.5} angle={0.4} penumbra={1} castShadow />

        {/* High-end environment reflections */}
        <Environment preset="city" background={false}>
           <Lightformer form="rect" intensity={5} position={[0, 5, -10]} scale={[10, 10, 1]} target={[0,0,0]} />
           <Lightformer form="rect" intensity={2} position={[-10, 5, 0]} scale={[10, 10, 1]} target={[0,0,0]} />
           <Lightformer form="ring" intensity={3} position={[10, 5, 0]} scale={[10, 10, 1]} target={[0,0,0]} />
        </Environment>

        <ScrollControls pages={3} damping={0.1}>
          {/* Parallax / Environment Objects */}
          <Scroll>
            <CourthousePillars />
            <ScalesOfJustice />
            <FloatingDocuments />
            
            {/* The main interactive focal points */}
            <Gavel />
            <SoundingBlock />
          </Scroll>

          {/* HTML Overlay */}
          <HtmlContent />
        </ScrollControls>
      </Canvas>
    </div>
  );
}
