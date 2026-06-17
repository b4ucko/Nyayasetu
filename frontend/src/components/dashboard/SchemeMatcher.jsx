import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../supabase';
import { ProgressiveFluxLoader } from '../ui/progressive-flux-loader';

const SCHEME_PHASES = [
  { at: 0, label: "Extracting profile facts..." },
  { at: 20, label: "Scanning 300+ active government policies..." },
  { at: 50, label: "Matching eligibility criteria..." },
  { at: 75, label: "Calculating final match scores..." },
  { at: 95, label: "Finalizing your report..." },
];

export default function SchemeMatcher() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterState, setFilterState] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [errorMsg, setErrorMsg] = useState('');

  // States to delay display until animation finishes
  const [tempSchemes, setTempSchemes] = useState(null);
  const [animationDone, setAnimationDone] = useState(false);
  const [progress, setProgress] = useState(0);

  // Hardcoded for prototype; ideally derived dynamically or fetched from backend
  const availableStates = ['All', 'Maharashtra', 'Karnataka', 'Delhi', 'Gujarat', 'Uttar Pradesh'];
  const availableCategories = ['All', 'Agriculture', 'Health', 'Education', 'Housing', 'Finance'];

  useEffect(() => {
    if (user) {
      const cached = localStorage.getItem(`omnigov_schemes_${user.id}`);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
             setSchemes(parsed);
          }
        } catch (e) {
          console.error("Cache parse error", e);
        }
      }
    }
  }, [user]);

  // Wait for both API response and animation to be complete before showing results
  useEffect(() => {
    if (tempSchemes && animationDone) {
      setSchemes(tempSchemes);
      if (user) {
        localStorage.setItem(`omnigov_schemes_${user.id}`, JSON.stringify(tempSchemes));
      }
      setLoading(false);
      setTempSchemes(null);
      setAnimationDone(false);
    }
  }, [tempSchemes, animationDone, user]);

  const matchSchemes = async () => {
    if (!user) {
      alert("Please log in to match schemes.");
      navigate('/login');
      return;
    }

    setLoading(true);
    setProgress(0);
    setTempSchemes(null);
    setAnimationDone(false);

    // Simulate progress starting from 0, approaching 95% logarithmically
    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      const remaining = 95 - currentProgress;
      const step = Math.max(1, remaining * 0.15); // decelerate as we get closer to 95%
      currentProgress = Math.min(95, currentProgress + step);
      setProgress(currentProgress);
    }, 250);

    try {
      // 1. Fetch real user profile from Supabase
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      let profileData = {};
      if (data && !error) {
        profileData = data;
      } else {
        console.warn("No specific profile found in Supabase. Falling back.");
        profileData = { age: 'unknown', occupation: 'unknown', state: 'unknown' };
      }

      // Construct payload matching backend UserProfile BaseModel
      const payload = {
        name: profileData.name || "Citizen",
        age: Number(profileData.age) || 30,
        occupation: profileData.occupation || "Unemployed",
        income: Number(profileData.income) || 0,
        state: profileData.state || "Maharashtra",
        land_acres: 0,
        gender: profileData.gender || "",
        marital_status: profileData.marital_status || "",
        caste: profileData.caste || "",
        disability: profileData.disability || "No",
        education: profileData.education || "",
        filterState: filterState !== 'All' ? filterState : "",
        filterCategory: filterCategory !== 'All' ? filterCategory : ""
      };

      // 2. Call backend with real profile
      const response = await axios.post('http://localhost:8000/api/ai/match', payload, { timeout: 120000 });

      const processedSchemes = (response.data.schemes || []).map(s => ({
        ...s,
        category: s.category || ['Agriculture', 'Health', 'Education'][Math.floor(Math.random() * 3)],
        stateApplicability: s.stateApplicability || 'All'
      }));
      
      clearInterval(progressInterval);
      setProgress(100);
      setTempSchemes(processedSchemes);
      setErrorMsg('');
    } catch (error) {
      console.error("Error matching schemes:", error);
      setErrorMsg("Backend timeout or API Key error. Showing fallback schemes.");
      // Fallback mock data if backend fails
      const fallbackSchemes = [
        { id: 'pm-kisan', name: 'PM Kisan Samman Nidhi', description: 'Income support to land-holding farmers.', eligibilityScore: 95, category: 'Agriculture', stateApplicability: 'All', officialWebsite: 'https://pmkisan.gov.in/' },
        { id: 'ayushman', name: 'Ayushman Bharat', description: 'Universal health coverage scheme.', eligibilityScore: 88, category: 'Health', stateApplicability: 'All', officialWebsite: 'https://pmjay.gov.in/' }
      ];
      clearInterval(progressInterval);
      setProgress(100);
      setTempSchemes(fallbackSchemes);
    }
  };

  const filteredSchemes = useMemo(() => {
    return (schemes || []).filter(scheme => {
      const matchState = filterState === 'All' || scheme.stateApplicability === 'All' || scheme.stateApplicability === filterState;
      const matchCategory = filterCategory === 'All' || scheme.category === filterCategory;
      return matchState && matchCategory;
    });
  }, [schemes, filterState, filterCategory]);

  return (
    <div className="p-6 glass dark:bg-slate-800/50 rounded-2xl shadow-xl max-w-5xl mx-auto border border-white dark:border-slate-700 transition-colors text-left">
      {loading ? (
        <div className="py-20 bg-white/40 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-850 rounded-2xl flex flex-col items-center justify-center shadow-inner animate-fade-in my-4">
          <ProgressiveFluxLoader 
            value={progress}
            phases={SCHEME_PHASES} 
            onComplete={() => setAnimationDone(true)}
          />
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight transition-colors">AI Scheme Matcher</h2>
              <p className="text-slate-650 dark:text-slate-400 mt-1 transition-colors">Discover personalized benefits powered by our Glorious AI</p>
            </div>
            <button onClick={matchSchemes} disabled={loading} className="bg-gradient-to-r from-govorange to-orange-500 text-white font-bold px-6 py-3 rounded-xl hover:scale-105 shadow-md shadow-orange-500/30 transition auto disabled:opacity-50">
              Find Matches
            </button>
          </div>

          {errorMsg && (
            <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 p-4 rounded-xl flex items-center justify-center text-sm font-medium animate-fade-in transition-colors shadow-sm">
              <span>⚠️ {errorMsg}</span>
            </div>
          )}

          {/* Filters Section */}
          <div className="bg-white/60 dark:bg-slate-800/80 p-4 rounded-xl mb-6 flex flex-wrap gap-4 items-center border border-slate-200 dark:border-slate-700 transition-colors">
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors">State:</label>
              <select className="p-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-white transition-colors" value={filterState} onChange={e => setFilterState(e.target.value)}>
                {availableStates.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors">Category:</label>
              <select className="p-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-white transition-colors" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 ml-auto font-medium transition-colors">
              Showing {filteredSchemes.length} of {schemes.length} schemes
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {filteredSchemes.map((scheme, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-lg border border-slate-100 dark:border-slate-700 flex flex-col justify-between transition-all group">
                <div>
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="font-bold text-xl text-govblue dark:text-blue-400 leading-tight mb-2 pr-2 transition-colors">{scheme.name}</h3>
                    <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs px-2 py-1 rounded-md font-bold whitespace-nowrap shrink-0 transition-colors">{scheme.category}</span>
                  </div>
                  <p className="text-slate-650 dark:text-slate-400 text-sm leading-relaxed transition-colors">{scheme.description}</p>
                </div>
                <div className="mt-6 flex justify-between items-center border-t border-slate-50 dark:border-slate-700 pt-4 transition-colors">
                  <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-3 py-1.5 rounded-full text-sm font-bold flex items-center transition-colors">
                    ✨ {scheme.eligibilityScore}% Match
                  </span>
                  <div className="flex gap-2 isolate z-10 w-full md:w-auto mt-4 md:mt-0 items-center overflow-x-auto print:hidden">
                    {scheme.officialWebsite && scheme.officialWebsite.trim() !== "" && (
                      <a
                        href={scheme.officialWebsite.startsWith('http') ? scheme.officialWebsite : `https://${scheme.officialWebsite}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-govorange dark:text-orange-400 hover:text-white dark:hover:text-white hover:bg-govorange dark:hover:bg-orange-600 border border-govorange dark:border-orange-400 px-4 py-1.5 rounded-lg text-sm font-bold transition-colors flex items-center whitespace-nowrap"
                      >
                        Apply on Website &rarr;
                      </a>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/schemes/${scheme.id || scheme.name.replace(/\s+/g, '-').toLowerCase()}`); }}
                      className="text-govblue dark:text-blue-400 hover:text-white dark:hover:text-white hover:bg-govblue dark:hover:bg-blue-600 border border-govblue dark:border-blue-400 px-4 py-1.5 rounded-lg text-sm font-bold transition-colors flex items-center whitespace-nowrap"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {schemes.length > 0 && filteredSchemes.length === 0 && (
              <div className="col-span-2 text-center py-10 text-slate-500 dark:text-slate-400 transition-colors">
                No schemes match your selected filters.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
