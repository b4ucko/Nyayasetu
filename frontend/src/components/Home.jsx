import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Scale, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/schemes?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="w-full">
      {/* Search Hero Section (GovTech Style) */}
      <section className="bg-white border-b border-slate-200 py-16 md:py-24">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 font-serif">
            Digital Citizen Advocacy Platform
          </h1>
          <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
            Find government welfare schemes, understand legal notices, and verify official documents in seconds.
          </p>

          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mb-8">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-4 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-sm text-lg"
              placeholder="Search for schemes, services, or legal help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="absolute inset-y-2 right-2 px-6 bg-blue-900 text-white rounded-md hover:bg-blue-800 transition-colors font-medium"
            >
              Search
            </button>
          </form>

          <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-500">
            <span>Popular:</span>
            <button onClick={() => navigate('/schemes?q=PM+Kisan')} className="hover:text-blue-700 underline underline-offset-2">PM Kisan</button>
            <button onClick={() => navigate('/schemes?q=Mudra+Loan')} className="hover:text-blue-700 underline underline-offset-2">Mudra Loan</button>
            <button onClick={() => navigate('/notices')} className="hover:text-blue-700 underline underline-offset-2">Traffic Challan</button>
          </div>
        </div>
      </section>

      {/* Pathways / Action Cards */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-6 max-w-7xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 font-serif text-center">What do you need help with today?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Find Schemes Card */}
            <div className="gov-card p-6 flex flex-col h-full cursor-pointer group" onClick={() => navigate('/schemes')}>
              <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-lg flex items-center justify-center mb-6 border border-blue-100">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 font-serif">Find Welfare Schemes</h3>
              <p className="text-slate-600 mb-6 flex-grow text-sm leading-relaxed">
                Check eligibility and apply for over 500+ central and state government schemes tailored to your profile.
              </p>
              <div className="flex items-center text-blue-700 font-medium group-hover:text-blue-800">
                Start matching <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Legal Notice Card */}
            <div className="gov-card p-6 flex flex-col h-full cursor-pointer group" onClick={() => navigate('/notices')}>
              <div className="w-12 h-12 bg-indigo-50 text-indigo-700 rounded-lg flex items-center justify-center mb-6 border border-indigo-100">
                <Scale className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 font-serif">Analyze Legal Notice</h3>
              <p className="text-slate-600 mb-6 flex-grow text-sm leading-relaxed">
                Upload court summons, traffic challans, or legal notices to get a plain-language summary and auto-drafted response.
              </p>
              <div className="flex items-center text-indigo-700 font-medium group-hover:text-indigo-800">
                Upload notice <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Verify Document Card */}
            <div className="gov-card p-6 flex flex-col h-full cursor-pointer group" onClick={() => navigate('/documents')}>
              <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-lg flex items-center justify-center mb-6 border border-emerald-100">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 font-serif">Verify a Document</h3>
              <p className="text-slate-600 mb-6 flex-grow text-sm leading-relaxed">
                Scan certificates and official documents to verify digital signatures, QR codes, and prevent fraud.
              </p>
              <div className="flex items-center text-emerald-700 font-medium group-hover:text-emerald-800">
                Start verification <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* How it Works Stepper */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4 font-serif">How Nyayasetu Works</h2>
            <p className="text-slate-600">A secure, streamlined process to advocate for your rights.</p>
          </div>

          <div className="flex flex-col md:flex-row justify-between relative">
            {/* Desktop connecting line */}
            <div className="hidden md:block absolute top-6 left-[10%] right-[10%] h-0.5 bg-slate-200 -z-10"></div>
            
            {[
              { step: '01', title: 'Create Profile', desc: 'Securely enter your demographic details.' },
              { step: '02', title: 'AI Analysis', desc: 'Our engine crosses references official databases.' },
              { step: '03', title: 'Take Action', desc: 'Apply directly or generate legal responses.' }
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center text-center mb-10 md:mb-0 relative z-10 w-full md:w-1/3">
                <div className="w-12 h-12 bg-blue-900 text-white rounded-full flex items-center justify-center font-bold text-lg mb-6 shadow-sm ring-4 ring-white">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm max-w-[200px]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-slate-50 border-t border-slate-200">
         <div className="container mx-auto px-6 max-w-5xl text-center">
            <p className="text-sm font-medium text-slate-500 mb-6 uppercase tracking-wider">Built with Trusted Security Standards</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center opacity-70 grayscale">
              {/* Placeholder logos for trust - using text + icons as stand-ins */}
              <div className="flex items-center gap-2 text-slate-700 font-bold"><ShieldCheck className="w-5 h-5"/> 256-bit Encryption</div>
              <div className="flex items-center gap-2 text-slate-700 font-bold"><CheckCircle2 className="w-5 h-5"/> Privacy First</div>
              <div className="font-serif font-bold text-slate-700 text-lg border-2 border-slate-700 px-2 py-1 rounded">GOV.IN Standard</div>
            </div>
         </div>
      </section>
    </div>
  );
}
