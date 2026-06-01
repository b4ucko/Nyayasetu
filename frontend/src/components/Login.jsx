import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Login() {
  const { loginWithGoogle, loginWithEmail, signupWithEmail, user } = useAuth();
  const navigate = useNavigate();

  const [isSignup, setIsSignup] = useState(true); // Default to signup to emphasize it
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem('omnigov_remember_me') === 'true');

  const handleRememberMeChange = (e) => {
    const isChecked = e.target.checked;
    setRememberMe(isChecked);
    if (isChecked) {
        localStorage.setItem('omnigov_remember_me', 'true');
        // Copy any active Supabase sessions from sessionStorage to localStorage
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && key.startsWith('sb-')) {
            localStorage.setItem(key, sessionStorage.getItem(key));
          }
        }
    } else {
        localStorage.removeItem('omnigov_remember_me');
        // Clean up Supabase session keys from localStorage
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('sb-')) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
    }
  };

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please fill in all fields.");
      return;
    }
    
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      if (isSignup) {
        const data = await signupWithEmail(email, password);
        // Supabase requires email verification by default, resulting in a user without a session initially.
        if (data?.user && !data?.session) {
           setSuccessMsg("Account created! 📧 Please check your email to verify your account to proceed. (If testing locally, disable 'Confirm Email' in Supabase Auth settings).");
           setIsSignup(false);
           return;
        }
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err) {
      console.error(err);
      if (err.message && err.message.toLowerCase().includes('rate limit')) {
         setErrorMsg("Supabase Email Limit Exceeded (3 per hour). To fix this immediately: Go to your Supabase Dashboard -> Authentication -> Providers -> Email -> Turn OFF 'Confirm Email'.");
      } else {
         setErrorMsg(err.message || "Authentication failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Failed to initialize Google login.");
    } finally {
      setLoading(false);
    }
  };

  if (user) return null; // Prevent flicker

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors p-4 relative overflow-hidden pt-12">
      
      {/* Decorative blobs */}
      <div className="absolute top-0 -left-10 w-[500px] h-[500px] bg-govblue/10 dark:bg-govblue/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 -right-10 w-[400px] h-[400px] bg-govorange/10 dark:bg-govorange/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="glass dark:bg-slate-800/90 p-8 sm:p-12 max-w-[480px] w-full rounded-3xl shadow-2xl relative z-10 border dark:border-slate-700 transition-colors">
        
        <div className="mb-10 flex flex-col items-center">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 text-center transition-colors">
              {isSignup ? "Create Your Account" : "Welcome Back"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-center">
              {isSignup ? "Join Nyayasetu and discover benefits tailored for you." : "Sign in to access your citizen dashboard."}
            </p>
        </div>

        {errorMsg && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-xl flex items-center text-sm font-medium animate-fade-in shadow-sm">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 p-4 rounded-xl flex items-center text-sm font-medium animate-fade-in shadow-sm">
            <ShieldCheck className="w-5 h-5 mr-3 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Remember Me Toggle */}
        <div className="flex items-center justify-between mb-6">
          <label className="flex items-center cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input 
                 type="checkbox" 
                 checked={rememberMe} 
                 onChange={handleRememberMeChange}
                 className="peer sr-only" 
              />
              <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 rounded flex items-center justify-center peer-checked:bg-govblue peer-checked:border-govblue transition-colors relative">
                 <ShieldCheck className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity absolute" />
              </div>
            </div>
            <span className="ml-3 text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-white transition-colors">Remember my device</span>
          </label>
        </div>

        {/* Primary Google Auth Button */}
        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          type="button"
          className="w-full bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 py-4 px-6 rounded-2xl font-bold shadow-sm hover:shadow-md transition-all flex items-center justify-center space-x-3 group relative overflow-hidden"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6 z-10" />
          <span className="z-10 text-lg">Continue with Google</span>
          <div className="absolute inset-0 w-full h-full bg-slate-50/50 dark:bg-slate-800/50 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
        </button>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white dark:bg-slate-800 text-slate-400 font-semibold transition-colors">or continue with email</span>
          </div>
        </div>

        {/* Secondary Email Auth Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-4">
           <div>
             <div className="relative">
               <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                 <Mail className="h-5 w-5 text-slate-400" />
               </div>
               <input 
                 type="email" 
                 className="block w-full pl-12 pr-4 py-3.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-govblue focus:border-transparent transition-all font-medium"
                 placeholder="citizen@india.gov.in"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 required
               />
             </div>
           </div>
           
           <div>
             <div className="relative">
               <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                 <Lock className="h-5 w-5 text-slate-400" />
               </div>
               <input 
                 type="password" 
                 className="block w-full pl-12 pr-4 py-3.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-govblue focus:border-transparent transition-all font-medium"
                 placeholder="Password"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 required
               />
             </div>
           </div>

           <button 
             type="submit" 
             disabled={loading}
             className="w-full bg-slate-800 hover:bg-slate-900 dark:bg-govblue dark:hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-md group disabled:opacity-70 flex justify-center items-center"
           >
             {loading ? 'Processing...' : (
                <>
                  {isSignup ? 'Sign Up with Email' : 'Sign In with Email'}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
             )}
           </button>
        </form>

        <div className="mt-10 text-center border-t border-slate-100 dark:border-slate-700 pt-6">
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            {isSignup ? "Already have an account?" : "Don't have an account?"}
            <button 
              type="button"
              onClick={() => { setIsSignup(!isSignup); setErrorMsg(''); setEmail(''); setPassword(''); }}
              className="ml-2 text-govblue dark:text-govorange hover:underline font-bold transition-colors focus:outline-none"
            >
              {isSignup ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
