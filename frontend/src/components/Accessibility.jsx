import React from 'react';
import { Eye, Mic, Globe, Sun, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Accessibility() {
  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-4">
      {/* Page Header */}
      <div className="text-center mb-16">
        <div className="w-16 h-16 bg-blue-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Eye className="w-8 h-8 text-govgreen" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Accessibility Statement</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Last updated: June 16, 2026</p>
      </div>

      {/* Accessibility Commitment */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 md:p-10 shadow-sm space-y-8 text-slate-700 dark:text-slate-300 font-medium leading-relaxed mb-12">
        <section>
          <h2 className="text-2xl font-bold text-slate-950 dark:text-white mb-4">Our Commitment</h2>
          <p>
            At Nyayasetu, we believe that government schemes, legal support, and digital services should be accessible to all citizens, regardless of physical or cognitive abilities. We aim to conform to Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-950 dark:text-white mb-4">Features Available</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="flex items-start space-x-3">
              <Globe className="w-5 h-5 text-govblue shrink-0 mt-1" />
              <div>
                <strong className="text-slate-900 dark:text-white block mb-1">Multi-lingual Support</strong>
                We integrate with localized translation widgets supporting over 10 regional languages instantly.
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Mic className="w-5 h-5 text-govgreen shrink-0 mt-1" />
              <div>
                <strong className="text-slate-900 dark:text-white block mb-1">Voice-enabled Search</strong>
                Our voice-activation system allows you to search and interact with scheme eligibility using your microphone.
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Sun className="w-5 h-5 text-govorange shrink-0 mt-1" />
              <div>
                <strong className="text-slate-900 dark:text-white block mb-1">Dark & Light Mode</strong>
                Supports high contrast switches immediately to lower strain on eyes.
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <ShieldCheck className="w-5 h-5 text-indigo-500 shrink-0 mt-1" />
              <div>
                <strong className="text-slate-900 dark:text-white block mb-1">Semantic Tagging</strong>
                All layouts are built with standard HTML5 tags and descriptive alt-attributes to make screen readers function perfectly.
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-950 dark:text-white mb-4">Reporting Barriers</h2>
          <p>
            If you encounter any accessibility issues, find elements that are difficult to read, or need screen reader corrections, please send us a notice. We strive to correct reported issues within 48 hours.
          </p>
          <p className="mt-4">
            Email feedback: <a href="mailto:saikat.b4ucko@gmail.com" className="font-bold text-govblue hover:underline">saikat.b4ucko@gmail.com</a>
          </p>
        </section>
      </div>
    </div>
  );
}
