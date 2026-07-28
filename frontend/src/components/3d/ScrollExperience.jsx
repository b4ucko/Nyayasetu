import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, ScrollControls, Scroll, useScroll, Float, ContactShadows, SpotLight } from '@react-three/drei';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Scale, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

// --- TRUE 3D Materials (High Contrast & PBR) ---
const leatherMaterial = new THREE.MeshStandardMaterial({
  color: '#3d1c04', // Deep leather brown
  roughness: 0.6,
  metalness: 0.1,
  bumpScale: 0.02,
});

const paperMaterial = new THREE.MeshStandardMaterial({
  color: '#fdfbf7', // Off-white antique paper
  roughness: 0.9,
  metalness: 0.0,
  side: THREE.DoubleSide,
});

const woodMaterial = new THREE.MeshStandardMaterial({
  color: '#2a1a10',
  roughness: 0.3,
  metalness: 0.1,
});

const goldMaterial = new THREE.MeshStandardMaterial({
  color: '#ffbf00',
  roughness: 0.15,
  metalness: 0.95,
});

const brassMaterial = new THREE.MeshStandardMaterial({
  color: '#d4af37',
  roughness: 0.2,
  metalness: 0.8,
});

const waxRedMaterial = new THREE.MeshStandardMaterial({
  color: '#990000',
  roughness: 0.4,
  metalness: 0.2,
});

const steelMaterial = new THREE.MeshStandardMaterial({
  color: '#94a3b8',
  roughness: 0.2,
  metalness: 0.9,
});

const emeraldGlowMaterial = new THREE.MeshStandardMaterial({
  color: '#10b981',
  emissive: '#059669',
  emissiveIntensity: 0.6,
  roughness: 0.2,
  metalness: 0.5,
});


