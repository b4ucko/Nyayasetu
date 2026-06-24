import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, Search, Users, ArrowRight, Sparkles, Zap, PhoneCall, FileText, CreditCard, Globe, UserPlus, Car, UserCheck, ShoppingBag, Heart, GraduationCap, Landmark, X, MessageSquare, ExternalLink, HelpCircle, BookOpen } from 'lucide-react';
import ServiceBot from './ServiceBot';
import { useAuth } from '../hooks/useAuth';
import { documentGuides } from '../data/documentGuides';

const essentialDocuments = [
  { id: 'aadhaar', name: 'Aadhaar Card', icon: CreditCard, desc: 'A 12-digit unique ID essential for banking, government schemes, tax compliance, and subsidies.' },
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
  { type: 'platform', id: 'edistrict', name: 'e-District Services', icon: FileText, desc: 'Offers online applications for various certificates, licenses, and registrations with document uploads and tracking.' },
  { type: 'platform', id: 'myscheme', name: 'myScheme Portal', icon: Sparkles, desc: 'Search, discover, and apply for government schemes via a 3-step process covering education, health, and more.' },
  { type: 'platform', id: 'vault', name: 'Secure Document Vault', icon: ShieldCheck, desc: 'A local-first, highly secure digital vault to upload and store your crucial certificates and identity cards locally, fully protected.' },
  { type: 'platform', id: 'umang', name: 'UMANG / Unified Portal', icon: Users, desc: 'Provides end-to-end online access to government services with seamless cross-department database integration.' }
];

