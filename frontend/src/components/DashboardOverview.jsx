import React, { useState } from 'react';
import axios from 'axios';
import { CheckCircle, AlertCircle, PhoneCall, Link as LinkIcon, FileText, ChevronRight, Award, Zap, Activity, Clock, FileCheck2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardOverview({ userProfile, schemes }) {
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [applicationSteps, setApplicationSteps] = useState([]);
  const [loadingSteps, setLoadingSteps] = useState(false);

  // Mock application statuses for UI
  const myApplications = [
    { id: '102', name: 'PM Kisan Samman Nidhi', status: 'Pending', date: 'Oct 14, 2026', icon: <Clock className="w-5 h-5 text-orange-500" /> },
    { id: '204', name: 'Ayushman Bharat', status: 'Approved', date: 'Sep 22, 2026', icon: <CheckCircle className="w-5 h-5 text-green-500" /> }
  ];

  if (!userProfile) {
    return (
      <div className="flex flex-col items-center justify-center mt-20 p-12 glass rounded-3xl max-w-2xl mx-auto shadow-xl text-center">
        <AlertCircle className="w-20 h-20 text-red-400 mb-6 drop-shadow-md" />
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 transition-colors">Profile Required</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md transition-colors">Our Multi-Agent AI needs your details to scan government databases and find personalized matches.</p>
        <Link to="/dashboard/profile" className="bg-govorange hover:bg-orange-500 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform hover:scale-105">
          Go To Assessment
        </Link>
      </div>
    );
  }

  const handleApplyClick = async (schemeName) => {
    setSelectedScheme(schemeName);
    setLoadingSteps(true);
    setApplicationSteps([]);
    try {
      const response = await axios.get(`http://localhost:8000/api/scheme/${encodeURIComponent(schemeName)}/steps`);
      setApplicationSteps(response.data.steps);
    } catch (error) {
      console.error(error);
      setApplicationSteps(["Error communicating with Application Agent. Backend may be offline."]);
    } finally {
      setLoadingSteps(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto my-8 space-y-10">
      
      {/* Profile Summary Header */}
      <div className="glass dark:bg-slate-800/40 p-8 rounded-3xl shadow-lg border border-white dark:border-slate-700 flex flex-col md:flex-row justify-between items-center bg-gradient-to-r from-white/60 to-blue-50/40 dark:from-slate-800/60 dark:to-slate-900/40 relative overflow-hidden transition-colors">
        <div className="absolute right-0 top-0 w-64 h-64 bg-govblue/10 dark:bg-govblue/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 flex-1">
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight transition-colors">
            Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-govblue to-govorange">{userProfile.name}</span>!
          </h2>
          <p className="text-slate-600 dark:text-slate-300 font-medium mt-2 flex items-center transition-colors">
            <Zap className="w-4 h-4 text-govorange mr-2" /> Agentic Assessment scanned <strong className="mx-1 text-slate-800 dark:text-white">140+</strong> active policies for you.
          </p>
        </div>
        <div className="relative z-10 mt-6 md:mt-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur border border-green-100 dark:border-green-900/50 text-govgreen dark:text-green-400 px-6 py-4 rounded-2xl shadow-sm flex flex-col items-center transition-colors">
          <span className="text-3xl font-black">{schemes.length}</span>
          <span className="text-xs font-bold uppercase tracking-wider text-green-700 dark:text-green-400 mt-1 flex items-center">
            <CheckCircle className="w-3 h-3 mr-1" /> Matches Found
          </span>
        </div>
      </div>

      {/* NEW: Application Tracking Section */}
      <div className="glass dark:bg-slate-800/40 p-8 rounded-3xl shadow-md border border-white dark:border-slate-700 transition-colors">
         <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
               <Activity className="w-6 h-6 text-govorange mr-3" />
               <h3 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors">Application Status</h3>
            </div>
            <Link to="/dashboard/schemes" className="text-govblue dark:text-blue-400 hover:underline text-sm font-bold transition-colors">Find more schemes &rarr;</Link>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myApplications.map(app => (
               <div key={app.id} className="bg-white dark:bg-slate-700/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-600 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-4">
                     <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-600 transition-colors">
                        <FileCheck2 className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                     </div>
                     <span className={`px-3 py-1 text-xs font-bold rounded-full flex items-center space-x-1 ${app.status === 'Approved' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                        {app.icon} <span>{app.status}</span>
                     </span>
                  </div>
                  <div>
                     <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-1 transition-colors">ID: #{app.id}</p>
                     <h4 className="font-bold text-slate-800 dark:text-slate-200 leading-tight mb-1 transition-colors">{app.name}</h4>
                     <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">Submitted: {app.date}</p>
                  </div>
               </div>
            ))}
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Schemes List Column */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center mb-6">
            <Award className="w-6 h-6 text-govblue dark:text-blue-400 mr-3 transition-colors" />
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors">Your Recommended Schemes</h3>
          </div>
          
          {schemes.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-3xl bg-white/50 dark:bg-slate-800/50 backdrop-blur transition-colors">
              <p className="text-lg font-medium">No exact match found based on current profile inputs.</p>
              <p className="text-sm mt-2">Try updating your assessment parameters.</p>
            </div>
          ) : (
            schemes.map((scheme, idx) => (
               <div key={idx} className="glass dark:bg-slate-800/40 p-8 rounded-3xl shadow-md border border-white dark:border-slate-700 hover:border-govblue/30 dark:hover:border-govblue/50 transition-all duration-300 hover:shadow-xl group relative overflow-hidden">
                  
                  {/* Decorative corner */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-govblue/5 dark:bg-govblue/10 rounded-full blur-2xl group-hover:bg-govblue/10 dark:group-hover:bg-govblue/20 transition-colors"></div>

                  <div className="flex justify-between items-start mb-5 relative z-10 gap-4">
                    <h4 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight transition-colors">{scheme.scheme_name}</h4>
                    <span className="bg-gradient-to-r from-govblue to-blue-600 text-white text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wide shadow-sm whitespace-nowrap shrink-0">
                      98% AI Match
                    </span>
                  </div>
                  
                  <div className="bg-white/60 dark:bg-slate-900/50 p-5 rounded-2xl text-sm text-slate-700 dark:text-slate-300 mb-6 border border-orange-100 dark:border-slate-600 shadow-sm relative z-10 hover:bg-white/80 dark:hover:bg-slate-900/80 transition-colors">
                    <div className="flex items-center mb-2">
                       <Zap className="w-4 h-4 text-govorange mr-2" />
                       <strong className="text-slate-800 dark:text-slate-200 font-bold transition-colors">Reasoning Agent Output:</strong>
                    </div>
                    <p className="leading-relaxed">{scheme.reason}</p>
                  </div>
                  
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-8 whitespace-pre-wrap leading-relaxed relative z-10 transition-colors">
                    {scheme.details}
                  </div>

                  <button 
                    onClick={() => handleApplyClick(scheme.scheme_name)}
                    className="relative z-10 group/btn bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 hover:border-govgreen dark:hover:border-govgreen hover:bg-green-50 dark:hover:bg-green-900/20 text-slate-700 dark:text-slate-200 font-bold py-3 px-6 rounded-xl flex items-center transition-all duration-300 shadow-sm"
                  >
                    <span className="group-hover/btn:text-govgreen transition-colors">Initiate AI Application Assist</span>
                    <ChevronRight className="w-5 h-5 ml-2 text-slate-400 group-hover/btn:translate-x-1 group-hover/btn:text-govgreen transition-all" />
                  </button>
               </div>
            ))
          )}
        </div>

        {/* Application Assistant Panel */}
        <div className="lg:col-span-4 relative">
          <div className="glass p-6 rounded-3xl sticky top-28 shadow-2xl border border-white/50 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border border-slate-700 overflow-hidden group">
            
            {/* Ambient Background Glow inside the dark panel */}
            <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-bl from-govblue/20 to-transparent blur-3xl opacity-50 pointer-events-none"></div>

            <h3 className="text-xl font-bold text-white border-b border-white/10 pb-4 mb-6 flex items-center relative z-10">
              <PhoneCall className="w-5 h-5 mr-3 text-govorange animate-pulse" /> 
              Application Assistant
            </h3>
            
            <div className="relative z-10">
              {!selectedScheme ? (
                <div className="text-center py-10 px-4">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                     <FileText className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed font-medium">
                    Select <strong className="text-white">"Initiate AI Application Assist"</strong> on any scheme to receive personalized, step-by-step guidance.
                  </p>
                </div>
              ) : (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl font-semibold text-sm border border-white/10 shadow-inner">
                    <span className="block text-xs text-govorange uppercase tracking-wider mb-1 font-bold">Actively Guiding</span>
                    <span className="text-white text-base leading-tight">{selectedScheme}</span>
                  </div>
                  
                  {loadingSteps ? (
                    <div className="flex flex-col items-center py-12">
                       <Zap className="w-8 h-8 text-govorange animate-bounce mb-3" />
                       <p className="text-slate-300 text-sm font-medium animate-pulse">Agent is generating instructions...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative border-l-2 border-white/10 ml-3 space-y-6 pb-4">
                        {applicationSteps.map((step, idx) => (
                          <div key={idx} className="relative pl-6 hover:bg-white/5 p-3 rounded-xl transition-colors -ml-3 cursor-default">
                            {/* Timeline Node */}
                            <div className="absolute -left-[18px] top-4 w-4 h-4 bg-govorange rounded-full border-4 border-slate-900 shadow-[0_0_10px_rgba(255,153,51,0.5)]"></div>
                            
                            <p className="text-sm text-slate-200 leading-relaxed font-medium">{step}</p>
                          </div>
                        ))}
                      </div>
                      
                      {applicationSteps.length > 0 && (
                        <div className="pt-4 border-t border-white/10 mt-4">
                          <button className="w-full bg-gradient-to-r from-govblue to-blue-600 hover:scale-[1.02] text-white font-bold py-3.5 px-6 rounded-xl text-sm flex justify-center items-center transition-transform shadow-lg shadow-blue-500/30">
                            <LinkIcon className="w-4 h-4 mr-2" /> Proceed to Official Portal
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
