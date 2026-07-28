import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Sparkles, Scale, Mic, ArrowRight } from 'lucide-react';
import Hero3DCanvas from './3d/Hero3DCanvas';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="relative min-h-screen">
      {/* Background 3D Canvas */}
      <Hero3DCanvas />

      {/* Main Content Overlay */}
      <div className="relative z-10 pt-32 px-6 max-w-7xl mx-auto">
        
        {/* Hero Section */}
        <section className="min-h-[70vh] flex flex-col justify-center max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-6 leading-tight">
            Justice & Governance, <br />
            <span className="text-neutral-500">Simplified.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-neutral-400 mb-10 max-w-2xl font-light">
            An AI-powered bridge between Indian citizens and their rights. Discover schemes, verify documents, and understand legal notices instantly.
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate(user ? '/dashboard' : '/login')}
              className="px-8 py-3 bg-white text-black font-medium rounded-full hover:bg-neutral-200 transition-colors flex items-center gap-2"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section className="py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Scheme Matcher */}
            <div className="bento-box p-8 group cursor-pointer hover:-translate-y-1 transition-transform" onClick={() => navigate('/schemes')}>
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-6">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Scheme Matcher</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Instantly cross-reference 500+ welfare schemes based on your profile to find what you're eligible for.
              </p>
            </div>

            {/* Legal Assessor */}
            <div className="bento-box p-8 group cursor-pointer hover:-translate-y-1 transition-transform" onClick={() => navigate('/notices')}>
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-6">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Legal Assessor</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Decode complex court notices and traffic challans into plain language with auto-drafted replies.
              </p>
            </div>

            {/* Fraud Verifier */}
            <div className="bento-box p-8 group cursor-pointer hover:-translate-y-1 transition-transform" onClick={() => navigate('/documents')}>
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-6">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Fraud Verifier</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Scan certificates for tampered seals and verify official government security parameters locally.
              </p>
            </div>

            {/* Voice Assistant - spanning 2 columns or full width on small */}
            <div className="bento-box p-8 md:col-span-2 lg:col-span-3 group cursor-pointer hover:-translate-y-1 transition-transform" onClick={() => navigate('/voice')}>
              <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
                <div>
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-6">
                    <Mic className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Regional Voice Assistant</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed max-w-2xl">
                    Speak naturally in Hindi, Bengali, Tamil, Telugu, or English to get instant voice-guided scheme walkthroughs and legal help.
                  </p>
                </div>
                <div className="hidden md:flex w-32 h-32 rounded-full border border-white/10 items-center justify-center relative">
                   {/* Abstract representation of voice waves */}
                   <div className="absolute inset-4 rounded-full border border-white/20 animate-ping"></div>
                   <div className="absolute inset-8 rounded-full border border-white/30 animate-pulse"></div>
                   <Mic className="w-8 h-8 text-neutral-500" />
                </div>
              </div>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}