export default function Home({ openBot }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [selectedDoc, setSelectedDoc] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const handleItemClick = (item, type = 'document') => {
    if (type === 'platform' && openBot) {
      openBot({ ...item, type });
    } else if (type === 'document') {
      setSelectedDoc(item);
      setActiveTab('overview');
    }
  };

  // Cinematic Scroll Animation Logic
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
        } else {
          entry.target.classList.remove('is-revealed');
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });

    const revealElements = document.querySelectorAll('.reveal-up, .reveal-scale, .reveal-left, .reveal-right');
    revealElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center pt-16 pb-32 text-center w-full relative overflow-hidden">
      
      {/* Hero Background Elements Removed */}


      {/* Hero Title */}
      <h1 className="relative z-10 text-6xl md:text-8xl font-black text-slate-900 dark:text-white mb-8 tracking-tight leading-[1.1] max-w-5xl transition-colors drop-shadow-2xl dark:drop-shadow-[0_10px_10px_rgba(255,255,255,0.05)]">
        Stop Guessing. <br className="hidden md:block" />
        Start <span className="bg-gradient-to-r from-govblue via-indigo-500 to-govorange text-transparent bg-clip-text animate-gradient-x drop-shadow-lg">Claiming.</span>
      </h1>
      
      {/* Hero Subtitle */}
      <p className="relative z-10 text-xl md:text-2xl text-slate-700 dark:text-slate-300 mb-14 max-w-3xl font-medium leading-relaxed transition-colors drop-shadow-sm">
        Our multi-agent AI engine reads through thousands of pages of complex government policies instantly to match you with the exact benefits you deserve. 
      </p>
      
      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-6 relative z-10 w-full sm:w-auto px-4">
        {user ? (
          <button 
            onClick={() => navigate('/voice')}
            className="group relative inline-flex items-center justify-center px-10 py-5 font-bold text-white transition-all duration-300 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl overflow-hidden hover:scale-105 shadow-xl hover:shadow-emerald-500/50 w-full sm:w-auto"
          >
            <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black pointer-events-none"></span>
            <span className="relative flex items-center text-xl">
              Start the conversation
              <MessageSquare className="ml-3 w-6 h-6 group-hover:scale-110 transition-transform" />
            </span>
          </button>
        ) : (
          <button 
            onClick={() => navigate('/login')}
            className="group relative inline-flex items-center justify-center px-10 py-5 font-bold text-white transition-all duration-300 bg-gradient-to-r from-govblue to-blue-600 rounded-2xl overflow-hidden hover:scale-105 shadow-xl hover:shadow-blue-500/50 w-full sm:w-auto"
          >
            <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black pointer-events-none"></span>
            <span className="relative flex items-center text-xl">
              Create Free Account
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        )}

        <button 
          onClick={() => navigate('/dashboard')}
          className="group inline-flex items-center justify-center px-10 py-5 font-bold text-slate-700 dark:text-slate-200 transition-all duration-300 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 hover:scale-[1.02] shadow-sm w-full sm:w-auto"
        >
          <span className="relative flex items-center text-xl">
            My Profile
          </span>
        </button>
      </div>

      {/* Stats Section */}
      <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl w-full bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl py-10 px-6 shadow-xl dark:shadow-2xl transition-all relative z-10">
         <div>
            <h4 className="text-4xl md:text-5xl font-black text-govblue dark:text-blue-400 drop-shadow-md">5,000+</h4>
            <p className="text-slate-600 dark:text-slate-300 font-bold mt-2 tracking-wide text-sm uppercase">Schemes Indexed</p>
         </div>
         <div>
            <h4 className="text-4xl md:text-5xl font-black text-govorange dark:text-orange-400 drop-shadow-md">99%</h4>
            <p className="text-slate-600 dark:text-slate-300 font-bold mt-2 tracking-wide text-sm uppercase">Accuracy Rate</p>
         </div>
         <div>
            <h4 className="text-4xl md:text-5xl font-black text-govgreen dark:text-green-400 drop-shadow-md">100%</h4>
            <p className="text-slate-600 dark:text-slate-300 font-bold mt-2 tracking-wide text-sm uppercase">Free to Use</p>
         </div>
         <div>
            <h4 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white drop-shadow-md">24/7</h4>
            <p className="text-slate-600 dark:text-slate-300 font-bold mt-2 tracking-wide text-sm uppercase">AI Availability</p>
         </div>
      </div>

      <div className="mt-32 w-full max-w-6xl">
        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 dark:text-white mb-16 transition-colors">How Nyayasetu Works</h2>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          
          {/* Card 1 */}
          <div className="group relative glass overflow-hidden rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 flex flex-col items-center text-center reveal-up delay-100">
            <div className="absolute inset-0 bg-[url('/images/doc_abstract_1774086586172.png')] bg-cover bg-center opacity-80 group-hover:scale-110 transition-transform duration-700"></div>
            <div className="absolute inset-0 bg-slate-900/70 group-hover:bg-slate-900/60 transition-colors duration-500"></div>
            <div className="relative z-10 p-10 flex flex-col items-center h-full">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-all duration-300 border border-white/20">
                <Zap className="w-10 h-10 text-blue-300" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 transition-colors">1. Profile Extraction</h3>
              <p className="text-slate-200 leading-relaxed font-medium transition-colors mb-6">Upload your Aadhar or fill out a quick form. Our AI extracts your demographic details securely and accurately instantly.</p>
              <button 
                onClick={() => navigate('/dashboard')}
                className="mt-auto inline-flex justify-center items-center w-full px-6 py-3 bg-govblue/90 text-white font-bold rounded-xl hover:bg-govblue transition-colors shadow-lg hover:shadow-blue-500/20"
              >
                Extract Profile <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>

          {/* Card 2 */}
          <div className="group relative glass overflow-hidden rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 flex flex-col items-center text-center md:-translate-y-6 reveal-up delay-200">
            <div className="absolute z-20 -top-4 -right-4 bg-govorange text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg animate-pulse">Core Feature</div>
            <div className="absolute inset-0 bg-[url('/images/ai_engine_1774086623482.png')] bg-cover bg-center opacity-80 group-hover:scale-110 transition-transform duration-700"></div>
            <div className="absolute inset-0 bg-slate-900/70 group-hover:bg-slate-900/60 transition-colors duration-500"></div>
            <div className="relative z-10 p-10 flex flex-col items-center h-full">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-all duration-300 border border-white/20">
                <Search className="w-10 h-10 text-orange-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 transition-colors">2. Semantic Matching</h3>
              <p className="text-slate-200 leading-relaxed font-medium transition-colors mb-6">We use RAG (Retrieval-Augmented Generation) to cross-reference your profile against thousands of official government directives.</p>
              <button 
                onClick={() => navigate('/schemes')}
                className="mt-auto inline-flex justify-center items-center w-full px-6 py-3 bg-govorange/90 text-white font-bold rounded-xl hover:bg-govorange transition-colors shadow-lg hover:shadow-orange-500/20"
              >
                Launch Matcher <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>

          {/* Card 3 */}
          <div className="group relative glass overflow-hidden rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 flex flex-col items-center text-center reveal-up delay-300">
            <div className="absolute inset-0 bg-[url('/images/voice_assist_1774086640958.png')] bg-cover bg-center opacity-80 group-hover:scale-110 transition-transform duration-700"></div>
            <div className="absolute inset-0 bg-slate-900/70 group-hover:bg-slate-900/60 transition-colors duration-500"></div>
            <div className="relative z-10 p-10 flex flex-col items-center h-full">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-all duration-300 border border-white/20">
                <PhoneCall className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 transition-colors">3. Voice Assistance</h3>
              <p className="text-slate-200 leading-relaxed font-medium transition-colors mb-6">Have questions? Talk to our Voice AI in your regional language for step-by-step guidance on gathering documents and applying.</p>
              <button 
                onClick={() => navigate('/voice')}
                className="mt-auto inline-flex justify-center items-center w-full px-6 py-3 bg-green-500/90 text-white font-bold rounded-xl hover:bg-green-500 transition-colors shadow-lg hover:shadow-green-500/20"
              >
                Launch Voice Tool <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Document Scanning Feature Block */}
      <div className="mt-32 w-full max-w-6xl px-4 animate-fade-in-up reveal-scale delay-100">
        <div className="relative bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 rounded-3xl overflow-hidden shadow-2xl border border-indigo-500/30">
          <div className="absolute inset-0 bg-[url('/images/doc_abstract_1774086586172.png')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/10 to-transparent"></div>
          
          <div className="relative z-10 p-10 md:p-16 flex flex-col md:flex-row items-center justify-between">
            <div className="flex-1 md:mr-12 mb-10 md:mb-0 text-center md:text-left flex flex-col items-center md:items-start">
              <div className="inline-flex items-center space-x-2 bg-indigo-500/20 text-indigo-300 font-bold px-4 py-2 rounded-full mb-6 border border-indigo-500/30">
                <span className="relative flex h-3 w-3 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                </span>
                New Feature
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">Instantly Scan, Verify & <span className="text-red-400">Detect Fraud</span></h2>
              <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                Upload physical documents or images. Our <strong className="text-white">Fraud Detection AI</strong> visually verifies data, extracts key text perfectly, cross-references sources, and detects forged seals or manipulated dates instantly. Supported in multiple regional languages.
              </p>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/documents');
                }}
                className="group inline-flex items-center bg-white text-indigo-900 font-black px-8 py-4 rounded-xl shadow-lg hover:shadow-indigo-500/25 hover:bg-slate-50 transition-all duration-300 hover:scale-105"
              >
                Launch Document Scanner
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            {/* Visual Scanning Animation Element */}
            <div className="relative w-full md:w-1/3 flex justify-center perspective-1000">
              <div 
                onClick={() => navigate('/documents')}
                className="relative w-64 h-80 bg-slate-800 rounded-2xl border-4 border-slate-700 shadow-2xl overflow-hidden flex flex-col items-center justify-center group-hover:border-indigo-500 transition-colors cursor-pointer transform hover:rotate-y-6 hover:scale-105 duration-500"
                title="Click to quickly launch scanning"
              >
                 <FileText className="w-24 h-24 text-slate-600 mb-4" />
                 {/* CSS Scanning line */}
                 <div className="absolute inset-x-0 h-1 bg-indigo-400 shadow-[0_0_15px_rgba(99,102,241,1)]" style={{ animation: 'scan 3s ease-in-out infinite alternate', top: '10%' }}></div>
                 <p className="text-slate-500 font-bold text-sm tracking-widest uppercase mt-4">Document.pdf</p>
                 <style>{`@keyframes scan { 0% { top: 0%; transform: translateY(0); } 100% { top: 100%; transform: translateY(-100%); } }`}</style>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legal Notices Analytics Feature Block */}
      <div className="mt-20 w-full max-w-6xl px-4 animate-fade-in-up reveal-scale delay-200">
        <div className="relative bg-gradient-to-r from-slate-900 via-rose-900 to-red-950 rounded-3xl overflow-hidden shadow-2xl border border-rose-500/30 w-full flex flex-col md:flex-row-reverse items-center justify-between">
          <div className="absolute inset-0 bg-[url('/images/doc_abstract_1774086586172.png')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-rose-500/10 to-transparent"></div>
          
          <div className="relative z-10 p-10 md:p-16 flex flex-col items-center md:items-start text-center md:text-left w-full md:w-3/5">
            <div className="inline-flex items-center space-x-2 bg-rose-500/20 text-rose-300 font-bold px-4 py-2 rounded-full mb-6 border border-rose-500/30">
              <span className="relative flex h-3 w-3 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
              Legal Assessor AI
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">Decode & Defend <br className="hidden md:block" /> against Legal Notices</h2>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
              Received a mysterious traffic challan or tax notice? Upload it to our <strong className="text-white">Legal Analyzer Engine</strong> to instantly verify its authenticity, understand your rights in plain language, and automatically draft a highly professional legal reply.
            </p>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                navigate('/notices');
              }}
              className="group inline-flex items-center bg-white text-rose-900 font-black px-8 py-4 rounded-xl shadow-lg hover:shadow-rose-500/25 hover:bg-slate-50 transition-all duration-300 hover:scale-105"
            >
              Analyze Legal Notice
              <ShieldCheck className="w-5 h-5 ml-3 group-hover:scale-110 transition-transform" />
            </button>
          </div>
          
          {/* Visual Element */}
          <div className="relative w-full md:w-2/5 flex justify-center perspective-1000 p-10">
            <div 
              onClick={() => navigate('/notices')}
              className="relative w-64 h-80 bg-slate-800 rounded-2xl border-4 border-rose-900/50 shadow-2xl overflow-hidden flex flex-col items-center justify-center hover:border-rose-500 transition-colors cursor-pointer transform hover:rotate-y-12 hover:-rotate-z-6 hover:scale-105 duration-500 group"
              title="Click to check notices"
            >
               <FileText className="w-24 h-24 text-rose-500/50 mb-4 scale-x-[-1] group-hover:text-rose-400 transition-colors" />
               <div className="absolute inset-0 bg-red-500/5 mix-blend-color animate-pulse"></div>
               <div className="absolute inset-x-0 w-full h-0.5 bg-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.8)] border-y border-rose-400 group-hover:scale-y-150 transition-transform" style={{ animation: 'scan 3s ease-in-out infinite alternate-reverse', top: '10%' }}></div>
               <p className="text-rose-300 font-bold text-sm tracking-widest uppercase mt-4 z-10 bg-slate-900 px-3 py-1 rounded-full border border-rose-900/30 shadow-lg">Notice.pdf</p>
            </div>
          </div>
        </div>
      </div>

      {/* Essential Documents Widgets Section */}
      <div className="mt-32 w-full max-w-7xl px-4">
        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 dark:text-white mb-6 text-center transition-colors">Essential Documents</h2>
        <p className="text-xl text-slate-600 dark:text-slate-400 mb-12 text-center max-w-3xl mx-auto">
          Keep these documents secure. Choose a document to learn how to apply or update it.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {essentialDocuments.map((doc) => {
            const IconComponent = doc.icon;
            return (
              <div 
                key={doc.id}
                onClick={() => handleItemClick(doc, 'document')}
                className="group relative glass dark:bg-slate-800/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 hover:-translate-y-2 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full reveal-up"
              >
                {/* Default State (Now showing content) */}
                <div className="flex flex-col h-full transition-transform duration-300 group-hover:-translate-y-8 group-hover:opacity-0 relative z-10 w-full bg-transparent">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-slate-700 rounded-xl flex items-center justify-center shrink-0">
                      <IconComponent className="w-6 h-6 text-govblue dark:text-govorange" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">{doc.name}</h3>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium mt-2">
                    {doc.desc}
                  </p>
                </div>

                {/* Hover Reveal State (Dynamic Colorful) */}
                <div className="absolute inset-0 p-6 flex flex-col justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 z-20 pointer-events-none overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-blue-600 to-cyan-500 opacity-95"></div>
                  {/* Decorative mesh element */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-300/30 rounded-full blur-2xl"></div>
                  
                  <div className="relative flex flex-col h-full justify-between translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2 flex items-center">
                        <IconComponent className="w-5 h-5 mr-2 text-blue-200" />
                        {doc.name}
                      </h3>
                      <p className="text-sm text-blue-50 leading-relaxed overflow-hidden text-ellipsis line-clamp-4">
                        {doc.desc}
                      </p>
                    </div>
                    <div className="flex items-center text-sm font-bold text-white mt-auto pt-2 bg-black/20 self-start px-4 py-2 rounded-full backdrop-blur-md shadow-lg border border-white/20">
                      Get Application Info <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Integrated Government Platforms Section */}
      <div className="mt-32 w-full max-w-7xl px-4">
        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 dark:text-white mb-6 text-center transition-colors">Integrated Platforms</h2>
        <p className="text-xl text-slate-600 dark:text-slate-400 mb-12 text-center max-w-3xl mx-auto">
          Access specialized national and state portals directly. Click any platform to get a step-by-step registration and usage guide.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {integratedPlatforms.map((platform) => {
            const IconComponent = platform.icon;
            return (
              <div 
                key={platform.id}
                onClick={() => handleItemClick(platform, 'platform')}
                className="group relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-8 rounded-3xl border border-slate-200 dark:border-slate-700 hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-500 cursor-pointer flex flex-col items-start text-left overflow-hidden h-full transform hover:-translate-y-1 reveal-scale delay-150"
              >
                {/* Background Image (Hover Only) */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none z-0 overflow-hidden">
                   <div className="absolute inset-0 bg-[url('/images/gov_portal_1774086605555.png')] bg-cover bg-center scale-110 group-hover:scale-100 transition-transform duration-700"></div>
                </div>

                {/* Permanent Content State */}
                <div className="flex flex-col relative z-10 w-full h-full">
                  <div className="flex items-center space-x-5 mb-5">
                    <div className="w-16 h-16 bg-orange-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-colors group-hover:bg-govorange group-hover:text-white">
                      <IconComponent className="w-8 h-8 text-govorange group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white group-hover:text-govorange transition-colors">{platform.name}</h3>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed flex-grow">
                    {platform.desc}
                  </p>
                  <div className="flex items-center text-sm font-bold text-govblue dark:text-blue-400 mt-6 pt-2 self-start transition-colors group-hover:text-govorange">
                    Launch Chatbot Guide <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    {/* Essential Document Guide Modal */}
    {selectedDoc && (() => {
      const docData = documentGuides[selectedDoc.id];
      if (!docData) return null;
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in" onClick={() => setSelectedDoc(null)}>
          <div 
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-800/85 overflow-hidden transform transition-all duration-305 scale-100" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-govblue/20 to-indigo-500/20 dark:from-slate-800 dark:to-slate-700/50 rounded-2xl flex items-center justify-center shrink-0 border border-indigo-500/10 shadow-sm">
                  {React.createElement(selectedDoc.icon, { className: "w-7 h-7 text-govorange" })}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{docData.name} Guide</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold tracking-wide">Nyayasetu Smart Verification System</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedDoc(null)} 
                className="p-2.5 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 dark:text-slate-400"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 overflow-x-auto custom-scrollbar bg-slate-50/20 dark:bg-slate-900/20">
              {[
                { id: 'overview', label: 'Overview & FAQ', icon: BookOpen },
                { id: 'requirements', label: 'Documents Required', icon: FileText },
                { id: 'apply', label: 'Steps to Apply', icon: Zap },
                { id: 'edit', label: 'Update & Correction', icon: ShieldCheck }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[150px] py-4 px-4 font-bold text-sm tracking-wide border-b-2 flex items-center justify-center space-x-2.5 transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'border-govblue text-govblue dark:border-blue-400 dark:text-blue-400 bg-blue-50/30 dark:bg-slate-800/40'
                      : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50/50 dark:hover:bg-slate-800/10'
                  }`}
                >
                  {React.createElement(tab.icon, { className: "w-4 h-4 shrink-0" })}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
            
            {/* Modal Content */}
            <div className="p-8 overflow-y-auto flex-1 custom-scrollbar max-h-[55vh] bg-transparent text-left">
              
              {/* Overview & FAQ Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-8 animate-fade-in text-left">
                  <div className="bg-gradient-to-r from-govblue/5 to-indigo-500/5 dark:from-slate-850/50 dark:to-slate-800/30 border border-slate-150 dark:border-slate-800/80 p-6 rounded-2xl">
                    <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">About {docData.name}</h4>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{docData.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-xl font-extrabold text-slate-850 dark:text-white mb-5 flex items-center">
                      <HelpCircle className="w-5 h-5 mr-2.5 text-govorange" />
                      Frequently Asked Questions
                    </h4>
                    <div className="grid gap-4">
                      {docData.faq.map((item, idx) => (
                        <div key={idx} className="border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 bg-white dark:bg-slate-900/30 hover:border-govblue/20 dark:hover:border-blue-900/30 transition-all text-left">
                          <h5 className="font-extrabold text-slate-800 dark:text-slate-100 flex items-start space-x-3 text-base">
                            <span className="text-govorange dark:text-orange-400 font-black shrink-0">Q:</span>
                            <span>{item.q}</span>
                          </h5>
                          <p className="text-slate-600 dark:text-slate-400 font-medium pl-7 mt-2 leading-relaxed text-sm">
                            {item.a}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Documents Required Tab */}
              {activeTab === 'requirements' && (
                <div className="space-y-6 animate-fade-in text-left">
                  <p className="text-slate-600 dark:text-slate-400 font-medium text-base mb-2">
                    Make sure to gather one of the verified examples from each of the required document categories below:
                  </p>
                  <div className="grid gap-5">
                    {docData.documentsRequired.map((req, idx) => (
                      <div key={idx} className="flex items-start space-x-4 bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl hover:border-govorange/20 dark:hover:border-orange-900/20 transition-all text-left">
                        <div className="w-10 h-10 bg-govorange/10 dark:bg-orange-500/10 rounded-xl flex items-center justify-center shrink-0 border border-orange-500/10">
                          <FileText className="w-5 h-5 text-govorange" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-1.5">{req.name}</h4>
                          <p className="text-slate-650 dark:text-slate-400 text-sm font-medium leading-normal">
                            <strong className="text-slate-700 dark:text-slate-300">Acceptable Examples:</strong> {req.examples}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Steps to Apply Tab */}
              {activeTab === 'apply' && (
                <div className="space-y-8 pl-4 animate-fade-in text-left">
                  <p className="text-slate-600 dark:text-slate-400 font-medium text-base mb-4 font-semibold">
                    Follow this step-by-step procedure to file a new application for your {docData.name}:
                  </p>
                  <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-4 pl-8 space-y-8 text-left">
                    {docData.applySteps.map((step, idx) => (
                      <div key={idx} className="relative group text-left">
                        {/* Circle node with step number */}
                        <div className="absolute -left-[45px] top-0 w-8 h-8 bg-gradient-to-br from-govblue to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-md border-4 border-white dark:border-slate-900 group-hover:scale-110 transition-transform">
                          {idx + 1}
                        </div>
                        <div className="bg-slate-50/40 dark:bg-slate-800/10 border border-transparent hover:border-slate-100 dark:hover:border-slate-800/80 p-5 rounded-2xl transition-all">
                          <h4 className="text-md font-bold text-slate-850 dark:text-white mb-1">Step {idx + 1}</h4>
                          <p className="text-slate-600 dark:text-slate-300 text-sm font-medium leading-relaxed">
                            {step}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Correction & Update Tab */}
              {activeTab === 'edit' && (
                <div className="space-y-8 pl-4 animate-fade-in text-left">
                  <p className="text-slate-600 dark:text-slate-400 font-medium text-base mb-4 font-semibold">
                    Need to update or correct your {docData.name}? Follow these steps to submit edits:
                  </p>
                  <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-4 pl-8 space-y-8 text-left">
                    {docData.editSteps.map((step, idx) => (
                      <div key={idx} className="relative group text-left">
                        {/* Circle node with step number */}
                        <div className="absolute -left-[45px] top-0 w-8 h-8 bg-gradient-to-br from-govorange to-amber-500 dark:from-orange-500 dark:to-amber-500 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-md border-4 border-white dark:border-slate-900 group-hover:scale-110 transition-transform">
                          {idx + 1}
                        </div>
                        <div className="bg-slate-50/40 dark:bg-slate-800/10 border border-transparent hover:border-slate-100 dark:hover:border-slate-800/80 p-5 rounded-2xl transition-all text-left">
                          <h4 className="text-md font-bold text-slate-850 dark:text-white mb-1">Step {idx + 1}</h4>
                          <p className="text-slate-650 dark:text-slate-300 text-sm font-medium leading-relaxed">
                            {step}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block mb-1">Official Government Link</span>
                <span className="text-sm text-govblue dark:text-blue-400 font-bold break-all">{docData.portalUrl}</span>
              </div>
              
              <a
                href={docData.portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3.5 bg-gradient-to-r from-govblue to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/20 hover:scale-102 active:scale-98 transition-all shrink-0 w-full sm:w-auto justify-center text-sm"
              >
                <span>Visit Official Portal</span>
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </div>
          </div>
        </div>
      );
    })()}

    </div>
  );
}
