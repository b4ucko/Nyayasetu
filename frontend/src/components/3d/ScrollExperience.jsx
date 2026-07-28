import React, { useRef, useLayoutEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, ScrollControls, Scroll, useScroll, Float, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Scale, ShieldCheck, ArrowRight } from 'lucide-react';

// Materials
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
  color: '#ffffff',
  roughness: 0.1,
  metalness: 0.0,
  clearcoat: 1.0,
  transmission: 0.2, // slight glass/marble feel
});

function Gavel(props) {
  const group = useRef();
  const scroll = useScroll();

  useFrame((state) => {
    // Scroll driven animations
    const offset = scroll.offset; // 0 to 1

    // Rotation
    group.current.rotation.y = THREE.MathUtils.lerp(0, Math.PI * 2, offset);
    group.current.rotation.x = THREE.MathUtils.lerp(0.2, -0.2, offset);
    group.current.rotation.z = THREE.MathUtils.lerp(-0.4, 0.4, offset);

    // Position
    // Start center right, move to left, then strike down
    const startX = 2;
    const endX = -2;
    group.current.position.x = THREE.MathUtils.lerp(startX, endX, offset);
    
    // Strike animation at the end
    if (offset > 0.8) {
      const strikeProgress = (offset - 0.8) * 5; // 0 to 1
      group.current.rotation.z -= Math.sin(strikeProgress * Math.PI) * 0.8;
      group.current.position.y = -Math.sin(strikeProgress * Math.PI) * 1.5;
    } else {
      group.current.position.y = THREE.MathUtils.lerp(1, -1, offset);
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

        {/* Head Ends (Mallet faces) */}
        <mesh material={woodMaterial} position={[1.1, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.4, 0.5, 0.4, 32]} />
        </mesh>
        <mesh material={woodMaterial} position={[-1.1, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.4, 0.5, 0.4, 32]} />
        </mesh>
        
        {/* Handle Gold Detail */}
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
    // Sounding block stays near the bottom, slowly moving up
    group.current.position.y = THREE.MathUtils.lerp(-5, -2, offset);
    group.current.position.x = THREE.MathUtils.lerp(0, -2, offset);
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

// Custom highly styled HTML pages that fade in/out based on scroll
function HtmlContent() {
  const navigate = useNavigate();
  
  return (
    <Scroll html style={{ width: '100%', height: '100%' }}>
      {/* Page 1: Hero */}
      <div className="w-screen h-screen flex flex-col justify-center px-10 md:px-32 relative text-slate-900 pointer-events-none">
        <div className="pointer-events-auto max-w-2xl">
          <h1 className="text-6xl md:text-8xl font-black font-serif tracking-tighter mb-6 leading-[0.9]">
            Justice.<br/>Redefined.
          </h1>
          <p className="text-xl md:text-2xl font-light text-slate-600 mb-10 max-w-xl">
            A premium digital advocate empowering citizens with scheme matching and legal intelligence.
          </p>
          <div className="flex gap-4">
            <button onClick={() => navigate('/schemes')} className="bg-slate-900 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-slate-800 transition-colors flex items-center gap-3">
              Explore Schemes <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Page 2: Features */}
      <div className="w-screen h-screen flex flex-col justify-center px-10 md:px-32 relative text-slate-900 pointer-events-none">
        <div className="pointer-events-auto max-w-xl ml-auto md:mr-32">
          <h2 className="text-5xl md:text-7xl font-bold font-serif mb-12">Total Mastery</h2>
          
          <div className="space-y-8">
            <div className="flex gap-6 group cursor-pointer" onClick={() => navigate('/notices')}>
              <div className="w-16 h-16 rounded-2xl bg-white shadow-xl flex items-center justify-center shrink-0 border border-slate-100 group-hover:scale-110 transition-transform">
                <Scale className="w-8 h-8 text-slate-900" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Legal Assessor</h3>
                <p className="text-slate-500 text-lg">Deconstruct complex court notices into actionable intelligence instantly.</p>
              </div>
            </div>
            
            <div className="flex gap-6 group cursor-pointer" onClick={() => navigate('/documents')}>
              <div className="w-16 h-16 rounded-2xl bg-white shadow-xl flex items-center justify-center shrink-0 border border-slate-100 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-8 h-8 text-slate-900" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Fraud Verifier</h3>
                <p className="text-slate-500 text-lg">Cryptographically authenticate state documents and certificates.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page 3: Call to action */}
      <div className="w-screen h-screen flex flex-col justify-center items-center text-center px-10 relative pointer-events-none">
        <div className="pointer-events-auto bg-white/80 backdrop-blur-xl p-16 rounded-[3rem] shadow-2xl border border-white max-w-4xl w-full">
          <h2 className="text-5xl md:text-7xl font-bold font-serif mb-8">Take Command</h2>
          <p className="text-2xl text-slate-600 mb-12 font-light">Join thousands of citizens asserting their rights.</p>
          <button onClick={() => navigate('/login')} className="bg-slate-900 text-white px-12 py-5 rounded-full text-xl font-bold hover:bg-slate-800 transition-all hover:scale-105 shadow-2xl">
            Create Free Profile
          </button>
        </div>
      </div>
    </Scroll>
  );
}

export default function ScrollExperience() {
  return (
    <div className="w-full h-screen bg-[#F4F4F6] overflow-hidden">
      <Canvas
        shadows
        camera={{ position: [0, 0, 10], fov: 45 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <color attach="background" args={['#F4F4F6']} />
        
        <ambientLight intensity={1} />
        <directionalLight 
          castShadow 
          position={[5, 10, 5]} 
          intensity={2} 
          shadow-mapSize={[2048, 2048]} 
        />
        <spotLight position={[-5, 5, 5]} intensity={1} angle={0.5} penumbra={1} />

        {/* High-end environment reflections */}
        <Environment preset="studio" background={false}>
           <Lightformer form="rect" intensity={5} position={[0, 5, -10]} scale={[10, 10, 1]} target={[0,0,0]} />
           <Lightformer form="rect" intensity={2} position={[-10, 5, 0]} scale={[10, 10, 1]} target={[0,0,0]} />
        </Environment>

        <ScrollControls pages={3} damping={0.1}>
          {/* 3D Objects */}
          <Scroll>
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
