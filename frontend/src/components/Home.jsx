import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Search, Users, ArrowRight, Sparkles, Zap, PhoneCall, FileText, 
  CreditCard, Globe, UserPlus, Car, UserCheck, ShoppingBag, Heart, GraduationCap, 
  Landmark, X, MessageSquare, ExternalLink, HelpCircle, BookOpen, Scale, Award, 
  CheckCircle2, FileSearch, Mic, AlertTriangle, ShieldAlert, Cpu
} from 'lucide-react';
import Hero3DCanvas from './3d/Hero3DCanvas';
import { useAuth } from '../hooks/useAuth';
import { documentGuides } from '../data/documentGuides';

const essentialDocuments = [
  { id: 'aadhaar', name: 'Aadhaar Card', icon: CreditCard, desc: '12-digit unique ID essential for banking, government schemes, tax compliance, and subsidies.' },
  { id: 'passport', name: 'Passport', icon: Globe, desc: 'Vital for international travel and serves as proof of Indian citizenship and identity abroad.' },
  { id: 'birth_cert', name: 'Birth Certificate', icon: UserPlus, desc: 'Proves date, place, and nationality of birth; required for school admission, DL, and marriage.' },
  { id: 'dl', name: 'Driving License', icon: Car, desc: 'Mandatory for driving legally; also serves as identity and address proof.' },
  { id: 'voter_id', name: 'Voter ID Card', icon: UserCheck, desc: 'Issued by Election Commission, enables voting and serves as valid identity and address proof.' },
  { id: 'ration_card', name: 'Ration Card', icon: ShoppingBag, desc: 'Provides access to subsidized food grains and acts as identity and residence proof.' },
  { id: 'marriage_cert', name: 'Marriage Certificate', icon: Heart, desc: 'Official proof of marriage; claiming social benefits, spouse visas, and status updates.' },
  { id: 'edu_cert', name: 'Educational Certificates', icon: GraduationCap, desc: '10th, 12th, degree, mark sheets—essential for employment, higher education, and scholarships.' },
  { id: 'bank_passbook', name: 'Bank Passbook', icon: Landmark, desc: 'Records financial transactions; crucial for pensions, loans, and financial management.' }
];

const integratedPlatforms = [
  { type: 'platform', id: 'edistrict', name: 'e-District Services', icon: FileText, desc: 'Offers online applications for certificates, licenses, and registrations with document uploads and tracking.' },
  { type: 'platform', id: 'myscheme', name: 'myScheme Portal', icon: Sparkles, desc: 'Search, discover, and apply for government schemes via a 3-step process covering education, health, and more.' },
  { type: 'platform', id: 'vault', name: 'Secure Document Vault', icon: ShieldCheck, desc: 'A local-first, highly secure digital vault to store your crucial certificates locally, fully protected.' },
  { type: 'platform', id: 'umang', name: 'UMANG / Unified Portal', icon: Users, desc: 'Provides end-to-end online access to government services with seamless cross-department database integration.' }
];

