import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, ScrollControls, Scroll, useScroll, Float, ContactShadows, SpotLight } from '@react-three/drei';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Scale, ShieldCheck, Mic, UserCheck, HelpCircle, ArrowRight, CheckCircle2, Sparkles, Zap, Globe, FileCheck, Landmark } from 'lucide-react';

// --- TRUE 3D Materials (High Contrast & PBR) ---
const leatherMaterial = new THREE.MeshStandardMaterial({
  color: '#3d1c04',
  roughness: 0.6,
  metalness: 0.1,
  bumpScale: 0.02,
});

const paperMaterial = new THREE.MeshStandardMaterial({
  color: '#fdfbf7',
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

    group.current.position.x = THREE.MathUtils.lerp(3.5, -4.5, offset);
    group.current.position.y = THREE.MathUtils.lerp(-3.5, 1.5, offset);
    group.current.position.z = THREE.MathUtils.lerp(0, -2, offset);
    
    group.current.rotation.x = THREE.MathUtils.lerp(0.5, 0.2, offset);
    group.current.rotation.y = THREE.MathUtils.lerp(-0.5, 0.5, offset);
    group.current.rotation.z = THREE.MathUtils.lerp(0, -0.1, offset);

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
        <mesh material={leatherMaterial} position={[0, -0.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.2, 0.2, 4.2]} />
        </mesh>
        
        <mesh material={leatherMaterial} position={[-1.6, 0.3, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
          <cylinderGeometry args={[0.4, 0.4, 4.2, 16, 1, false, 0, Math.PI]} />
        </mesh>

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

    group.current.position.x = THREE.MathUtils.lerp(-7, 5.2, offset);
    group.current.position.y = THREE.MathUtils.lerp(4, 0.5, offset);
    group.current.position.z = THREE.MathUtils.lerp(-8, -4, offset);
    
    group.current.rotation.y = THREE.MathUtils.lerp(0, -Math.PI / 3, offset);
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


// --- 3. Stamping Wax Seal (Presses Down on Scroll) ---
function StampingWaxSeal() {
  const group = useRef();
  const stampHandle = useRef();
  const waxEmblem = useRef();
  const scroll = useScroll();

  useFrame((state) => {
    const offset = scroll.offset;
    const time = state.clock.getElapsedTime();

    group.current.position.x = THREE.MathUtils.lerp(6, -5.5, offset);
    group.current.position.y = THREE.MathUtils.lerp(-6, -1, offset);
    group.current.position.z = THREE.MathUtils.lerp(-5, -2, offset);
    group.current.rotation.y = THREE.MathUtils.lerp(0.2, 0.6, offset);

    const stampProgress = THREE.MathUtils.clamp((offset - 0.2) * 2.5, 0, 1);
    
    if (stampProgress > 0 && stampProgress < 0.8) {
      stampHandle.current.position.y = THREE.MathUtils.lerp(3.5, 0.35, stampProgress * 1.25);
    } else if (stampProgress >= 0.8) {
      stampHandle.current.position.y = THREE.MathUtils.lerp(0.35, 1.2, (stampProgress - 0.8) * 5);
    }

    if (stampProgress > 0.4) {
      waxEmblem.current.scale.x = THREE.MathUtils.lerp(waxEmblem.current.scale.x, 1, 0.1);
      waxEmblem.current.scale.y = THREE.MathUtils.lerp(waxEmblem.current.scale.y, 1, 0.1);
      waxEmblem.current.scale.z = THREE.MathUtils.lerp(waxEmblem.current.scale.z, 1, 0.1);
      waxEmblem.current.rotation.z = time * 0.5;
    } else {
      waxEmblem.current.scale.set(0.01, 0.01, 0.01);
    }
  });

  return (
    <group ref={group}>
      <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.3}>
        <mesh material={paperMaterial} position={[0, -0.05, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.5, 0.1, 4.5]} />
        </mesh>
        
        <mesh material={goldMaterial} position={[0, 0.01, -1.8]} castShadow>
          <boxGeometry args={[3.0, 0.02, 0.4]} />
        </mesh>

        <group ref={waxEmblem} position={[0, 0.08, 0.8]} scale={[0.01, 0.01, 0.01]}>
          <mesh material={waxRedMaterial} castShadow>
             <cylinderGeometry args={[0.9, 0.9, 0.12, 32]} />
          </mesh>
          <mesh material={goldMaterial} position={[0, 0.08, 0]} castShadow>
             <cylinderGeometry args={[0.7, 0.7, 0.05, 32]} />
          </mesh>
          <mesh material={emeraldGlowMaterial} position={[0, 0.12, 0]} castShadow>
             <boxGeometry args={[0.4, 0.05, 0.4]} />
          </mesh>
        </group>

        <group ref={stampHandle} position={[0, 3.5, 0.8]}>
          <mesh material={woodMaterial} position={[0, 2.2, 0]} castShadow>
            <sphereGeometry args={[0.6, 32, 32]} />
          </mesh>
          <mesh material={woodMaterial} position={[0, 1.2, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.45, 1.4, 32]} />
          </mesh>
          <mesh material={brassMaterial} position={[0, 0.3, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.85, 0.95, 0.5, 32]} />
          </mesh>
        </group>
      </Float>
    </group>
  );
}


// --- 4. Unlocking Security Key & Padlock ---
function UnlockingPadlock() {
  const group = useRef();
  const shackle = useRef();
  const key = useRef();
  const glowRing = useRef();
  const scroll = useScroll();

  useFrame((state) => {
    const offset = scroll.offset;
    const time = state.clock.getElapsedTime();

    group.current.position.x = THREE.MathUtils.lerp(-6, 4.5, offset);
    group.current.position.y = THREE.MathUtils.lerp(-4, -0.5, offset);
    group.current.position.z = THREE.MathUtils.lerp(-6, -2, offset);
    
    group.current.rotation.y = THREE.MathUtils.lerp(-0.4, 0.3, offset);

    const unlockProgress = THREE.MathUtils.clamp((offset - 0.5) * 2.5, 0, 1);

    key.current.position.z = THREE.MathUtils.lerp(3.0, 0.6, unlockProgress);
    key.current.rotation.z = THREE.MathUtils.lerp(0, Math.PI / 2, unlockProgress);
    shackle.current.position.y = THREE.MathUtils.lerp(1.4, 2.2, unlockProgress);
    shackle.current.rotation.y = THREE.MathUtils.lerp(0, 0.5, unlockProgress);

    if (unlockProgress > 0.8) {
      glowRing.current.scale.set(1.1 + Math.sin(time * 3) * 0.1, 1.1 + Math.sin(time * 3) * 0.1, 1.1);
    } else {
      glowRing.current.scale.set(0.01, 0.01, 0.01);
    }
  });

  return (
    <group ref={group}>
      <Float speed={1.5} rotationIntensity={0.15} floatIntensity={0.4}>
        <mesh material={goldMaterial} position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.4, 2.2, 1.0]} />
        </mesh>
        
        <mesh material={steelMaterial} position={[0, -0.2, 0.51]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.05, 32]} rotation={[Math.PI / 2, 0, 0]} />
        </mesh>

        <group ref={shackle} position={[0, 1.4, 0]}>
          <mesh material={steelMaterial} position={[0, 0.6, 0]} castShadow>
             <torusGeometry args={[0.75, 0.18, 16, 32, Math.PI]} />
          </mesh>
          <mesh material={steelMaterial} position={[-0.75, 0, 0]} castShadow>
             <cylinderGeometry args={[0.18, 0.18, 1.2, 16]} />
          </mesh>
          <mesh material={steelMaterial} position={[0.75, 0, 0]} castShadow>
             <cylinderGeometry args={[0.18, 0.18, 1.2, 16]} />
          </mesh>
        </group>

        <group ref={key} position={[0, -0.2, 3.0]}>
          <mesh material={brassMaterial} position={[0, 0, 1.2]} castShadow>
             <torusGeometry args={[0.4, 0.1, 16, 32]} />
          </mesh>
          <mesh material={brassMaterial} position={[0, 0, 0.5]} rotation={[Math.PI / 2, 0, 0]} castShadow>
             <cylinderGeometry args={[0.08, 0.08, 1.2, 16]} />
          </mesh>
          <mesh material={brassMaterial} position={[0.15, -0.1, 0.1]} castShadow>
             <boxGeometry args={[0.25, 0.2, 0.3]} />
          </mesh>
        </group>

        <mesh ref={glowRing} position={[0, 0, -0.1]}>
          <torusGeometry args={[1.6, 0.05, 16, 32]} />
          <meshBasicMaterial color="#10b981" />
        </mesh>
      </Float>
    </group>
  );
}


