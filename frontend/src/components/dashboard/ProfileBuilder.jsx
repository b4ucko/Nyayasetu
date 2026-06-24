import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { useAuth } from '../../hooks/useAuth';
import { AlertCircle, FileUp, Sparkles, ShieldCheck, CreditCard, Calendar, Building, UserCircle, Trash2, Eye, Plus, Lock, Download, FolderCheck } from 'lucide-react';
import axios from 'axios';
import { ProgressiveFluxLoader } from '../ui/progressive-flux-loader';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [extracting, setExtracting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [verifiedIdDetails, setVerifiedIdDetails] = useState(null);

  // Secure Document Vault States
  const [vaultDocs, setVaultDocs] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocType, setNewDocType] = useState('');
  const [newDocFile, setNewDocFile] = useState(null);
  const [viewingDoc, setViewingDoc] = useState(null);

  // States to delay display until animation finishes
  const [tempProfile, setTempProfile] = useState(null);
  const [tempVerifiedIdDetails, setTempVerifiedIdDetails] = useState(null);
  const [extractingDone, setExtractingDone] = useState(false);
  const [extractProgress, setExtractProgress] = useState(0);

  // Load vault documents keyed by unique Supabase User UID
  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`nyayasetu_vault_${user.id}`);
      if (stored) {
        try {
          setVaultDocs(JSON.parse(stored));
        } catch (e) {
          console.error("Error parsing vault documents:", e);
        }
      } else {
        setVaultDocs([]);
      }
    } else {
      setVaultDocs([]);
    }
  }, [user]);

  const saveVaultDocs = (docs) => {
    if (user) {
      localStorage.setItem(`nyayasetu_vault_${user.id}`, JSON.stringify(docs));
      setVaultDocs(docs);
    }
  };

  const base64ToBlob = (base64Data, contentType) => {
    const parts = base64Data.split(',');
    const byteCharacters = atob(parts[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  };

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

  const triggerOCRAuditing = async (file) => {
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
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await triggerOCRAuditing(file);
    } finally {
      e.target.value = null;
    }
  };

  const handleAddToVault = async (e) => {
    e.preventDefault();
    if (!newDocFile || !newDocName || !newDocType) {
      alert("Please fill in all fields and select a file.");
      return;
    }

    setUploadingDoc(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result;
      const formattedSize = (newDocFile.size / (1024 * 1024)).toFixed(2) + " MB";
      const newDoc = {
        id: Date.now().toString(),
        name: newDocName,
        type: newDocType,
        fileName: newDocFile.name,
        fileType: newDocFile.type,
        fileData: base64Data,
        fileSize: formattedSize,
        uploadedAt: new Date().toLocaleDateString()
      };

      const updatedDocs = [...vaultDocs, newDoc];
      saveVaultDocs(updatedDocs);
      
      // Reset form
      setNewDocName('');
      setNewDocType('');
      setNewDocFile(null);
      setShowUploadModal(false);
      setUploadingDoc(false);
      alert("Document successfully stored in your secure vault!");
    };
    reader.onerror = () => {
      alert("Failed to read document file.");
      setUploadingDoc(false);
    };
    reader.readAsDataURL(newDocFile);
  };

  const handleDeleteFromVault = (docId) => {
    if (window.confirm("Are you sure you want to permanently delete this document from your secure vault?")) {
      const updatedDocs = vaultDocs.filter(d => d.id !== docId);
      saveVaultDocs(updatedDocs);
    }
  };

  const handleAutofillFromVault = async (doc) => {
    try {
      const blob = base64ToBlob(doc.fileData, doc.fileType);
      const file = new File([blob], doc.fileName, { type: doc.fileType });
      await triggerOCRAuditing(file);
    } catch (error) {
      console.error("Error using vault doc for autofill:", error);
      alert("Failed to process document for autofill.");
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
      <AnimatePresence mode="wait">
        {extracting ? (
          <motion.div
            key="extracting"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="py-20 bg-white/40 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-855 rounded-2xl flex flex-col items-center justify-center shadow-inner my-4 min-h-[350px] w-full"
          >
            <ProgressiveFluxLoader 
              value={extractProgress}
              phases={EXTRACT_PHASES} 
              onComplete={() => setExtractingDone(true)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
          <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-white transition-colors">Citizen Profile Builder</h2>
          <p className="text-slate-650 dark:text-slate-300 mb-6 transition-colors">Build your profile to get personalized scheme recommendations securely.</p>
          
          {errors.submit && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-3 rounded-xl flex items-center text-sm animate-fade-in">
               <AlertCircle className="w-5 h-5 mr-2" /> {errors.submit}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 mb-2 text-sm">
          {/* SECURE DOCUMENT VAULT SECTION */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/60 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center">
                   <Lock className="w-5 h-5 mr-2 text-govorange" /> Secure Document Vault
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Upload and store your identity cards, certificates, and documents locally. All data is securely locked to your UID: <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-govblue dark:text-blue-400">{user?.id?.slice(0, 8)}...</span>
                </p>
              </div>
              <button 
                onClick={() => setShowUploadModal(true)} 
                type="button"
                className="bg-govblue text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 shadow-md transition-all hover:shadow-lg flex items-center text-xs whitespace-nowrap"
              >
                <Plus className="w-4 h-4 mr-1.5" /> Upload to Vault
              </button>
            </div>

            {/* Document Listing */}
            {vaultDocs.length === 0 ? (
              <div className="py-8 text-center bg-white/50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-6">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                  <FolderCheck className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold">Your Secure Document Vault is empty</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Upload your Aadhaar, PAN, or Educational certificates to store them safely.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vaultDocs.map(doc => (
                  <div key={doc.id} className="flex items-start justify-between bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-755 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-slate-700 flex items-center justify-center shrink-0 text-xl font-bold text-govblue dark:text-govorange shadow-inner">
                        {doc.type === 'Aadhaar' || doc.type === 'PAN Card' || doc.type === 'Driving License' ? '🪪' : '📄'}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-white text-sm leading-tight">{doc.name}</h4>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-[10px] font-bold rounded">
                          {doc.type}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {doc.fileSize} • {doc.uploadedAt}
                        </p>
                      </div>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button 
                        onClick={() => setViewingDoc(doc)}
                        title="View Document"
                        type="button" 
                        className="p-1.5 bg-slate-50 hover:bg-blue-50 dark:bg-slate-900 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-govblue rounded-lg border dark:border-slate-700 transition"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleAutofillFromVault(doc)}
                        title="Autofill Profile with AI"
                        type="button" 
                        className="p-1.5 bg-slate-50 hover:bg-amber-50 dark:bg-slate-900 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-govorange rounded-lg border dark:border-slate-700 transition"
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteFromVault(doc.id)}
                        title="Delete Document"
                        type="button" 
                        className="p-1.5 bg-slate-50 hover:bg-red-50 dark:bg-slate-900 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-red-600 rounded-lg border dark:border-slate-700 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

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
          </motion.div>
        )}
      </AnimatePresence>

      {/* UPLOAD TO VAULT MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/75 backdrop-blur-sm p-4 animate-fade-in">
          <form onSubmit={handleAddToVault} className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4 text-left">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center">
              <Lock className="w-5 h-5 mr-2 text-govorange" /> Add Document to Vault
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select a document to store locally. All processing is run locally on your device.
            </p>
            
            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">Document Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. My Aadhaar Card" 
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-govblue"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">Document Type</label>
                <select 
                  required
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-govblue"
                  value={newDocType}
                  onChange={(e) => setNewDocType(e.target.value)}
                >
                  <option value="">Select Type</option>
                  <option value="Aadhaar">Aadhaar Card</option>
                  <option value="PAN Card">PAN Card</option>
                  <option value="Driving License">Driving License</option>
                  <option value="Marksheet / Certificate">Marksheet / Certificate</option>
                  <option value="Income Certificate">Income Certificate</option>
                  <option value="Caste Certificate">Caste Certificate</option>
                  <option value="Other">Other Document</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">Select File</label>
                <input 
                  type="file" 
                  required
                  accept="image/*,.pdf"
                  className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-govblue/10 file:text-govblue hover:file:bg-govblue/20"
                  onChange={(e) => setNewDocFile(e.target.files[0])}
                />
              </div>
            </div>
            
            <div className="flex space-x-3 pt-3">
              <button 
                type="submit" 
                disabled={uploadingDoc}
                className="flex-1 bg-govblue text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 text-sm shadow-md"
              >
                {uploadingDoc ? 'Saving...' : 'Save to Vault'}
              </button>
              <button 
                type="button" 
                onClick={() => { setShowUploadModal(false); setNewDocName(''); setNewDocType(''); setNewDocFile(null); }}
                className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold py-3 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEWING VAULT DOCUMENT PREVIEW OVERLAY */}
      {viewingDoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-150 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🔒</div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{viewingDoc.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-450">{viewingDoc.type} • {viewingDoc.fileSize} • Uploaded {viewingDoc.uploadedAt}</p>
                </div>
              </div>
              <button 
                onClick={() => setViewingDoc(null)}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-455 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2055/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1 flex justify-center items-center bg-slate-50 dark:bg-slate-950/50 min-h-[300px]">
              {viewingDoc.fileType.startsWith('image/') ? (
                <img src={viewingDoc.fileData} className="max-h-[60vh] object-contain rounded-xl shadow-lg border border-slate-200/50" alt={viewingDoc.name} />
              ) : viewingDoc.fileType === 'application/pdf' ? (
                <iframe src={viewingDoc.fileData} className="w-full h-[60vh] rounded-xl border border-slate-250 dark:border-slate-800" title={viewingDoc.name}></iframe>
              ) : (
                <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm max-w-md">
                  <p className="text-slate-700 dark:text-slate-300 font-bold mb-4">Preview not available for this file type.</p>
                  <a href={viewingDoc.fileData} download={viewingDoc.fileName} className="inline-flex items-center bg-govblue text-white font-bold px-6 py-2.5 rounded-xl hover:bg-blue-750 transition">
                    <Download className="w-4 h-4 mr-2" /> Download File
                  </a>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-6 border-t border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end space-x-3">
              <a href={viewingDoc.fileData} download={viewingDoc.fileName} className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold px-5 py-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 border dark:border-slate-700 transition flex items-center">
                <Download className="w-4.5 h-4.5 mr-2 text-slate-500" /> Download
              </a>
              <button onClick={() => { handleAutofillFromVault(viewingDoc); setViewingDoc(null); }} className="bg-govblue text-white font-bold px-5 py-2.5 rounded-xl hover:bg-blue-700 shadow-md transition flex items-center">
                <Sparkles className="w-4.5 h-4.5 mr-2" /> Use for Autofill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
