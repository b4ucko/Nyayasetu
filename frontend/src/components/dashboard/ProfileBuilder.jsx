import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { useAuth } from '../../hooks/useAuth';
import { AlertCircle, FileUp, Sparkles, ShieldCheck, CreditCard, Calendar, Building, UserCircle } from 'lucide-react';
import axios from 'axios';
import { ProgressiveFluxLoader } from '../ui/progressive-flux-loader';

const EXTRACT_PHASES = [
  { at: 0, label: "uploading id card image..." },
  { at: 20, label: "scanning layout & border detection..." },
  { at: 50, label: "extracting text & masking numbers..." },
  { at: 80, label: "validating profile details..." },
  { at: 98, label: "applying autofill..." },
];

export default function ProfileBuilder() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ age: '', income: '', occupation: '', state: '', gender: '', marital_status: '', caste: '', disability: 'No', education: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [loadingDigilocker, setLoadingDigilocker] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [verifiedIdDetails, setVerifiedIdDetails] = useState(null);
  const isDigilockerVerified = user?.user_metadata?.digilocker_verified === true;
  const [docsList, setDocsList] = useState([
     { id: 1, name: "PAN Verification Record", issuer: "Income Tax Department", status: "pending", date: "N/A" },
     { id: 2, name: "Driving License", issuer: "Ministry of Road Transport", status: "pending", date: "N/A" },
     { id: 3, name: "Class XII Marksheet", issuer: "CBSE", status: "pending", date: "N/A" },
  ]);

  // States to delay display until animation finishes
  const [tempProfile, setTempProfile] = useState(null);
  const [tempVerifiedIdDetails, setTempVerifiedIdDetails] = useState(null);
  const [extractingDone, setExtractingDone] = useState(false);
  const [extractProgress, setExtractProgress] = useState(0);

  // Wait for both OCR API response and animation to be complete before filling form
  useEffect(() => {
    if (tempProfile && extractingDone) {
      setProfile(tempProfile);
      if (tempVerifiedIdDetails && Object.keys(tempVerifiedIdDetails).length > 0) {
        setVerifiedIdDetails(tempVerifiedIdDetails);
      }
      setIsEditing(true);
      setExtracting(false);
      setTempProfile(null);
      setTempVerifiedIdDetails(null);
      setExtractingDone(false);
      alert("Profile details successfully extracted from ID!");
    }
  }, [tempProfile, tempVerifiedIdDetails, extractingDone]);

  const handleDigilockerVerify = async () => {
    setLoadingDigilocker(true);
    try {
      const resp = await axios.post("http://localhost:8000/api/digilocker/init", {
        redirectUrl: window.location.origin + "/callback"
      });
      if (resp.data.url) {
        window.location.href = resp.data.url;
      } else {
        alert("Failed to initiate DigiLocker session.");
        setLoadingDigilocker(false);
      }
    } catch (error) {
       console.error("DigiLocker init error:", error);
       const errorMsg = error.response?.data?.detail || "Error initiating DigiLocker session.";
       alert(errorMsg);
       setLoadingDigilocker(false);
     }
  };

  const handleFetchRealDoc = async (docId, docName) => {
    setDocsList(docs => docs.map(d => d.id === docId ? { ...d, status: "fetching", error: null } : d));
    try {
      const docTypeMap = {
        "PAN Verification Record": "pan",
        "Driving License": "driving_license",
        "Class XII Marksheet": "class_xii"
      };
      const type = docTypeMap[docName] || "unknown";
      const resp = await axios.get(`http://localhost:8000/api/digilocker/document/${user?.user_metadata?.digilocker_id}/${type}`);
      
      setDocsList(docs => docs.map(d => d.id === docId ? { ...d, status: "fetched", date: new Date().toLocaleDateString(), data: resp.data } : d));
    } catch (err) {
      console.error(err);
      setDocsList(docs => docs.map(d => d.id === docId ? { ...d, status: "error", error: err.response?.data?.detail || err.message } : d));
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setExtracting(true);
    setTempProfile(null);
    setTempVerifiedIdDetails(null);
    setExtractingDone(false);
    setExtractProgress(0);
    const apiFormData = new FormData();
    apiFormData.append('file', file);

    let currentProgress = 0;
    let apiDone = false;
    let newProfile = null;
    let newVerifiedIdDetails = null;
    let didFail = false;

    const progressInterval = setInterval(() => {
      if (currentProgress < 95) {
        currentProgress += 1.5;
        setExtractProgress(currentProgress);
      } else {
        if (apiDone) {
          currentProgress = Math.min(100, currentProgress + 3);
          setExtractProgress(currentProgress);
          if (currentProgress >= 100) {
            clearInterval(progressInterval);
            if (didFail) {
              setExtracting(false);
            } else {
              setTempProfile(newProfile);
              setTempVerifiedIdDetails(newVerifiedIdDetails || {});
            }
          }
        }
      }
    }, 100);

    try {
      const response = await axios.post('http://localhost:8000/api/ai/extract-profile', apiFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const extractedData = response.data;
      
      newProfile = {
        ...profile,
        age: extractedData.age || profile.age,
        state: extractedData.state || profile.state,
        gender: extractedData.gender || profile.gender,
      };
      
      if (extractedData.id_type || extractedData.id_number_masked) {
        newVerifiedIdDetails = {
          id_type: extractedData.id_type || 'Certified ID',
          id_number_masked: extractedData.id_number_masked || 'Unknown',
          dob: extractedData.dob || 'Not found',
          full_address: extractedData.full_address || 'Not found',
          name: extractedData.name || 'Not Available'
        };
      }
      apiDone = true;
    } catch (error) {
      console.error("Error extracting profile:", error);
      alert("Failed to extract details from the ID. Please fill manually.");
      didFail = true;
      apiDone = true;
    } finally {
      e.target.value = null;
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (data && !error) {
            setProfile({
              age: data.age || '',
              income: data.income || '',
              occupation: data.occupation || '',
              state: data.state || '',
              gender: data.gender || '',
              marital_status: data.marital_status || '',
              caste: data.caste || '',
              disability: data.disability || 'No',
              education: data.education || ''
            });
            setIsEditing(false);
          } else {
            setIsEditing(true);
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
          setIsEditing(true);
        }
      }
    };
    fetchProfile();
  }, [user]);

  const validate = () => {
    const newErrors = {};
    if (!profile.age || Number(profile.age) < 16 || Number(profile.age) > 120) {
      newErrors.age = "Age must be between 16 and 120.";
    }
    if (profile.income === '' || Number(profile.income) < 0) {
      newErrors.income = "Income cannot be negative.";
    }
    if (!profile.occupation || profile.occupation.trim().length < 3) {
      newErrors.occupation = "Please select an Occupation.";
    }
    if (!profile.state || profile.state.trim().length < 2) {
      newErrors.state = "Please select a State.";
    }
    if (!profile.gender) newErrors.gender = "Please select your gender.";
    if (!profile.marital_status) newErrors.marital_status = "Please select your marital status.";
    if (!profile.caste) newErrors.caste = "Please select your caste/category.";
    if (!profile.education) newErrors.education = "Please select your education level.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    if (!validate()) return;

    setLoading(true);
    setErrors({});
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id, 
          age: Number(profile.age), 
          income: Number(profile.income), 
          occupation: profile.occupation, 
          state: profile.state,
          gender: profile.gender,
          marital_status: profile.marital_status,
          caste: profile.caste,
          disability: profile.disability,
          education: profile.education
        });
        
      if (error) throw error;
      
      setSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
      setErrors({ submit: error.message || "Failed to save profile. Please try again." });
    }
    setLoading(false);
  };

  return (
    <div className="p-6 glass dark:bg-slate-800/80 rounded-2xl shadow-xl w-full max-w-5xl mx-auto border dark:border-slate-700 transition-colors">
      {extracting ? (
        <div className="py-20 bg-white/40 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-855 rounded-2xl flex flex-col items-center justify-center shadow-inner animate-fade-in my-4 min-h-[350px]">
          <ProgressiveFluxLoader 
            value={extractProgress}
            phases={EXTRACT_PHASES} 
            onComplete={() => setExtractingDone(true)}
          />
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-white transition-colors">Citizen Profile Builder</h2>
          <p className="text-slate-650 dark:text-slate-300 mb-6 transition-colors">Build your profile to get personalized scheme recommendations securely.</p>
          
          {errors.submit && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-3 rounded-xl flex items-center text-sm animate-fade-in">
               <AlertCircle className="w-5 h-5 mr-2" /> {errors.submit}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 mb-2 text-sm">
          {/* DIGILOCKER SECTION */}
          {!isDigilockerVerified ? (
            <div className="h-full bg-blue-50 dark:bg-slate-900 border border-blue-100 dark:border-slate-700 p-4 rounded-xl flex flex-col justify-center items-center text-center sm:text-left sm:flex-row sm:justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center">
                   <span className="text-xl mr-2">🔒</span> Verify with DigiLocker
                </h3>
                <p className="text-sm text-slate-650 dark:text-slate-400 mt-1">Instantly fetch your Aadhaar details securely via Setu Sandbox.</p>
              </div>
              <button 
                onClick={handleDigilockerVerify} 
                disabled={loadingDigilocker}
                type="button"
                className="bg-govorange text-white px-5 py-2.5 rounded-xl font-bold hover:bg-orange-600 shadow-md transition-all hover:shadow-lg disabled:opacity-50 whitespace-nowrap"
              >
                {loadingDigilocker ? 'Redirecting...' : 'Verify Now'}
              </button>
            </div>
          ) : (
            <div className="h-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-xl flex flex-col">
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center space-x-2">
                    <span className="text-2xl">✅</span>
                    <div>
                       <h3 className="font-bold text-green-800 dark:text-green-300">DigiLocker Verified</h3>
                       <p className="text-sm text-green-700 dark:text-green-400">Linked to {user?.email}</p>
                    </div>
                 </div>
                 <span className="px-3 py-1 bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs font-bold rounded-full">ACTIVE</span>
              </div>
              
              <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
                 <h4 className="font-bold text-slate-800 dark:text-white mb-3 text-sm uppercase tracking-wider">Issued Documents Available to Fetch</h4>
                 <div className="space-y-3">
                   {docsList.map(doc => (
                     <div key={doc.id} className="flex flex-col sm:flex-row sm:items-start justify-between bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 gap-3">
                        <div className="flex items-center space-x-3">
                           <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-slate-700 flex items-center justify-center text-xl shrink-0">📄</div>
                           <div>
                              <p className="font-bold text-slate-800 dark:text-white text-sm">{doc.name}</p>
                              <p className="text-xs text-slate-500 mb-1">{doc.issuer}</p>
                              {doc.status === 'error' && (
                                <p className="text-xs text-red-500 font-medium break-all max-w-sm">{doc.error}</p>
                              )}
                           </div>
                        </div>
                        <div className="shrink-0 mt-2 sm:mt-0">
                           {doc.status === 'pending' && (
                             <button onClick={() => handleFetchRealDoc(doc.id, doc.name)} type="button" className="text-xs w-full sm:w-auto bg-govblue text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition">Fetch from DigiLocker</button>
                           )}
                           {doc.status === 'error' && (
                             <button onClick={() => handleFetchRealDoc(doc.id, doc.name)} type="button" className="text-xs w-full sm:w-auto bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg font-bold hover:bg-slate-300 transition">Retry Fetch</button>
                           )}
                           {doc.status === 'fetching' && (
                             <p className="text-xs font-bold text-govorange animate-pulse px-4 py-2">Fetching API...</p>
                           )}
                           {doc.status === 'fetched' && (
                             <div className="flex items-center space-x-2 text-xs">
                               <span className="text-green-600 dark:text-green-400 font-bold flex items-center"><span className="mr-1">✓</span> Fetched {doc.date}</span>
                               <button type="button" className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-600">View</button>
                             </div>
                           )}
                        </div>
                     </div>
                   ))}
                 </div>
              </div>
            </div>
          )}

          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
            {isEditing && (
              <div className="bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl mb-4 text-left">
                <h3 className="text-base font-bold text-slate-800 dark:text-white mb-3 flex items-center">
                  <FileUp className="w-5 h-5 mr-2 text-slate-650" /> Fast-Track Profile Autofill (Optional)
                </h3>
                <div className="border-2 border-dashed border-slate-300 hover:bg-slate-50/50 rounded-xl p-6 text-center transition-colors">
                  <input 
                    type="file" 
                    onChange={handleFileUpload}
                    accept="image/*,.pdf"
                    className="block w-full text-sm text-slate-550 file:mr-4 file:py-2.5 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-govblue/10 file:text-govblue hover:file:bg-govblue/20 cursor-pointer" 
                  />
                  <p className="text-xs text-slate-500 mt-3 font-medium">Upload Aadhaar or Certified ID for instant OCR Profile Extraction.</p>
                </div>

                {/* Verified ID Details Card */}
                {verifiedIdDetails && (
                  <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 shadow-sm relative overflow-hidden animate-fade-in-up">
                    <div className="absolute top-0 right-0 p-4">
                      <ShieldCheck className="w-16 h-16 text-green-200 opacity-40 transform rotate-12" />
                    </div>
                    <div className="flex items-center space-x-3 mb-4 relative z-10">
                      <div className="bg-green-100 p-2 rounded-full shadow-inner border border-green-200">
                        <ShieldCheck className="w-6 h-6 text-green-600" />
                      </div>
                      <h4 className="text-xl font-bold text-green-800 tracking-tight">Verified ID Details</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-705 relative z-10">
                      <div className="flex items-start bg-white/60 p-3 rounded-lg border border-green-100/50">
                        <CreditCard className="w-5 h-5 mr-3 text-green-600 mt-0.5 shrink-0" />
                        <div>
                          <span className="font-semibold block text-green-800 text-xs uppercase tracking-wider mb-0.5">{verifiedIdDetails.id_type}</span>
                          <span className="font-mono text-slate-800">{verifiedIdDetails.id_number_masked}</span>
                        </div>
                      </div>
                      <div className="flex items-start bg-white/60 p-3 rounded-lg border border-green-100/50">
                        <UserCircle className="w-5 h-5 mr-3 text-green-600 mt-0.5 shrink-0" />
                        <div>
                          <span className="font-semibold block text-green-800 text-xs uppercase tracking-wider mb-0.5">Name</span>
                          <span className="text-slate-800 font-medium">{verifiedIdDetails.name || 'Not Available'}</span>
                        </div>
                      </div>
                      <div className="flex items-start bg-white/60 p-3 rounded-lg border border-green-100/50">
                        <Calendar className="w-5 h-5 mr-3 text-green-600 mt-0.5 shrink-0" />
                        <div>
                          <span className="font-semibold block text-green-800 text-xs uppercase tracking-wider mb-0.5">Date of Birth</span>
                          <span className="text-slate-800 font-medium">{verifiedIdDetails.dob || 'Not Available'}</span>
                        </div>
                      </div>
                      <div className="flex items-start bg-white/60 p-3 rounded-lg border border-green-100/50">
                        <Building className="w-5 h-5 mr-3 text-green-600 mt-0.5 shrink-0" />
                        <div>
                          <span className="font-semibold block text-green-800 text-xs uppercase tracking-wider mb-0.5">Address</span>
                          <span className="text-slate-800 font-medium">{verifiedIdDetails.full_address || 'Not Available'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-705 dark:text-slate-300 mb-1 transition-colors">Age</label>
              <input 
                type="number" 
                min="16"
                max="120"
                disabled={!isEditing}
                className={`w-full p-3 rounded-xl bg-white dark:bg-slate-900 border transition-colors dark:text-white ${errors.age ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700'} ${!isEditing ? 'opacity-80 bg-slate-50 dark:bg-slate-800 cursor-not-allowed' : ''}`}
                value={profile.age} 
                onChange={(e) => { setProfile({...profile, age: e.target.value}); setErrors({...errors, age: null}); }} 
              />
              {errors.age && <p className="text-red-500 text-xs mt-1 font-medium">{errors.age}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-705 dark:text-slate-300 mb-1 transition-colors">Annual Income (INR)</label>
              <input 
                type="number" 
                min="0"
                disabled={!isEditing}
                className={`w-full p-3 rounded-xl bg-white dark:bg-slate-900 border transition-colors dark:text-white ${errors.income ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700'} ${!isEditing ? 'opacity-80 bg-slate-50 dark:bg-slate-800 cursor-not-allowed' : ''}`}
                value={profile.income} 
                onChange={(e) => { setProfile({...profile, income: e.target.value}); setErrors({...errors, income: null}); }} 
              />
              {errors.income && <p className="text-red-500 text-xs mt-1 font-medium">{errors.income}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-705 dark:text-slate-300 mb-1 transition-colors">Occupation</label>
              <select 
                disabled={!isEditing}
                className={`w-full p-3 rounded-xl bg-white dark:bg-slate-900 border transition-colors dark:text-white appearance-none ${errors.occupation ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700'} ${!isEditing ? 'opacity-80 bg-slate-50 dark:bg-slate-800 cursor-not-allowed' : ''}`}
                value={profile.occupation} 
                onChange={(e) => { setProfile({...profile, occupation: e.target.value}); setErrors({...errors, occupation: null}); }} 
              >
                <option value="">Select Occupation</option>
                <option value="Student">Student</option>
                <option value="Employed">Employed (Salaried)</option>
                <option value="Self-Employed">Self-Employed / Business</option>
                <option value="Farmer">Farmer / Agriculture</option>
                <option value="Unemployed">Unemployed</option>
                <option value="Retired">Retired / Pensioner</option>
                <option value="Homemaker">Homemaker</option>
                <option value="Other">Other</option>
              </select>
              {errors.occupation && <p className="text-red-500 text-xs mt-1 font-medium">{errors.occupation}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-705 dark:text-slate-300 mb-1 transition-colors">State</label>
              <select 
                disabled={!isEditing}
                className={`w-full p-3 rounded-xl bg-white dark:bg-slate-900 border transition-colors dark:text-white appearance-none ${errors.state ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700'} ${!isEditing ? 'opacity-80 bg-slate-50 dark:bg-slate-800 cursor-not-allowed' : ''}`}
                value={profile.state} 
                onChange={(e) => { setProfile({...profile, state: e.target.value}); setErrors({...errors, state: null}); }} 
              >
                <option value="">Select State</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Assam">Assam</option>
                <option value="Bihar">Bihar</option>
                <option value="Chhattisgarh">Chhattisgarh</option>
                <option value="Delhi">Delhi</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Haryana">Haryana</option>
                <option value="Jharkhand">Jharkhand</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Kerala">Kerala</option>
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Odisha">Odisha</option>
                <option value="Punjab">Punjab</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Telangana">Telangana</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="West Bengal">West Bengal</option>
                <option value="Other">Other</option>
              </select>
              {errors.state && <p className="text-red-500 text-xs mt-1 font-medium">{errors.state}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-705 dark:text-slate-300 mb-1 transition-colors">Gender</label>
                <select 
                  disabled={!isEditing}
                  className={`w-full p-3 rounded-xl bg-white dark:bg-slate-900 border transition-colors dark:text-white appearance-none ${errors.gender ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} ${!isEditing ? 'opacity-80 bg-slate-50 dark:bg-slate-800 cursor-not-allowed' : ''}`}
                  value={profile.gender} 
                  onChange={(e) => { setProfile({...profile, gender: e.target.value}); setErrors({...errors, gender: null}); }} 
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Transgender">Transgender</option>
                  <option value="Prefer Not to Say">Prefer Not to Say</option>
                </select>
                {errors.gender && <p className="text-red-500 text-xs mt-1 font-medium">{errors.gender}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-705 dark:text-slate-300 mb-1 transition-colors">Marital Status</label>
                <select 
                  disabled={!isEditing}
                  className={`w-full p-3 rounded-xl bg-white dark:bg-slate-900 border transition-colors dark:text-white appearance-none ${errors.marital_status ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} ${!isEditing ? 'opacity-80 bg-slate-50 dark:bg-slate-800 cursor-not-allowed' : ''}`}
                  value={profile.marital_status} 
                  onChange={(e) => { setProfile({...profile, marital_status: e.target.value}); setErrors({...errors, marital_status: null}); }} 
                >
                  <option value="">Select Status</option>
                  <option value="Single">Single / Unmarried</option>
                  <option value="Married">Married</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Divorced">Divorced / Separated</option>
                </select>
                {errors.marital_status && <p className="text-red-500 text-xs mt-1 font-medium">{errors.marital_status}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-705 dark:text-slate-300 mb-1 transition-colors">Caste / Category</label>
                <select 
                  disabled={!isEditing}
                  className={`w-full p-3 rounded-xl bg-white dark:bg-slate-900 border transition-colors dark:text-white appearance-none ${errors.caste ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} ${!isEditing ? 'opacity-80 bg-slate-50 dark:bg-slate-800 cursor-not-allowed' : ''}`}
                  value={profile.caste} 
                  onChange={(e) => { setProfile({...profile, caste: e.target.value}); setErrors({...errors, caste: null}); }} 
                >
                  <option value="">Select Category</option>
                  <option value="General">General / Unreserved</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                </select>
                {errors.caste && <p className="text-red-500 text-xs mt-1 font-medium">{errors.caste}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-755 dark:text-slate-300 mb-1 transition-colors">Disability Status</label>
                <select 
                  disabled={!isEditing}
                  className={`w-full p-3 rounded-xl bg-white dark:bg-slate-900 border transition-colors dark:text-white appearance-none ${errors.disability ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} ${!isEditing ? 'opacity-80 bg-slate-50 dark:bg-slate-800 cursor-not-allowed' : ''}`}
                  value={profile.disability} 
                  onChange={(e) => { setProfile({...profile, disability: e.target.value}); setErrors({...errors, disability: null}); }} 
                >
                  <option value="No">No Disability</option>
                  <option value="Yes">Yes, Person with Benchmark Disability</option>
                </select>
                {errors.disability && <p className="text-red-500 text-xs mt-1 font-medium">{errors.disability}</p>}
              </div>

            <div>
                <label className="block text-sm font-medium text-slate-705 dark:text-slate-300 mb-1 transition-colors">Highest Education Level</label>
                <select 
                  disabled={!isEditing}
                  className={`w-full p-3 rounded-xl bg-white dark:bg-slate-900 border transition-colors dark:text-white appearance-none ${errors.education ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} ${!isEditing ? 'opacity-80 bg-slate-50 dark:bg-slate-800 cursor-not-allowed' : ''}`}
                  value={profile.education} 
                  onChange={(e) => { setProfile({...profile, education: e.target.value}); setErrors({...errors, education: null}); }} 
                >
                  <option value="">Select Education Level</option>
                  <option value="Below 10th">Below 10th Grade</option>
                  <option value="10th Pass">10th Pass / Matriculation</option>
                  <option value="12th Pass">12th Pass / Intermediate</option>
                  <option value="Diploma">Diploma / ITI</option>
                  <option value="Graduate">Graduate</option>
                  <option value="Post-Graduate">Post-Graduate or above</option>
                </select>
                {errors.education && <p className="text-red-500 text-xs mt-1 font-medium">{errors.education}</p>}
              </div>
            </div>

            {isEditing ? (
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <button type="submit" disabled={loading} className="w-full sm:flex-1 bg-govblue text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-md">
                  {loading ? 'Saving Profile...' : 'Save Profile Details'}
                </button>
                <button type="button" onClick={() => setIsEditing(false)} className="w-full sm:flex-1 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-3 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors shadow-md">
                  Cancel
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setIsEditing(true)} className="w-full bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 font-bold py-3 rounded-xl mt-6 hover:bg-slate-900 dark:hover:bg-white transition-colors shadow-md">
                Edit Profile
              </button>
            )}

            {success && (
              <div className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-3 rounded-xl text-center text-sm font-bold border border-green-200 dark:border-green-800 animate-fade-in mt-4">
                Profile saved successfully!
              </div>
            )}
          </form>
        </>
      )}
    </div>
  );
}
