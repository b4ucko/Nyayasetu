import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
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
import CursorGlow from './components/CursorGlow';
import Footer from './components/Footer';

// Public legal/help pages
import HelpCenter from './components/HelpCenter';
import Privacy from './components/Privacy';
import Terms from './components/Terms';
import Accessibility from './components/Accessibility';
import ScrollToTop from './components/ScrollToTop';

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

function Navigation() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getLinkClasses = (path) => {
    const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
    const baseClasses = "text-sm font-medium transition-colors duration-200 px-3 py-1.5 rounded-full";
    return isActive
      ? `${baseClasses} text-white bg-white/10`
      : `${baseClasses} text-neutral-400 hover:text-white hover:bg-white/5`;
  };

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
      <div className="nav-pill px-6 py-3 flex items-center gap-8 shadow-2xl">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-black rounded-full" />
          </div>
          <span className="font-bold text-white tracking-tight">Nyayasetu</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-2">
          <Link to="/" className={getLinkClasses('/')}>Home</Link>
          {user ? (
            <>
              <Link to="/dashboard" className={getLinkClasses('/dashboard')}>Dashboard</Link>
              <Link to="/schemes" className={getLinkClasses('/schemes')}>Schemes</Link>
              <Link to="/notices" className={getLinkClasses('/notices')}>Legal</Link>
            </>
          ) : null}
        </div>

        <div className="flex items-center gap-4 border-l border-white/10 pl-4">
          <div id="google_translate_element" className="hidden lg:block"></div>
          {user ? (
            <button onClick={logout} className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">
              Logout
            </button>
          ) : (
            <Link to="/login" className="text-sm font-medium text-black bg-white px-4 py-1.5 rounded-full hover:bg-neutral-200 transition-colors">
              Sign In
            </Link>
          )}
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
        <ScrollToTop />
        <ScrollObserver setFooterOffset={setFooterOffset} />
        <div className="min-h-screen flex flex-col relative overflow-hidden">
          <CursorGlow />

          <Navigation theme={theme} toggleTheme={toggleTheme} />

          {/* Main Content */}
          <main className="flex-grow container mx-auto px-4 sm:px-6 relative z-20 w-full pt-8 pb-16">
            <Routes>
              <Route path="/" element={<Home openBot={openBot} />} />
              <Route path="/login" element={<Login />} />

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

              {/* Public Support & Info Routes */}
              <Route path="/help-center" element={<HelpCenter />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/accessibility" element={<Accessibility />} />
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
