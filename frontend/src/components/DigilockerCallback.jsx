import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { supabase } from '../supabase';
import { useAuth } from '../hooks/useAuth';

export default function DigilockerCallback() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setError("Please log in from the main app to link your DigiLocker account.");
      setLoading(false);
      return;
    }

    if (!id) {
      setError("No id found in URL.");
      setLoading(false);
      return;
    }

    const fetchAadhaar = async () => {
      try {
        const resp = await axios.get(`http://localhost:8000/api/digilocker/data/${id}`);
        // Setu sends nested data
        setData(resp.data);
        
        // Link to user profile email securely via Supabase Auth Metadata
        if (user) {
           await supabase.auth.updateUser({
             data: { 
               digilocker_verified: true,
               digilocker_id: id
             }
           });
        }
      } catch (err) {
        setError(err.response?.data?.error || err.response?.data?.detail || err.message || "Failed to fetch data.");
      }
      setLoading(false);
    };
    
    fetchAadhaar();
  }, [id, user, authLoading]);

  return (
    <div className="p-6 max-w-2xl mx-auto mt-10 glass dark:bg-slate-800 rounded-2xl shadow-xl border dark:border-slate-700">
      <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-white">DigiLocker Verification</h2>
      
      {loading && (
        <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-300">
          <div className="w-5 h-5 border-4 border-govblue border-t-transparent rounded-full animate-spin"></div>
          <p>Fetching your Aadhaar data from Setu...</p>
        </div>
      )}
      
      {error && (
         <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-4 border border-red-200">
           <h3 className="font-bold">Verification Failed</h3>
           <p>{error}</p>
         </div>
      )}

      {data && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 p-5 rounded-xl text-green-800 dark:text-green-300">
           <h3 className="font-bold text-lg mb-3 flex items-center">
             <span className="text-2xl mr-2">✅</span> Aadhaar Data Verified
           </h3>
           
           <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 mb-4 space-y-3">
              <div>
                 <span className="text-slate-500 text-sm font-semibold block uppercase tracking-wider">Name</span>
                 <p className="font-bold text-slate-800 dark:text-white text-lg">{String(data?.data?.name || data?.aadhaar?.name || data?.name || 'N/A')}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <span className="text-slate-500 text-sm font-semibold block uppercase tracking-wider">Date of Birth</span>
                    <p className="font-bold text-slate-800 dark:text-white">{String(data?.data?.dob || data?.aadhaar?.dob || data?.dob || 'N/A')}</p>
                 </div>
                 <div>
                    <span className="text-slate-500 text-sm font-semibold block uppercase tracking-wider">Gender</span>
                    <p className="font-bold text-slate-800 dark:text-white">{String(data?.data?.gender || data?.aadhaar?.gender || data?.gender || 'N/A')}</p>
                 </div>
              </div>
              <div>
                 <span className="text-slate-500 text-sm font-semibold block uppercase tracking-wider">Address / Details</span>
                 <p className="font-medium text-slate-800 dark:text-white text-sm break-all">
                   {typeof (data?.data?.splitAddress || data?.aadhaar?.splitAddress || data?.address) === 'object' 
                      ? JSON.stringify(data?.data?.splitAddress || data?.aadhaar?.splitAddress || data?.address) 
                      : String(data?.data?.address || data?.address || 'N/A')}
                 </p>
              </div>
           </div>

           <button 
              onClick={() => navigate('/dashboard/profile')}
              className="mt-2 bg-govblue text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 shadow-md transition-all hover:shadow-lg"
           >
              Back to Profile
           </button>
        </div>
      )}
      
      {!data && !loading && (
        <button 
           onClick={() => navigate('/dashboard/profile')}
           className="mt-5 bg-govblue text-white px-5 py-2 rounded-xl font-bold hover:bg-blue-700 shadow-md transition-all hover:shadow-lg"
        >
           Back to Profile
        </button>
      )}
    </div>
  );
}
