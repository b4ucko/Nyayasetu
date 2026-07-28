import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-neutral-900 bg-black pt-16 pb-8 text-sm text-neutral-400">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-black rounded-full" />
              </div>
              <span className="font-bold text-white tracking-tight">Nyayasetu</span>
            </Link>
            <p className="max-w-xs text-neutral-500 leading-relaxed">
              Empowering digital citizens through multi-agent AI. Discover schemes, validate documents, and fight fraud.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-medium text-white mb-4">Product</h3>
            <ul className="space-y-3">
              <li><Link to="/schemes" className="hover:text-white transition-colors">Scheme Matcher</Link></li>
              <li><Link to="/notices" className="hover:text-white transition-colors">Legal Assessor</Link></li>
              <li><Link to="/documents" className="hover:text-white transition-colors">Fraud Verifier</Link></li>
              <li><Link to="/voice" className="hover:text-white transition-colors">Voice Assistant</Link></li>
            </ul>
          </div>

          {/* Legal/Contact */}
          <div>
            <h3 className="font-medium text-white mb-4">Resources</h3>
            <ul className="space-y-3">
              <li><Link to="/help-center" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><a href="mailto:saikat.b4ucko@gmail.com" className="hover:text-white transition-colors">Contact Support</a></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-neutral-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} Nyayasetu. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-neutral-600"></span>
              100% Data Private
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-neutral-600"></span>
              DigiLocker Verified
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
