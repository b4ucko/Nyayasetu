import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';

function VoiceFAB({ setVoiceBotOpen, isServiceBotOpen, offset }) {
  const location = useLocation();
  if (location.pathname !== '/' || isServiceBotOpen) return null;
  return (
    <button
      onClick={() => setVoiceBotOpen(true)}
      style={{ transform: `translateY(-${offset}px)` }}
      className="fixed bottom-[104px] right-6 z-[60] w-16 h-16 bg-gradient-to-r from-govgreen to-emerald-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-200 group"
      aria-label="Open Voice Assistant"
    >
      <div className="absolute inset-0 bg-govgreen rounded-full animate-ping opacity-20"></div>
      <Mic className="w-8 h-8 text-white group-hover:animate-pulse" />
    </button>
  );
}

function ScrollObserver({ setFooterOffset }) {
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const footer = document.querySelector('footer');
      if (footer) {
        const rect = footer.getBoundingClientRect();
        const diff = window.innerHeight - rect.top;
        if (diff > 0) {
          setFooterOffset(diff);
        } else {
          setFooterOffset(0);
        }
      } else {
        setFooterOffset(0);
      }
    };

    // Evaluate immediately on mount and on route change
    // Using setTimeout to let React render the new DOM first
    setTimeout(handleScroll, 50);
    setTimeout(handleScroll, 300);

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [location.pathname, setFooterOffset]);

  return null;
}

import { Moon, Sun, PhoneCall, Mic, Bot } from 'lucide-react';
import Home from './components/Home';
import ProfileForm from './components/ProfileForm';
import DashboardOverview from './components/DashboardOverview';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './hooks/useAuth';

// AI Advanced Components
import ProfileBuilder from './components/dashboard/ProfileBuilder';
import SchemeMatcher from './components/dashboard/SchemeMatcher';
import SchemeDetails from './components/dashboard/SchemeDetails';
import DocumentAnalyzer from './components/dashboard/DocumentAnalyzer';
import NoticeChecker from './components/dashboard/NoticeChecker';
import VoiceAssistant from './components/dashboard/VoiceAssistant';
import ServiceBot from './components/ServiceBot';
import DigilockerCallback from './components/DigilockerCallback';
import CursorGlow from './components/CursorGlow';
import Footer from './components/Footer';

function Navigation({ theme, toggleTheme }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Check if script already exists to prevent duplicates on unmount/remount
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);

      window.googleTranslateElementInit = () => {
        if (window.google && window.google.translate) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: 'en',
              includedLanguages: 'en,hi,mr,ta,te,bn,gu,kn,ml,ur',
              layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
            },
            'google_translate_element'
          );
        }
      };
    }
  }, []);

  const getLinkClasses = (path) => {
    const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
    const baseClasses = "font-bold px-5 py-2 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg";
    return isActive
      ? `${baseClasses} bg-govblue text-white shadow-md hover:bg-blue-700`
      : `${baseClasses} text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-govblue`;
  };

  return (
    <nav className="glass-nav sticky top-0 z-50 transition-all duration-300">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-3 group">
          <img src="/logo.png" alt="Nyayasetu Logo" className="w-12 h-12 object-contain transform transition-transform group-hover:rotate-12 group-hover:scale-110 duration-300" />
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight transition-colors">
            Nyayasetu <span className="bg-gradient-to-r from-govblue to-govorange text-gradient">Advocate</span>
          </h1>
        </Link>
        <div className="hidden md:flex space-x-6 items-center">
          {/* Google Translate Integration */}
          <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 h-10 shadow-sm transition-colors hover:border-govblue">
            <div id="google_translate_element" className="flex items-center translation-widget"></div>
          </div>

          <Link to="/" className={getLinkClasses('/')}>Home</Link>
          {user ? (
            <>
              <Link to="/dashboard" className={getLinkClasses('/dashboard')}>Dashboard</Link>
              <Link to="/notices" className={getLinkClasses('/notices')}>Notices</Link>
              <button onClick={logout} className="font-bold text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg">Logout</button>
            </>
          ) : (
            <Link to="/login" className="bg-govblue text-white font-bold px-5 py-2 rounded-xl hover:bg-blue-700 shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5">Sign Up Free</Link>
          )}

          <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-2"></div>

          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200 shadow-inner"
            title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </nav>
  );
}

function App() {
  const [userProfile, setUserProfile] = useState(null);
  const [recommendedSchemes, setRecommendedSchemes] = useState([]);

  // Global Service Bot State
  const [globalBotOpen, setGlobalBotOpen] = useState(false);
  const [globalBotContext, setGlobalBotContext] = useState(null);
  // Global Voice Assistant State
  const [voiceBotOpen, setVoiceBotOpen] = useState(false);
  const [isServiceBotOpen, setIsServiceBotOpen] = useState(false);

  const openBot = (ctx = null) => {
    setGlobalBotContext(ctx);
    setGlobalBotOpen(true);
  };

  // Theme state
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  // Footer avoidance state
  const [footerOffset, setFooterOffset] = useState(0);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <AuthProvider>
      <Router>
        <ScrollObserver setFooterOffset={setFooterOffset} />
        <div className="min-h-screen flex flex-col relative overflow-hidden">
          <CursorGlow />

          <Navigation theme={theme} toggleTheme={toggleTheme} />

          {/* Main Content */}
          <main className="flex-grow container mx-auto px-4 sm:px-6 relative z-20 w-full pt-8 pb-16">
            <Routes>
              <Route path="/" element={<Home openBot={openBot} />} />
              <Route path="/login" element={<Login />} />
              <Route path="/callback" element={<DigilockerCallback />} />

              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
                {/* Dashboard now exclusively renders ProfileBuilder as its index */}
                <Route index element={<ProfileBuilder />} />
                <Route path="profile" element={<ProfileBuilder />} />
              </Route>

              {/* Elevated Tools accessible directly */}
              <Route path="/schemes" element={<ProtectedRoute><SchemeMatcher /></ProtectedRoute>} />
              <Route path="/schemes/:id" element={<ProtectedRoute><SchemeDetails /></ProtectedRoute>} />
              <Route path="/documents" element={<ProtectedRoute><DocumentAnalyzer /></ProtectedRoute>} />
              <Route path="/notices" element={<ProtectedRoute><NoticeChecker /></ProtectedRoute>} />
              <Route path="/voice" element={<ProtectedRoute><VoiceAssistant /></ProtectedRoute>} />

              {/* Legacy fallback route */}
              <Route path="/profile" element={<ProfileForm setUserProfile={setUserProfile} setRecommendedSchemes={setRecommendedSchemes} />} />
            </Routes>
          </main>

          {/* Advanced Footer */}
          <Footer />

          {/* Global Voice Assistant FAB */}
          <VoiceFAB setVoiceBotOpen={setVoiceBotOpen} isServiceBotOpen={isServiceBotOpen} offset={footerOffset} />

          <ServiceBot
            externallyOpen={globalBotOpen}
            onExternalClose={() => setGlobalBotOpen(false)}
            initialContext={globalBotContext}
            onStateChange={setIsServiceBotOpen}
            offset={footerOffset}
          />

          {/* Voice Assistant Global Overlay */}
          {voiceBotOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in transition-all">
              <div className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setVoiceBotOpen(false)}
                  className="absolute top-6 right-6 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-700 p-2 rounded-full transition-colors z-[110] flex items-center shadow-sm bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-600"
                  title="Close Voice Assistant"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <VoiceAssistant />
              </div>
            </div>
          )}
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