export default function Home({ openBot }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeFeature, setActiveFeature] = useState('schemes');

  const handleItemClick = (item, type = 'document') => {
    if (type === 'platform' && openBot) {
      openBot({ ...item, type });
    } else if (type === 'document') {
      setSelectedDoc(item);
      setActiveTab('overview');
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden selection:bg-amber-500 selection:text-slate-950">
      
      {/* --- HERO SECTION WITH INTERACTIVE 3D CANVAS --- */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-16 px-4 md:px-8 border-b border-slate-800/80">
        
        {/* Background Radial Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-slate-950 to-slate-950 pointer-events-none" />
        
        <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Column: Headlines & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/30 shadow-lg text-xs font-semibold text-amber-300 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Nyayasetu AI Agentic Network 🇮🇳</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
              Democratizing <br />
              <span className="text-gradient-gold">Indian Governance</span> <br />
              <span className="text-gradient-emerald">& Citizen Rights</span>
            </h1>

            <p className="text-base md:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
              Bridging Indian citizens with complex government schemes, legal directives, and fraud-proof document verification. Powered by multi-agent AI & local ChromaDB RAG.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 pt-4">
              <button
                onClick={() => navigate(user ? '/dashboard/matcher' : '/login')}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-600 text-slate-950 font-bold shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-105 transition-all duration-200 flex items-center gap-3 text-base"
              >
                <Sparkles className="w-5 h-5 fill-slate-950" />
                <span>Find Eligible Schemes</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => navigate(user ? '/dashboard/legal' : '/login')}
                className="px-7 py-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold backdrop-blur-md hover:border-amber-500/50 transition-all duration-200 flex items-center gap-2.5 text-base"
              >
                <Scale className="w-5 h-5 text-amber-400" />
                <span>Analyze Legal Notice</span>
              </button>
            </div>

            {/* Realtime Impact Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-800/80 max-w-xl">
              <div>
                <div className="text-2xl md:text-3xl font-black text-amber-400 font-mono-code">500+</div>
                <div className="text-xs text-slate-400 font-medium">Govt Schemes</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-black text-emerald-400 font-mono-code">100%</div>
                <div className="text-xs text-slate-400 font-medium">RAG Authenticity</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-black text-sky-400 font-mono-code">12+</div>
                <div className="text-xs text-slate-400 font-medium">Regional Languages</div>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive 3D Canvas Stage */}
          <div className="lg:col-span-5 relative w-full h-[500px] lg:h-[580px] rounded-3xl overflow-hidden glass-panel-gold border border-amber-500/30">
            <Hero3DCanvas />
          </div>

        </div>
      </section>

      {/* --- AI AGENTIC CAPABILITIES (INTERACTIVE TABS) --- */}
      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-xs font-semibold text-emerald-400">
            <Cpu className="w-4 h-4" />
            <span>Powered by Multi-Agent AI</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
            Intelligent Citizen Advocate Suite
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base">
            Every feature is backed by specialized AI agents trained on official gazette notifications and government directives.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Scheme Engine */}
          <div 
            onClick={() => navigate(user ? '/dashboard/matcher' : '/login')}
            className="group relative p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900/90 transition-all duration-300 cursor-pointer glass-panel"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
              Scheme Matcher AI
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Analyzes income, state, category, and occupation to cross-reference 500+ welfare schemes instantly.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
              <span>Run Matcher</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 2: Legal Assessor */}
          <div 
            onClick={() => navigate(user ? '/dashboard/notice' : '/login')}
            className="group relative p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/50 hover:bg-slate-900/90 transition-all duration-300 cursor-pointer glass-panel"
          >
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-5 group-hover:scale-110 group-hover:bg-sky-500 group-hover:text-slate-950 transition-all">
              <Scale className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-sky-400 transition-colors">
              Legal Assessor AI
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Decode complex court notices, traffic challans, and tax directives into plain language with auto-replies.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs font-bold text-sky-400 group-hover:translate-x-1 transition-transform">
              <span>Check Notice</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 3: Fraud Verifier */}
          <div 
            onClick={() => navigate(user ? '/dashboard/doc-analyzer' : '/login')}
            className="group relative p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/90 transition-all duration-300 cursor-pointer glass-panel"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
              Document Authenticity AI
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Scans certificates for tampered seals, altered text, and verifies official government security parameters.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
              <span>Scan Document</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 4: Regional Voice RAG */}
          <div 
            onClick={() => navigate(user ? '/dashboard/voice' : '/login')}
            className="group relative p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-900/90 transition-all duration-300 cursor-pointer glass-panel"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-5 group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-slate-950 transition-all">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
              Regional Voice Assistant
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Speak naturally in Hindi, Bengali, Tamil, Telugu, or English to get instant voice-guided scheme walkthroughs.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs font-bold text-purple-400 group-hover:translate-x-1 transition-transform">
              <span>Start Voice Assistant</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

        </div>
      </section>

      {/* --- ESSENTIAL CITIZEN DOCUMENTS GUIDE --- */}
      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-bold tracking-widest text-amber-400 uppercase">Citizen Knowledge Base</span>
            <h2 className="text-2xl md:text-4xl font-bold text-white mt-1">Essential Indian Certificates & Licenses</h2>
          </div>
          <p className="text-sm text-slate-400 max-w-md">
            Click any document to inspect official requirements, application steps, and mandatory verification checklists.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {essentialDocuments.map((doc) => {
            const Icon = doc.icon;
            return (
              <div
                key={doc.id}
                onClick={() => handleItemClick(doc, 'document')}
                className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-amber-500/40 hover:bg-slate-900/80 transition-all duration-200 cursor-pointer flex items-start gap-4 group"
              >
                <div className="p-3 rounded-xl bg-slate-800 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-white group-hover:text-amber-300 transition-colors">
                    {doc.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {doc.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* --- INTEGRATED OFFICIAL PLATFORMS --- */}
      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto border-t border-slate-800/80 mb-12">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Integrated Government Portals</h2>
          <p className="text-xs md:text-sm text-slate-400 mt-2">Direct access to state e-District, myScheme, DigiLocker, and UMANG platforms.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {integratedPlatforms.map((plat) => {
            const Icon = plat.icon;
            return (
              <div
                key={plat.id}
                onClick={() => handleItemClick(plat, 'platform')}
                className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all duration-200 cursor-pointer text-center group glass-panel"
              >
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white group-hover:text-emerald-300">{plat.name}</h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{plat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* --- DOCUMENT GUIDE MODAL --- */}
      {selectedDoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setSelectedDoc(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 rounded-full bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
              <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400">
                <selectedDoc.icon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{selectedDoc.name}</h3>
                <p className="text-xs text-amber-400 font-semibold">Official Citizen Guide & Verification Standard</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">{selectedDoc.desc}</p>

            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Mandatory Documents Required</span>
              </h4>
              <ul className="text-xs text-slate-400 space-y-2 pl-6 list-disc">
                <li>Proof of Identity (Voter ID, Passport, PAN)</li>
                <li>Proof of Address (Utility bill, Rent agreement, Bank passbook)</li>
                <li>Recent passport-size photographs</li>
                <li>Self-attested identity affidavit if applicable</li>
              </ul>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedDoc(null);
                  navigate(user ? '/dashboard/matcher' : '/login');
                }}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-bold shadow-lg shadow-amber-500/20"
              >
                Check Scheme Eligibility for {selectedDoc.name}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
