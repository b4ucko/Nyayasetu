import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserCircle, Briefcase, IndianRupee, MapPin, Map, FileUp, Sparkles, ShieldCheck, CreditCard, Calendar, Building } from 'lucide-react';
import { ProgressiveFluxLoader } from './ui/progressive-flux-loader';

const EXTRACT_PHASES = [
  { at: 0, label: "uploading id card image..." },
  { at: 20, label: "scanning layout & border detection..." },
  { at: 50, label: "extracting text & masking numbers..." },
  { at: 80, label: "validating profile details..." },
  { at: 98, label: "applying autofill..." },
];

const SCHEME_PHASES = [
  { at: 0, label: "Extracting profile facts..." },
  { at: 20, label: "Scanning 300+ active government policies..." },
  { at: 50, label: "Matching eligibility criteria..." },
  { at: 75, label: "Calculating final match scores..." },
  { at: 95, label: "Finalizing your report..." },
];

export default function ProfileForm({ setUserProfile, setRecommendedSchemes }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [verifiedIdDetails, setVerifiedIdDetails] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "Ramesh Kumar",
    age: 45,
    occupation: "Farmer",
    income: 200000,
    state: "Maharashtra",
    land_acres: 2.0
  });

  // States to delay display until animation finishes
  const [tempFormData, setTempFormData] = useState(null);
  const [tempVerifiedIdDetails, setTempVerifiedIdDetails] = useState(null);
  const [extractingDone, setExtractingDone] = useState(false);

  const [tempRecommendedSchemes, setTempRecommendedSchemes] = useState(null);
  const [loadingDone, setLoadingDone] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Wait for both OCR API response and animation to be complete before filling form
  React.useEffect(() => {
    if (tempFormData && extractingDone) {
      setFormData(tempFormData);
      if (tempVerifiedIdDetails && Object.keys(tempVerifiedIdDetails).length > 0) {
        setVerifiedIdDetails(tempVerifiedIdDetails);
      }
      setExtracting(false);
      setTempFormData(null);
      setTempVerifiedIdDetails(null);
      setExtractingDone(false);
      alert("Profile details successfully extracted from ID!");
    }
  }, [tempFormData, tempVerifiedIdDetails, extractingDone]);

  // Wait for recommendation backend call and animation to be complete before navigating
  React.useEffect(() => {
    if (tempRecommendedSchemes && loadingDone) {
      setRecommendedSchemes(tempRecommendedSchemes);
      setLoading(false);
      setTempRecommendedSchemes(null);
      setLoadingDone(false);
      navigate('/dashboard');
    }
  }, [tempRecommendedSchemes, loadingDone, navigate, setRecommendedSchemes]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTempRecommendedSchemes(null);
    setLoadingDone(false);
    setUserProfile(formData);
    
    try {
      // Send profile to FastAPI backend
      const response = await axios.post('http://localhost:8000/api/recommendations', formData);
      setTempRecommendedSchemes(response.data.eligible_schemes);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      alert("Backend connection failed! Please ensure the FastAPI server is running.");
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setExtracting(true);
    setTempFormData(null);
    setTempVerifiedIdDetails(null);
    setExtractingDone(false);
    const apiFormData = new FormData();
    apiFormData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/api/extract-profile', apiFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const extractedData = response.data;
      
      const newFormData = {
        ...formData,
        name: extractedData.name || formData.name,
        age: extractedData.age || formData.age,
        state: extractedData.state || formData.state,
      };
      setTempFormData(newFormData);
      
      if (extractedData.id_type || extractedData.id_number_masked) {
        setTempVerifiedIdDetails({
          id_type: extractedData.id_type || 'Certified ID',
          id_number_masked: extractedData.id_number_masked || 'Unknown',
          dob: extractedData.dob || 'Not found',
          full_address: extractedData.full_address || 'Not found',
          name: extractedData.name || extractedData.name
        });
      } else {
        setTempVerifiedIdDetails({});
      }
    } catch (error) {
      console.error("Error extracting profile:", error);
      alert("Failed to extract details from the ID. Please fill manually.");
      setExtracting(false);
    } finally {
      e.target.value = null; // reset file input
    }
  };

  return (
    <div className="max-w-3xl mx-auto my-12 text-left animate-fade-in">
      {loading ? (
        <div className="glass p-8 md:p-12 rounded-3xl shadow-xl border border-white/60 relative overflow-hidden flex flex-col items-center justify-center py-20 min-h-[350px]">
          <ProgressiveFluxLoader 
            phases={SCHEME_PHASES} 
            duration={10} 
            loop={false}
            onComplete={() => setLoadingDone(true)}
          />
        </div>
      ) : extracting ? (
        <div className="glass p-8 md:p-12 rounded-3xl shadow-xl border border-white/60 relative overflow-hidden flex flex-col items-center justify-center py-20 min-h-[350px]">
          <ProgressiveFluxLoader 
            phases={EXTRACT_PHASES} 
            duration={8} 
            loop={false}
            onComplete={() => setExtractingDone(true)}
          />
        </div>
      ) : (
        <>
          <div className="text-center mb-10">
            <h2 className="text-4xl font-extrabold text-slate-800 mb-4 animate-fade-in">Tell us about yourself</h2>
            <p className="text-slate-650 text-lg">Our AI agents use this profile to scan hundreds of policies instantly.</p>
          </div>

          <div className="glass p-8 md:p-12 rounded-3xl shadow-xl border border-white/60 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-govblue to-purple-400 rounded-full blur-3xl opacity-20"></div>

            <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Input Group */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-semibold text-slate-700">
                    <UserCircle className="w-4 h-4 mr-2 text-govblue" /> Full Name
                  </label>
                  <input 
                    type="text" name="name" value={formData.name} onChange={handleChange} 
                    className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-govblue focus:border-govblue transition-all outline-none shadow-sm"
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-semibold text-slate-700">
                    <UserCircle className="w-4 h-4 mr-2 text-govblue" /> Age
                  </label>
                  <input 
                    type="number" name="age" value={formData.age} onChange={handleChange} 
                    className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-govblue focus:border-govblue transition-all outline-none shadow-sm"
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-semibold text-slate-700">
                    <Briefcase className="w-4 h-4 mr-2 text-govorange" /> Occupation
                  </label>
                  <select 
                    name="occupation" value={formData.occupation} onChange={handleChange} 
                    className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-govorange focus:border-govorange transition-all outline-none shadow-sm"
                  >
                    <option value="Farmer">Farmer</option>
                    <option value="Student">Student</option>
                    <option value="Unemployed">Unemployed</option>
                    <option value="Street Vendor">Street Vendor</option>
                    <option value="Salaried">Salaried Employee</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-semibold text-slate-700">
                    <IndianRupee className="w-4 h-4 mr-2 text-govorange" /> Annual Family Income
                  </label>
                  <input 
                    type="number" name="income" value={formData.income} onChange={handleChange} 
                    className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-govorange focus:border-govorange transition-all outline-none shadow-sm"
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-semibold text-slate-700">
                    <MapPin className="w-4 h-4 mr-2 text-govgreen" /> State of Residence
                  </label>
                  <input 
                    type="text" name="state" value={formData.state} onChange={handleChange} 
                    className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-govgreen focus:border-govgreen transition-all outline-none shadow-sm"
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-semibold text-slate-700">
                    <Map className="w-4 h-4 mr-2 text-govgreen" /> Land Holding (Acres)
                  </label>
                  <input 
                    type="number" step="0.1" name="land_acres" value={formData.land_acres} onChange={handleChange} 
                    className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-govgreen focus:border-govgreen transition-all outline-none shadow-sm"
                  />
                </div>

              </div>

              <div className="pt-6 border-t border-slate-200/60">
                <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center">
                  <FileUp className="w-5 h-5 mr-2 text-slate-650" /> Fast-Track Upload (Optional)
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

              <button 
                type="submit" 
                className="w-full py-4 px-6 rounded-xl text-white font-bold text-lg shadow-lg transition-all duration-305 flex items-center justify-center space-x-2 bg-gradient-to-r from-govblue to-govblue/80 hover:scale-[1.02] hover:shadow-govblue/30"
              >
                <span>Find My Eligible Schemes</span>
                <Sparkles className="w-5 h-5 ml-2 text-yellow-200" />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