// --- 1. Flipping Law Book Component ---
function LawBook() {
  const group = useRef();
  const pagesGroup = useRef();
  const scroll = useScroll();

  const numPages = 15;
  const pages = useMemo(() => {
    return Array.from({ length: numPages }).map((_, i) => ({
      id: i,
      targetRotation: Math.PI - 0.1
    }));
  }, [numPages]);

  const pageRefs = useRef([]);

  useFrame(() => {
    const offset = scroll.offset; // 0 to 1

    // Book positioning: Starts bottom right, floats up and rotates open
    group.current.position.x = THREE.MathUtils.lerp(3.5, -4.5, offset);
    group.current.position.y = THREE.MathUtils.lerp(-3.5, 1.5, offset);
    group.current.position.z = THREE.MathUtils.lerp(0, -2, offset);
    
    // Book rotation
    group.current.rotation.x = THREE.MathUtils.lerp(0.5, 0.2, offset);
    group.current.rotation.y = THREE.MathUtils.lerp(-0.5, 0.5, offset);
    group.current.rotation.z = THREE.MathUtils.lerp(0, -0.1, offset);

    // Flipping pages logic
    const flipProgress = offset * 2.2;
    
    pageRefs.current.forEach((page, i) => {
      if (!page) return;
      const threshold = (i / numPages);
      if (flipProgress > threshold) {
        page.rotation.y = THREE.MathUtils.lerp(page.rotation.y, Math.PI - 0.05 * i, 0.1);
      } else {
        page.rotation.y = THREE.MathUtils.lerp(page.rotation.y, 0.05 * i, 0.1);
      }
    });
  });

  return (
    <group ref={group}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        {/* Book Back Cover */}
        <mesh material={leatherMaterial} position={[0, -0.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.2, 0.2, 4.2]} />
        </mesh>
        
        {/* Spine */}
        <mesh material={leatherMaterial} position={[-1.6, 0.3, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
          <cylinderGeometry args={[0.4, 0.4, 4.2, 16, 1, false, 0, Math.PI]} />
        </mesh>

        {/* Flipping Pages */}
        <group ref={pagesGroup} position={[-1.5, 0.1, 0]}>
          {pages.map((p, i) => (
            <group key={p.id} ref={el => pageRefs.current[i] = el}>
              <mesh material={paperMaterial} position={[1.5, 0, 0]} castShadow receiveShadow>
                <boxGeometry args={[3.0, 0.02, 4.0]} />
              </mesh>
            </group>
          ))}
          <mesh material={paperMaterial} position={[1.5, 0.2, 0]} castShadow receiveShadow>
             <boxGeometry args={[2.9, 0.4, 3.9]} />
          </mesh>
        </group>
        
        {/* Front Cover */}
        <group position={[-1.5, 0.7, 0]} rotation={[0, 0, -0.1]}>
          <mesh material={leatherMaterial} position={[1.6, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[3.2, 0.1, 4.2]} />
          </mesh>
          <mesh material={goldMaterial} position={[1.6, 0.06, 0]} castShadow>
             <boxGeometry args={[2.8, 0.02, 3.8]} />
          </mesh>
        </group>
      </Float>
    </group>
  );
}


// --- 2. Scales of Justice Component ---
function ScalesOfJustice() {
  const group = useRef();
  const beam = useRef();
  const scroll = useScroll();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const offset = scroll.offset;

    // Starts top right, floats into feature area
    group.current.position.x = THREE.MathUtils.lerp(-7, 5.2, offset);
    group.current.position.y = THREE.MathUtils.lerp(4, 0.5, offset);
    group.current.position.z = THREE.MathUtils.lerp(-8, -4, offset);
    
    group.current.rotation.y = THREE.MathUtils.lerp(0, -Math.PI / 3, offset);
    
    // Tipping motion
    beam.current.rotation.z = Math.sin(time * 0.8) * 0.15;
  });

  return (
    <group ref={group}>
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.5}>
        <mesh material={goldMaterial} position={[0, -3, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1, 1.2, 0.5, 32]} />
        </mesh>
        <mesh material={goldMaterial} position={[0, -0.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.1, 0.2, 5, 32]} />
        </mesh>
        
        <group ref={beam} position={[0, 2, 0]}>
          <mesh material={goldMaterial} castShadow receiveShadow>
             <cylinderGeometry args={[0.1, 0.1, 6, 32]} rotation={[0, 0, Math.PI / 2]} />
          </mesh>
          
          <group position={[-2.8, 0, 0]}>
            <mesh material={goldMaterial} position={[0, -2, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[1, 1, 0.1, 32]} />
            </mesh>
            <mesh material={goldMaterial} position={[-0.9, -1, 0]} rotation={[0, 0, -0.4]} castShadow>
               <cylinderGeometry args={[0.02, 0.02, 2.2, 8]} />
            </mesh>
            <mesh material={goldMaterial} position={[0.9, -1, 0]} rotation={[0, 0, 0.4]} castShadow>
               <cylinderGeometry args={[0.02, 0.02, 2.2, 8]} />
            </mesh>
          </group>

          <group position={[2.8, 0, 0]}>
            <mesh material={goldMaterial} position={[0, -2, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[1, 1, 0.1, 32]} />
            </mesh>
            <mesh material={goldMaterial} position={[-0.9, -1, 0]} rotation={[0, 0, -0.4]} castShadow>
               <cylinderGeometry args={[0.02, 0.02, 2.2, 8]} />
            </mesh>
            <mesh material={goldMaterial} position={[0.9, -1, 0]} rotation={[0, 0, 0.4]} castShadow>
               <cylinderGeometry args={[0.02, 0.02, 2.2, 8]} />
            </mesh>
          </group>
        </group>
      </Float>
    </group>
  );
}


// --- 3. NEW UNIQUE OBJECT: Stamping Wax Seal (Presses Down on Scroll) ---
function StampingWaxSeal() {
  const group = useRef();
  const stampHandle = useRef();
  const waxEmblem = useRef();
  const scroll = useScroll();

  useFrame((state) => {
    const offset = scroll.offset; // 0 to 1
    const time = state.clock.getElapsedTime();

    // Activates in middle section (offset 0.25 to 0.65)
    // Moves from right margin into view
    group.current.position.x = THREE.MathUtils.lerp(6, -5.5, offset);
    group.current.position.y = THREE.MathUtils.lerp(-6, -1, offset);
    group.current.position.z = THREE.MathUtils.lerp(-5, -2, offset);
    group.current.rotation.y = THREE.MathUtils.lerp(0.2, 0.6, offset);

    // Stamping animation curve: descends, presses hard, then lifts slightly
    const stampProgress = THREE.MathUtils.clamp((offset - 0.25) * 3, 0, 1);
    
    if (stampProgress > 0 && stampProgress < 0.8) {
      // Descends and stamps onto document
      stampHandle.current.position.y = THREE.MathUtils.lerp(3.5, 0.35, stampProgress * 1.25);
    } else if (stampProgress >= 0.8) {
      // Lifts back up slightly after stamping
      stampHandle.current.position.y = THREE.MathUtils.lerp(0.35, 1.2, (stampProgress - 0.8) * 5);
    }

    // Reveal glowing seal badge after stamp strikes
    if (stampProgress > 0.5) {
      waxEmblem.current.scale.x = THREE.MathUtils.lerp(waxEmblem.current.scale.x, 1, 0.1);
      waxEmblem.current.scale.y = THREE.MathUtils.lerp(waxEmblem.current.scale.y, 1, 0.1);
      waxEmblem.current.scale.z = THREE.MathUtils.lerp(waxEmblem.current.scale.z, 1, 0.1);
      waxEmblem.current.rotation.z = time * 0.5; // rotates smoothly once stamped!
    } else {
      waxEmblem.current.scale.set(0.01, 0.01, 0.01);
    }
  });

  return (
    <group ref={group}>
      <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.3}>
        {/* Floating Certificate Plate */}
        <mesh material={paperMaterial} position={[0, -0.05, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.5, 0.1, 4.5]} />
        </mesh>
        
        {/* Certificate Header Ribbons */}
        <mesh material={goldMaterial} position={[0, 0.01, -1.8]} castShadow>
          <boxGeometry args={[3.0, 0.02, 0.4]} />
        </mesh>

        {/* Stamped Wax Seal Emblem (Revealed on Stamp) */}
        <group ref={waxEmblem} position={[0, 0.08, 0.8]} scale={[0.01, 0.01, 0.01]}>
          <mesh material={waxRedMaterial} castShadow>
             <cylinderGeometry args={[0.9, 0.9, 0.12, 32]} />
          </mesh>
          <mesh material={goldMaterial} position={[0, 0.08, 0]} castShadow>
             <cylinderGeometry args={[0.7, 0.7, 0.05, 32]} />
          </mesh>
          {/* Star symbol inside seal */}
          <mesh material={emeraldGlowMaterial} position={[0, 0.12, 0]} castShadow>
             <boxGeometry args={[0.4, 0.05, 0.4]} />
          </mesh>
        </group>

        {/* The Stamp Handle (Descends on Scroll) */}
        <group ref={stampHandle} position={[0, 3.5, 0.8]}>
          {/* Handle Knob */}
          <mesh material={woodMaterial} position={[0, 2.2, 0]} castShadow>
            <sphereGeometry args={[0.6, 32, 32]} />
          </mesh>
          {/* Stem */}
          <mesh material={woodMaterial} position={[0, 1.2, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.45, 1.4, 32]} />
          </mesh>
          {/* Brass Metal Base Stamp Head */}
          <mesh material={brassMaterial} position={[0, 0.3, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.85, 0.95, 0.5, 32]} />
          </mesh>
        </group>
      </Float>
    </group>
  );
}


// --- 4. NEW UNIQUE OBJECT: Unlocking Security Key & Padlock (Unlocks on Scroll) ---
function UnlockingPadlock() {
  const group = useRef();
  const shackle = useRef();
  const key = useRef();
  const glowRing = useRef();
  const scroll = useScroll();

  useFrame((state) => {
    const offset = scroll.offset; // 0 to 1
    const time = state.clock.getElapsedTime();

    // Activates in bottom section (How it Works / Security - offset 0.55 to 0.95)
    group.current.position.x = THREE.MathUtils.lerp(-6, 4.5, offset);
    group.current.position.y = THREE.MathUtils.lerp(-4, -0.5, offset);
    group.current.position.z = THREE.MathUtils.lerp(-6, -2, offset);
    
    group.current.rotation.y = THREE.MathUtils.lerp(-0.4, 0.3, offset);

    // Unlocking sequence trigger: offset > 0.7
    const unlockProgress = THREE.MathUtils.clamp((offset - 0.65) * 3.5, 0, 1);

    // 1. Key slides forward into keyhole
    key.current.position.z = THREE.MathUtils.lerp(3.0, 0.6, unlockProgress);

    // 2. Key turns 90 degrees
    key.current.rotation.z = THREE.MathUtils.lerp(0, Math.PI / 2, unlockProgress);

    // 3. Shackle pops open vertically!
    shackle.current.position.y = THREE.MathUtils.lerp(1.4, 2.2, unlockProgress);
    shackle.current.rotation.y = THREE.MathUtils.lerp(0, 0.5, unlockProgress);

    // 4. Glow ring rotates when fully unlocked
    if (unlockProgress > 0.8) {
      glowRing.current.scale.set(1.1 + Math.sin(time * 3) * 0.1, 1.1 + Math.sin(time * 3) * 0.1, 1.1);
    } else {
      glowRing.current.scale.set(0.01, 0.01, 0.01);
    }
  });

  return (
    <group ref={group}>
      <Float speed={1.5} rotationIntensity={0.15} floatIntensity={0.4}>
        
        {/* Padlock Base Body */}
        <mesh material={goldMaterial} position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.4, 2.2, 1.0]} />
        </mesh>
        
        {/* Keyhole Plate */}
        <mesh material={steelMaterial} position={[0, -0.2, 0.51]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.05, 32]} rotation={[Math.PI / 2, 0, 0]} />
        </mesh>

        {/* Dynamic Unlocking Shackle (Pops up on scroll) */}
        <group ref={shackle} position={[0, 1.4, 0]}>
          {/* U-shaped arch shackle built with torus / cylinders */}
          <mesh material={steelMaterial} position={[0, 0.6, 0]} rotation={[0, 0, 0]} castShadow>
             <torusGeometry args={[0.75, 0.18, 16, 32, Math.PI]} />
          </mesh>
          <mesh material={steelMaterial} position={[-0.75, 0, 0]} castShadow>
             <cylinderGeometry args={[0.18, 0.18, 1.2, 16]} />
          </mesh>
          <mesh material={steelMaterial} position={[0.75, 0, 0]} castShadow>
             <cylinderGeometry args={[0.18, 0.18, 1.2, 16]} />
          </mesh>
        </group>

        {/* 3D Golden Key (Enters and Turns on Scroll) */}
        <group ref={key} position={[0, -0.2, 3.0]}>
          {/* Key Bow / Ring */}
          <mesh material={brassMaterial} position={[0, 0, 1.2]} castShadow>
             <torusGeometry args={[0.4, 0.1, 16, 32]} />
          </mesh>
          {/* Key Shaft */}
          <mesh material={brassMaterial} position={[0, 0, 0.5]} rotation={[Math.PI / 2, 0, 0]} castShadow>
             <cylinderGeometry args={[0.08, 0.08, 1.2, 16]} />
          </mesh>
          {/* Key Bit (Notches) */}
          <mesh material={brassMaterial} position={[0.15, -0.1, 0.1]} castShadow>
             <boxGeometry args={[0.25, 0.2, 0.3]} />
          </mesh>
        </group>

        {/* Security Verified Emerald Glow Aura (Flares when unlocked) */}
        <mesh ref={glowRing} position={[0, 0, -0.1]}>
          <torusGeometry args={[1.6, 0.05, 16, 32]} />
          <meshBasicMaterial color="#10b981" />
        </mesh>

      </Float>
    </group>
  );
}


