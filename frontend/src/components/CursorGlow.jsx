import React, { useEffect, useRef } from 'react';

export default function CursorGlow() {
  const blobRef = useRef(null);

  useEffect(() => {
    let currentX = window.innerWidth / 2;
    let currentY = window.innerHeight / 2;
    let targetX = currentX;
    let targetY = currentY;

    const onMouseMove = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    window.addEventListener('mousemove', onMouseMove);

    const animate = () => {
      // Glow Aura: Faster smooth factor (0.15) = no excessive lag, snappy but purely fluid
      currentX += (targetX - currentX) * 0.15;
      currentY += (targetY - currentY) * 0.15;

      if (blobRef.current) {
        blobRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
      }

      requestAnimationFrame(animate);
    };
    
    let animId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <>
      {/* Full Screen High-Fidelity Ambient Mesh Orbs */}
      <div className="pointer-events-none fixed inset-0 z-[-2] overflow-hidden opacity-60 dark:opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-500 filter blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[55vw] h-[55vw] rounded-full bg-fuchsia-500 filter blur-[150px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-orange-400 filter blur-[130px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-4000"></div>
      </div>

      {/* Dynamic Cursor Spotlight Aura */}
      <div 
        ref={blobRef}
        className="pointer-events-none fixed top-0 left-0 z-[-1] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[90px] opacity-90 dark:opacity-80 will-change-transform"
        style={{
           width: '45vw',
           height: '45vw',
           background: 'radial-gradient(circle, rgba(14, 165, 233, 0.7) 0%, rgba(59, 130, 246, 0.4) 30%, rgba(249, 115, 22, 0.2) 60%, transparent 80%)',
        }}
      />
    </>
  );
}
