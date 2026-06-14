import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Shield, FileText, Heart } from 'lucide-react';

function Footer() {
  return (
    <footer className="relative z-10 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8 overflow-hidden transition-colors duration-300">
      {/* Decorative ambient background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-b from-blue-50/80 to-transparent dark:from-blue-900/10 pointer-events-none rounded-full blur-[100px]" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Column 1: Brand & About */}
          <div className="col-span-1 md:col-span-1 lg:col-span-2">
            <Link to="/" className="flex items-center space-x-3 group inline-block mb-6">
              <img src="/logo.png" alt="Omni-Gov Logo" className="w-12 h-12 object-contain transform transition-transform hover:-translate-y-1 hover:rotate-6 duration-300" />
              <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                Omni-Gov <span className="bg-gradient-to-r from-govblue to-govorange text-transparent bg-clip-text">Advocate</span>
              </h2>
            </Link>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md leading-relaxed text-sm md:text-base">
              Empowering digital citizens through multi-agent AI. Discovering the right schemes, validating documents locally, and fighting fraud with next-generation secure tech.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30 px-3 py-1.5 rounded-full">
                <Shield className="w-4 h-4 text-govgreen mr-2" />
                <span className="text-xs font-bold text-green-700 dark:text-green-400">100% Data Private</span>
              </div>
              <div className="flex items-center bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 px-3 py-1.5 rounded-full">
                <FileText className="w-4 h-4 text-govblue mr-2" />
                <span className="text-xs font-bold text-blue-700 dark:text-blue-400">DigiLocker Verified</span>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center">
              Quick Links
            </h3>
            <ul className="space-y-3 lg:space-y-4">
              {[
                { name: 'Home', path: '/' },
                { name: 'Gov Schemes Matcher', path: '/schemes' },
                { name: 'AI Document Scan', path: '/documents' },
                { name: 'Legal Notices Check', path: '/notices' },
                { name: 'Citizen Dashboard', path: '/dashboard' },
              ].map((link, idx) => (
                <li key={idx}>
                  <Link 
                    to={link.path} 
                    className="text-slate-600 dark:text-slate-400 hover:text-govblue dark:hover:text-govblue transition-all duration-300 flex items-center group w-max"
                  >
                    <span className="w-0 group-hover:w-3 h-0.5 bg-govorange mr-0 group-hover:mr-2 rounded-full transition-all duration-300 ease-out opacity-0 group-hover:opacity-100"></span>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Feedback & Contact */}
          <div>
             <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                Feedback / Connect
             </h3>
             <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm leading-relaxed">
                Have a suggestion or found an issue? I would love to hear from you directly!
             </p>
             
             <a 
               href="mailto:saikat.b4ucko@gmail.com"
               className="relative overflow-hidden group flex items-center justify-center space-x-2 bg-gradient-to-r from-govblue to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-5 py-3 rounded-xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-1 transition-all duration-300 w-full"
             >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                <Mail className="w-5 h-5 group-hover:animate-bounce relative z-10" />
                <span className="font-bold relative z-10">Email Feedback</span>
             </a>


          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center text-sm font-medium text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} Omni-Gov Advocate. All rights reserved.
          </div>

        </div>
      </div>
    </footer>
  );
}

export default Footer;