// --- HTML Content Overlay (Full Features Layout) ---
function HtmlContent() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/schemes?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <Scroll html style={{ width: '100%' }}>
      <div className="w-full text-slate-900 overflow-x-hidden">
        
        {/* Search Hero Section */}
        <section className="relative w-full min-h-[90vh] flex flex-col justify-center py-20">
          <div className="container mx-auto px-6 max-w-5xl relative z-10 pointer-events-auto">
            <div className="bg-white/70 backdrop-blur-md p-10 md:p-16 rounded-[3rem] border border-white/60 shadow-2xl">
              <div className="text-center">
                <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 font-serif leading-tight">
                  Digital Citizen<br/>Advocacy Platform
                </h1>
                <p className="text-xl text-slate-700 mb-10 max-w-2xl mx-auto font-medium">
                  Find government welfare schemes, understand legal notices, and verify official documents in seconds.
                </p>

                <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mb-8">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Search className="h-6 w-6 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-14 pr-6 py-5 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-600/20 focus:border-blue-600 shadow-sm text-lg font-medium transition-all"
                    placeholder="Search for schemes, services, or legal help..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="absolute inset-y-2 right-2 px-8 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-bold text-lg"
                  >
                    Search
                  </button>
                </form>

                <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-600 font-medium">
                  <span>Popular:</span>
                  <button onClick={() => navigate('/schemes?q=PM+Kisan')} className="hover:text-blue-700 hover:underline underline-offset-4">PM Kisan</button>
                  <button onClick={() => navigate('/schemes?q=Mudra+Loan')} className="hover:text-blue-700 hover:underline underline-offset-4">Mudra Loan</button>
                  <button onClick={() => navigate('/notices')} className="hover:text-blue-700 hover:underline underline-offset-4">Traffic Challan</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pathways / Action Cards */}
        <section className="py-24 relative pointer-events-auto">
          <div className="container mx-auto px-6 max-w-7xl relative z-10">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-12 font-serif text-center bg-white/60 backdrop-blur-sm inline-block px-8 py-3 rounded-full border border-white/50 shadow-sm">
              What do you need help with today?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] border border-white/60 shadow-xl flex flex-col h-full cursor-pointer group hover:-translate-y-2 transition-transform duration-300" onClick={() => navigate('/schemes')}>
                <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center mb-6 border border-blue-200 group-hover:scale-110 transition-transform">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3 font-serif">Find Welfare Schemes</h3>
                <p className="text-slate-600 mb-8 flex-grow text-lg leading-relaxed">
                  Check eligibility and apply for over 500+ central and state government schemes tailored to your profile.
                </p>
                <div className="flex items-center text-blue-700 font-bold text-lg">
                  Start matching <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] border border-white/60 shadow-xl flex flex-col h-full cursor-pointer group hover:-translate-y-2 transition-transform duration-300" onClick={() => navigate('/notices')}>
                <div className="w-16 h-16 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center mb-6 border border-indigo-200 group-hover:scale-110 transition-transform">
                  <Scale className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3 font-serif">Analyze Legal Notice</h3>
                <p className="text-slate-600 mb-8 flex-grow text-lg leading-relaxed">
                  Upload court summons, traffic challans, or legal notices to get a plain-language summary and auto-drafted response.
                </p>
                <div className="flex items-center text-indigo-700 font-bold text-lg">
                  Upload notice <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] border border-white/60 shadow-xl flex flex-col h-full cursor-pointer group hover:-translate-y-2 transition-transform duration-300" onClick={() => navigate('/documents')}>
                <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mb-6 border border-emerald-200 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3 font-serif">Verify a Document</h3>
                <p className="text-slate-600 mb-8 flex-grow text-lg leading-relaxed">
                  Scan certificates and official documents to verify digital signatures, QR codes, and prevent fraud.
                </p>
                <div className="flex items-center text-emerald-700 font-bold text-lg">
                  Start verification <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* How it Works Stepper */}
        <section className="py-24 relative pointer-events-auto">
          <div className="container mx-auto px-6 max-w-5xl relative z-10">
            <div className="bg-white/90 backdrop-blur-xl rounded-[3rem] p-12 md:p-20 shadow-2xl border border-white/50 text-center">
              <h2 className="text-4xl font-black text-slate-900 mb-4 font-serif">How Nyayasetu Works</h2>
              <p className="text-xl text-slate-600 mb-16">A secure, streamlined process to advocate for your rights.</p>

              <div className="flex flex-col md:flex-row justify-between relative">
                <div className="hidden md:block absolute top-8 left-[15%] right-[15%] h-1 bg-slate-200 -z-10 rounded-full"></div>
                
                {[
                  { step: '01', title: 'Create Profile', desc: 'Securely enter your demographic details.' },
                  { step: '02', title: 'AI Analysis', desc: 'Our engine cross-references official databases.' },
                  { step: '03', title: 'Take Action', desc: 'Apply directly or generate legal responses.' }
                ].map((item, index) => (
                  <div key={index} className="flex flex-col items-center text-center mb-10 md:mb-0 relative z-10 w-full md:w-1/3">
                    <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-2xl mb-6 shadow-xl ring-8 ring-white transform rotate-3">
                      {item.step}
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">{item.title}</h3>
                    <p className="text-slate-600 text-lg max-w-[200px]">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-16 pt-12 border-t border-slate-200">
                <p className="text-sm font-bold text-slate-500 mb-6 uppercase tracking-widest">Built with Trusted Security Standards</p>
                <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center opacity-70">
                  <div className="flex items-center gap-3 text-slate-700 font-black text-lg"><ShieldCheck className="w-6 h-6"/> 256-bit Encryption</div>
                  <div className="flex items-center gap-3 text-slate-700 font-black text-lg"><CheckCircle2 className="w-6 h-6"/> Privacy First</div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </Scroll>
  );
}

export default function ScrollExperience() {
  return (
    <div className="w-full h-screen bg-[#e8ecef] overflow-hidden">
      <Canvas
        shadows
        camera={{ position: [0, 0, 12], fov: 45 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <color attach="background" args={['#e8ecef']} />
        
        {/* TRUE 3D LIGHTING */}
        <ambientLight intensity={0.5} />
        
        <directionalLight 
          castShadow 
          position={[10, 20, 15]} 
          intensity={3} 
          shadow-mapSize={[2048, 2048]} 
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
          shadow-bias={-0.0001}
        />
        
        <SpotLight 
          position={[-10, 15, 10]} 
          angle={0.3} 
          penumbra={1} 
          intensity={5} 
          castShadow 
          color="#ffffff"
        />

        <Environment preset="studio" />

        <ScrollControls pages={3} damping={0.2} distance={1.2}>
          {/* Dynamic Interactive 3D Objects */}
          <Scroll>
            <LawBook />
            <ScalesOfJustice />
            <StampingWaxSeal />
            <UnlockingPadlock />
          </Scroll>

          {/* Full Featured HTML Overlay */}
          <HtmlContent />
        </ScrollControls>
        
        <ContactShadows position={[0, -6, 0]} opacity={0.4} scale={50} blur={2} far={10} />
      </Canvas>
    </div>
  );
}
