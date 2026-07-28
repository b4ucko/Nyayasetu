import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-8 text-slate-600">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-900 rounded flex items-center justify-center">
                <span className="text-white font-bold font-serif text-lg leading-none">N</span>
              </div>
              <span className="font-bold text-slate-900 tracking-tight text-xl font-serif">Nyayasetu</span>
            </Link>
            <p className="text-sm leading-relaxed mb-6">
              Empowering Indian citizens with accessible legal knowledge, scheme matching, and document verification.
            </p>
            <div className="text-sm">
              <strong>Support:</strong> <a href="mailto:support@nyayasetu.in" className="text-blue-700 hover:underline">support@nyayasetu.in</a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-sm">Services</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/schemes" className="hover:text-blue-700 transition-colors">Welfare Scheme Matcher</Link></li>
              <li><Link to="/notices" className="hover:text-blue-700 transition-colors">Legal Notice Analysis</Link></li>
              <li><Link to="/documents" className="hover:text-blue-700 transition-colors">Document Verification</Link></li>
              <li><Link to="/voice" className="hover:text-blue-700 transition-colors">Regional Voice Assistant</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-sm">Resources</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/help-center" className="hover:text-blue-700 transition-colors">Help Center & FAQ</Link></li>
              <li><a href="#" className="hover:text-blue-700 transition-colors">Citizen Rights Guide</a></li>
              <li><a href="#" className="hover:text-blue-700 transition-colors">API Documentation</a></li>
              <li><a href="#" className="hover:text-blue-700 transition-colors">System Status</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-sm">Legal</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/privacy" className="hover:text-blue-700 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-blue-700 transition-colors">Terms of Service</Link></li>
              <li><Link to="/accessibility" className="hover:text-blue-700 transition-colors">Accessibility Statement</Link></li>
              <li><a href="#" className="hover:text-blue-700 transition-colors">Data Processing Addendum</a></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p>&copy; {new Date().getFullYear()} Nyayasetu Digital Infrastructure. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              All Systems Operational
            </span>
            <div className="hidden md:flex gap-4">
              <a href="#" className="hover:text-blue-700">Twitter</a>
              <a href="#" className="hover:text-blue-700">LinkedIn</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