// --- FULL FEATURES HTML CONTENT OVERLAY ---
function HtmlContent() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('farmers');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/schemes?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const allFeatures = [
    {
      id: 'schemes',
      title: 'AI Welfare Scheme Matcher',
      desc: 'Cross-reference 500+ central & state schemes against your age, income, caste, and occupation.',
      icon: FileText,
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      link: '/schemes',
      badge: '500+ Schemes'
    },
    {
      id: 'notices',
      title: 'AI Legal Notice Analyzer',
      desc: 'Upload court summons, traffic challans, or legal notices for plain-language summaries & auto-generated reply letters.',
      icon: Scale,
      color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      link: '/notices',
      badge: 'Instant Summary'
    },
    {
      id: 'documents',
      title: 'Document & QR Verifier',
      desc: 'Scan certificates and government docs to verify digital signatures, QR codes, and prevent fraud.',
      icon: ShieldCheck,
      color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      link: '/documents',
      badge: 'Anti-Fraud Scan'
    },
    {
      id: 'voice',
      title: 'AI Voice Legal Assistant',
      desc: 'Speak your legal or scheme queries naturally in your native language for instant voice guidance.',
      icon: Mic,
      color: 'bg-amber-100 text-amber-700 border-amber-200',
      link: '/voice',
      badge: 'Multi-Lingual Voice'
    },
    {
      id: 'profile',
      title: 'Demographic Profile Builder',
      desc: 'Customize your demographic criteria to receive automated notifications when new schemes launch.',
      icon: UserCheck,
      color: 'bg-purple-100 text-purple-700 border-purple-200',
      link: '/dashboard',
      badge: 'Auto-Matching'
    },
    {
      id: 'help',
      title: 'Legal Knowledge Base',
      desc: 'Explore comprehensive guides on citizen rights, police procedures, RTI applications, and tenant laws.',
      icon: HelpCircle,
      color: 'bg-rose-100 text-rose-700 border-rose-200',
      link: '/help-center',
      badge: 'Free Guides'
    }
  ];

  return (
    <Scroll html style={{ width: '100%' }}>
      <div className="w-full text-slate-900 overflow-x-hidden">
        
        {/* 1. Hero Search Section */}
        <section className="relative w-full min-h-[90vh] flex flex-col justify-center py-20">
          <div className="container mx-auto px-6 max-w-5xl relative z-10 pointer-events-auto">
            <div className="bg-white/75 backdrop-blur-md p-10 md:p-16 rounded-[3rem] border border-white/80 shadow-2xl">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-sm font-bold mb-6">
                  <Sparkles className="w-4 h-4 text-blue-600" /> India's 1st Citizen Legal & Scheme AI
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 font-serif leading-tight">
                  Digital Citizen<br/>Advocacy Platform
                </h1>
                <p className="text-xl text-slate-700 mb-10 max-w-2xl mx-auto font-medium">
                  Find welfare schemes, analyze legal notices, and verify documents in seconds.
                </p>

                <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mb-8">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Search className="h-6 w-6 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-14 pr-6 py-5 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-600/20 focus:border-blue-600 shadow-sm text-lg font-medium transition-all"
                    placeholder="Search for schemes, legal notices, or documents..."
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
                  <button onClick={() => navigate('/voice')} className="hover:text-blue-700 hover:underline underline-offset-4 flex items-center gap-1"><Mic className="w-3.5 h-3.5"/> Voice Search</button>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* 2. ALL PLATFORM FEATURES (6 Complete Feature Cards Grid) */}
        <section className="py-24 relative pointer-events-auto">
          <div className="container mx-auto px-6 max-w-7xl relative z-10">
            <div className="text-center mb-16">
              <span className="text-sm font-bold tracking-widest uppercase text-blue-700 bg-blue-50 px-4 py-1.5 rounded-full border border-blue-200">
                Complete Feature Suite
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mt-4 mb-4 font-serif">
                Everything You Need to Claim Your Rights
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Comprehensive AI tools designed specifically for Indian citizens, farmers, students, and workers.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {allFeatures.map((feat) => {
                const IconComponent = feat.icon;
                return (
                  <div 
                    key={feat.id}
                    className="bg-white/85 backdrop-blur-xl p-8 rounded-[2rem] border border-white/70 shadow-xl flex flex-col justify-between cursor-pointer group hover:-translate-y-2 transition-all duration-300 relative overflow-hidden"
                    onClick={() => navigate(feat.link)}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${feat.color} group-hover:scale-110 transition-transform`}>
                          <IconComponent className="w-7 h-7" />
                        </div>
                        <span className="text-xs font-extrabold px-3 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                          {feat.badge}
                        </span>
                      </div>
                      
                      <h3 className="text-2xl font-bold text-slate-900 mb-3 font-serif group-hover:text-blue-900 transition-colors">
                        {feat.title}
                      </h3>
                      <p className="text-slate-600 text-base leading-relaxed mb-6">
                        {feat.desc}
                      </p>
                    </div>

                    <div className="flex items-center text-blue-700 font-bold text-base pt-4 border-t border-slate-100">
                      Explore Feature <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>


        {/* 3. FEATURE DEEP-DIVE SHOWCASE SECTION (Live Feature Demos) */}
        <section className="py-24 relative pointer-events-auto">
          <div className="container mx-auto px-6 max-w-6xl relative z-10">
            <div className="bg-white/90 backdrop-blur-2xl rounded-[3rem] p-10 md:p-16 shadow-2xl border border-white/60">
              
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 font-serif mb-4">
                  Interactive Scheme Categories
                </h2>
                <p className="text-lg text-slate-600">
                  Select your profile filter below to see available benefits instant match:
                </p>
                
                {/* Category Pills */}
                <div className="flex flex-wrap justify-center gap-3 mt-6">
                  {[
                    { id: 'farmers', label: '🌾 Farmers & Agriculture' },
                    { id: 'students', label: '🎓 Students & Youth' },
                    { id: 'women', label: '👩 Women Empowerment' },
                    { id: 'msme', label: '🏢 Small Business / MSME' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                        activeTab === tab.id
                          ? 'bg-slate-900 text-white shadow-md scale-105'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Feature Content Box */}
              <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 shadow-inner">
                {activeTab === 'farmers' && (
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                      <span className="text-xs font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full uppercase">PM-KISAN SAMMAN NIDHI</span>
                      <h4 className="text-2xl font-bold text-slate-900 mt-2 mb-2 font-serif">Financial Support for Cultivators</h4>
                      <p className="text-slate-600 max-w-lg">Direct income support of ₹6,000 per year in three equal installments to all landholding farmer families.</p>
                    </div>
                    <button onClick={() => navigate('/schemes')} className="px-6 py-3 bg-green-700 text-white font-bold rounded-xl hover:bg-green-800 transition-colors shrink-0">
                      Check Eligibility →
                    </button>
                  </div>
                )}

                {activeTab === 'students' && (
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                      <span className="text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full uppercase">CENTRAL SECTOR SCHOLARSHIP</span>
                      <h4 className="text-2xl font-bold text-slate-900 mt-2 mb-2 font-serif">Higher Education Assistance</h4>
                      <p className="text-slate-600 max-w-lg">Financial assistance to meritorious students from low-income families for college and university studies.</p>
                    </div>
                    <button onClick={() => navigate('/schemes')} className="px-6 py-3 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 transition-colors shrink-0">
                      Check Eligibility →
                    </button>
                  </div>
                )}

                {activeTab === 'women' && (
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                      <span className="text-xs font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-full uppercase">SUKANYA SAMRIDDHI YOJANA</span>
                      <h4 className="text-2xl font-bold text-slate-900 mt-2 mb-2 font-serif">Girl Child Prosperity Scheme</h4>
                      <p className="text-slate-600 max-w-lg">High-interest savings account scheme backed by Govt of India for higher education and marriage of female children.</p>
                    </div>
                    <button onClick={() => navigate('/schemes')} className="px-6 py-3 bg-purple-700 text-white font-bold rounded-xl hover:bg-purple-800 transition-colors shrink-0">
                      Check Eligibility →
                    </button>
                  </div>
                )}

                {activeTab === 'msme' && (
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                      <span className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full uppercase">PMEGP & MUDRA LOANS</span>
                      <h4 className="text-2xl font-bold text-slate-900 mt-2 mb-2 font-serif">Collateral-Free Micro Business Capital</h4>
                      <p className="text-slate-600 max-w-lg">Loans up to ₹10 Lakhs for micro-enterprises and small business setups without collateral security requirements.</p>
                    </div>
                    <button onClick={() => navigate('/schemes')} className="px-6 py-3 bg-amber-700 text-white font-bold rounded-xl hover:bg-amber-800 transition-colors shrink-0">
                      Check Eligibility →
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        </section>


        {/* 4. How it Works Stepper */}
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

        <ScrollControls pages={4} damping={0.2} distance={1.2}>
          {/* Dynamic 3D Objects */}
          <Scroll>
            <LawBook />
            <ScalesOfJustice />
            <StampingWaxSeal />
            <UnlockingPadlock />
          </Scroll>

          {/* Complete Feature Suite HTML Overlay */}
          <HtmlContent />
        </ScrollControls>
        
        <ContactShadows position={[0, -6, 0]} opacity={0.4} scale={50} blur={2} far={10} />
      </Canvas>
    </div>
  );
}
