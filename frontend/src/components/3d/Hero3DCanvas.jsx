import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function Hero3DCanvas({ activeSection = 0 }) {
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const scrollRef = useRef(0);
  const [interactiveMode, setInteractiveMode] = useState('scales'); // scales | nodes | scanner | voice

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.5, 9);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    // Clear existing canvas
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xf59e0b, 2.5); // Warm Gold Light
    mainLight.position.set(5, 10, 7);
    scene.add(mainLight);

    const accentLight = new THREE.PointLight(0x10b981, 3, 20); // Emerald Accent Light
    accentLight.position.set(-5, -2, 5);
    scene.add(accentLight);

    const blueLight = new THREE.PointLight(0x38bdf8, 2, 20); // Ice Blue Light
    blueLight.position.set(5, -4, -3);
    scene.add(blueLight);

    // --- 1. SCALES OF JUSTICE & LEGAL CODEX OBJECT GROUP ---
    const scalesGroup = new THREE.Group();

    // Metallic Gold Material
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.9,
      roughness: 0.25,
      envMapIntensity: 1.5,
    });

    const emeraldGlowMaterial = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.5,
    });

    // Main Pillar Base
    const baseGeo = new THREE.CylinderGeometry(1.6, 2.0, 0.4, 32);
    const baseMesh = new THREE.Mesh(baseGeo, goldMaterial);
    baseMesh.position.y = -2.2;
    scalesGroup.add(baseMesh);

    // Vertical Stem
    const stemGeo = new THREE.CylinderGeometry(0.12, 0.2, 4.2, 32);
    const stemMesh = new THREE.Mesh(stemGeo, goldMaterial);
    stemMesh.position.y = -0.1;
    scalesGroup.add(stemMesh);

    // Top Orb / Emblem
    const orbGeo = new THREE.SphereGeometry(0.35, 32, 32);
    const orbMesh = new THREE.Mesh(orbGeo, emeraldGlowMaterial);
    orbMesh.position.y = 2.05;
    scalesGroup.add(orbMesh);

    // Horizontal Beam (Tilts interactively)
    const beamGroup = new THREE.Group();
    beamGroup.position.y = 1.8;

    const beamGeo = new THREE.BoxGeometry(4.4, 0.12, 0.12);
    const beamMesh = new THREE.Mesh(beamGeo, goldMaterial);
    beamGroup.add(beamMesh);

    // Left & Right Pans
    const panGeo = new THREE.CylinderGeometry(0.9, 0.1, 0.3, 32, 1, true);
    panGeo.openEnded = false;

    // Left Pan Assembly
    const leftPanGroup = new THREE.Group();
    leftPanGroup.position.set(-2.0, -1.2, 0);
    const leftPan = new THREE.Mesh(panGeo, goldMaterial);
    leftPanGroup.add(leftPan);

    // Left Chains
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3;
      const chainGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.2);
      const chain = new THREE.Mesh(chainGeo, goldMaterial);
      chain.position.set(Math.cos(angle) * 0.7, 0.6, Math.sin(angle) * 0.7);
      leftPanGroup.add(chain);
    }

    // Right Pan Assembly
    const rightPanGroup = new THREE.Group();
    rightPanGroup.position.set(2.0, -1.2, 0);
    const rightPan = new THREE.Mesh(panGeo, goldMaterial);
    rightPanGroup.add(rightPan);

    // Right Chains
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3;
      const chainGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.2);
      const chain = new THREE.Mesh(chainGeo, goldMaterial);
      chain.position.set(Math.cos(angle) * 0.7, 0.6, Math.sin(angle) * 0.7);
      rightPanGroup.add(chain);
    }

    beamGroup.add(leftPanGroup);
    beamGroup.add(rightPanGroup);
    scalesGroup.add(beamGroup);

    scene.add(scalesGroup);

    // --- 2. MULTI-AGENT ORBITING NODES GROUP ---
    const nodesGroup = new THREE.Group();
    nodesGroup.position.set(0, 0, 0);

    const nodePositions = [
      { x: -3.2, y: 1.2, z: 1.5, label: 'Scheme AI', color: 0xf59e0b },
      { x: 3.2, y: 1.2, z: 1.5, label: 'Legal AI', color: 0x38bdf8 },
      { x: 0, y: -2.0, z: 2.2, label: 'Fraud Verification', color: 0x10b981 },
      { x: 0, y: 2.8, z: -1.0, label: 'Voice RAG', color: 0xec4899 },
    ];

    const nodeMeshes = [];
    nodePositions.forEach((pos) => {
      const nodeMat = new THREE.MeshStandardMaterial({
        color: pos.color,
        emissive: pos.color,
        emissiveIntensity: 0.7,
        roughness: 0.1,
        metalness: 0.8,
      });
      const nodeMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5, 2), nodeMat);
      nodeMesh.position.set(pos.x, pos.y, pos.z);
      nodesGroup.add(nodeMesh);
      nodeMeshes.push(nodeMesh);
    });

    // Laser Connections
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.35 });
    const points = [];
    nodePositions.forEach((p1, i) => {
      nodePositions.forEach((p2, j) => {
        if (i < j) {
          points.push(new THREE.Vector3(p1.x, p1.y, p1.z));
          points.push(new THREE.Vector3(p2.x, p2.y, p2.z));
        }
      });
    });
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
    const laserLines = new THREE.LineSegments(lineGeo, lineMaterial);
    nodesGroup.add(laserLines);

    scene.add(nodesGroup);

    // --- 3. BACKGROUND FLOATING PARTICLES ---
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particleCoords = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particleCoords[i] = (Math.random() - 0.5) * 20;
      particleCoords[i + 1] = (Math.random() - 0.5) * 15;
      particleCoords[i + 2] = (Math.random() - 0.5) * 15;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particleCoords, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.08,
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Mouse Movement Listener
    const handleMouseMove = (event) => {
      const rect = container.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
      const y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;
      mouseRef.current.targetX = x;
      mouseRef.current.targetY = y;
    };

    // Scroll Listener
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight || 1;
      scrollRef.current = scrollY / maxScroll;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const scroll = scrollRef.current;

      // Smooth mouse interpolation (Lerp)
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      const mX = mouseRef.current.x;
      const mY = mouseRef.current.y;

      // 1. Rotate Scales of Justice
      scalesGroup.rotation.y = elapsedTime * 0.25 + mX * 0.8 + scroll * Math.PI * 2;
      scalesGroup.rotation.x = mY * 0.3;

      // Interactive Balance Beam Tilt on Mouse move
      beamGroup.rotation.z = Math.sin(elapsedTime * 1.5) * 0.08 + mX * 0.25;

      // 2. Orbit Multi-Agent Nodes
      nodesGroup.rotation.y = -elapsedTime * 0.35 + mX * 0.5;
      nodesGroup.rotation.z = Math.cos(elapsedTime * 0.2) * 0.15;

      nodeMeshes.forEach((mesh, idx) => {
        mesh.rotation.x = elapsedTime * (0.5 + idx * 0.2);
        mesh.rotation.y = elapsedTime * (0.8 + idx * 0.1);
        mesh.position.y += Math.sin(elapsedTime * 2 + idx) * 0.003;
      });

      // 3. Scroll-Driven Camera & Layout Morph
      camera.position.x = mX * 0.5;
      camera.position.y = 1.5 - mY * 0.5 - scroll * 1.5;
      camera.position.z = 9 - scroll * 2.5;
      camera.lookAt(0, 0, 0);

      // Rotate background particles
      particles.rotation.y = elapsedTime * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[550px] flex items-center justify-center overflow-hidden">
      {/* Three.js Canvas Container */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Interactive Controls Overlay */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-amber-500/30 shadow-2xl text-xs font-medium text-amber-200">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        <span>Interactive 3D Model: Drag mouse to rotate • Scroll page to inspect AI Nodes</span>
      </div>
    </div>
  );
}
