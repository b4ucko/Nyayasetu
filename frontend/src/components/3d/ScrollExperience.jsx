import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, ScrollControls, Scroll, useScroll, Float, Lightformer, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Scale, ShieldCheck, ArrowRight } from 'lucide-react';

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
    // Pillars move up rapidly as we scroll to give a sense of falling/descending
    group.current.position.y = THREE.MathUtils.lerp(0, 15, scroll.offset);
  });

  return (
    <group ref={group}>
      {/* Foreground Left */}
      <mesh material={marbleMaterial} position={[-4, -5, 5]} castShadow receiveShadow>
        <cylinderGeometry args={[0.8, 0.8, 20, 32]} />
      </mesh>
      {/* Foreground Right */}
      <mesh material={marbleMaterial} position={[4, -5, 5]} castShadow receiveShadow>
        <cylinderGeometry args={[0.8, 0.8, 20, 32]} />
      </mesh>
      {/* Background Left */}
      <mesh material={marbleMaterial} position={[-8, -5, -10]} castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 1.5, 30, 32]} />
      </mesh>
      {/* Background Right */}
      <mesh material={marbleMaterial} position={[8, -5, -10]} castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 1.5, 30, 32]} />
      </mesh>
    </group>
  );
}

function FloatingDocuments() {
  const group = useRef();
  const scroll = useScroll();

  // Create random documents
  const docs = useMemo(() => {
    return Array.from({ length: 12 }).map(() => ({
      position: [
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 10 - 5
      ],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
      speed: Math.random() * 2 + 1
    }));
  }, []);

  useFrame((state) => {
    const offset = scroll.offset;
    
    // Rotate the whole storm of documents based on scroll
    group.current.rotation.y = offset * Math.PI;
    group.current.position.y = offset * 5;

    // Individually wobble them
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
          {/* Abstract Text Lines on the document */}
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

    // Bring scales forward and fade them down on scroll
    group.current.position.z = THREE.MathUtils.lerp(-15, -5, offset);
    group.current.position.y = THREE.MathUtils.lerp(3, -5, offset);
    
    // Slowly tip the scales based on scroll to signify balancing justice
    beam.current.rotation.z = Math.sin(time * 0.5) * 0.1 + (offset * 0.5);
  });

  return (
    <group ref={group} position={[0, 3, -15]}>
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
            {/* Strings */}
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
            {/* Strings */}
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

    // Complex rotation
    group.current.rotation.y = THREE.MathUtils.lerp(0, Math.PI * 2.5, offset);
    group.current.rotation.x = THREE.MathUtils.lerp(0.2, -0.4, offset);
    group.current.rotation.z = THREE.MathUtils.lerp(-0.4, 0.6, offset);

    // Gavel weaves through the pillars
    const startX = 3;
    const endX = -3;
    group.current.position.x = THREE.MathUtils.lerp(startX, endX, offset);
    
    // Strike animation at the end
    if (offset > 0.8) {
      const strikeProgress = (offset - 0.8) * 5; 
      group.current.rotation.z -= Math.sin(strikeProgress * Math.PI) * 1.2;
      group.current.position.y = -Math.sin(strikeProgress * Math.PI) * 2;
    } else {
      // Bob up and down while traversing
      group.current.position.y = Math.sin(offset * Math.PI * 2) * 1.5;
    }
  });

  return (
    <group ref={group} {...props} dispose={null}>
      <Float speed={3} rotationIntensity={0.5} floatIntensity={1}>
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
    group.current.position.y = THREE.MathUtils.lerp(-8, -2.5, offset); // Rises up to catch the strike
    group.current.position.x = THREE.MathUtils.lerp(0, -3, offset);
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
      {/* Page 1: Hero */}
      <div className="w-screen h-screen flex flex-col justify-center px-10 md:px-32 relative pointer-events-none">
        <div className="pointer-events-auto max-w-2xl bg-white/20 backdrop-blur-md p-8 rounded-3xl border border-white/50 shadow-2xl">
          <h1 className="text-6xl md:text-8xl font-black font-serif text-slate-900 tracking-tighter mb-6 leading-[0.9]">
            Justice.<br/>Redefined.
          </h1>
          <p className="text-xl md:text-2xl font-medium text-slate-800 mb-10 max-w-xl">
            A premium digital advocate empowering citizens with scheme matching and legal intelligence.
          </p>
          <div className="flex gap-4">
            <button onClick={() => navigate('/schemes')} className="bg-slate-900 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-slate-800 transition-colors flex items-center gap-3 shadow-xl">
              Explore Schemes <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Page 2: Features */}
      <div className="w-screen h-screen flex flex-col justify-center px-10 md:px-32 relative pointer-events-none">
        <div className="pointer-events-auto max-w-xl ml-auto md:mr-32 bg-white/30 backdrop-blur-lg p-10 rounded-3xl border border-white/60 shadow-2xl">
          <h2 className="text-5xl md:text-7xl font-bold font-serif text-slate-900 mb-12">Total Mastery</h2>
          
          <div className="space-y-8">
            <div className="flex gap-6 group cursor-pointer" onClick={() => navigate('/notices')}>
              <div className="w-16 h-16 rounded-2xl bg-slate-900 shadow-xl flex items-center justify-center shrink-0 border border-slate-700 group-hover:scale-110 transition-transform">
                <Scale className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Legal Assessor</h3>
                <p className="text-slate-700 text-lg font-medium">Deconstruct complex court notices into actionable intelligence instantly.</p>
              </div>
            </div>
            
            <div className="flex gap-6 group cursor-pointer" onClick={() => navigate('/documents')}>
              <div className="w-16 h-16 rounded-2xl bg-slate-900 shadow-xl flex items-center justify-center shrink-0 border border-slate-700 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Fraud Verifier</h3>
                <p className="text-slate-700 text-lg font-medium">Cryptographically authenticate state documents and certificates.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page 3: Call to action */}
      <div className="w-screen h-screen flex flex-col justify-center items-center text-center px-10 relative pointer-events-none">
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-2xl p-16 rounded-[3rem] shadow-2xl border border-slate-700 max-w-4xl w-full">
          <h2 className="text-5xl md:text-7xl font-bold font-serif text-white mb-8">Take Command</h2>
          <p className="text-2xl text-slate-300 mb-12 font-light">Join thousands of citizens asserting their rights.</p>
          <button onClick={() => navigate('/login')} className="bg-white text-slate-900 px-12 py-5 rounded-full text-xl font-bold hover:bg-slate-100 transition-all hover:scale-105 shadow-2xl">
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
