import React from 'react';
import { Shield, Eye, Lock, HardDrive, Key, Mail } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-4">
      {/* Page Header */}
      <div className="text-center mb-16">
        <div className="w-16 h-16 bg-blue-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Shield className="w-8 h-8 text-govblue" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Privacy Policy</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Last updated: June 16, 2026</p>
      </div>

      {/* Core Privacy Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm">
          <Eye className="w-6 h-6 text-govblue mb-4" />
          <h3 className="font-bold text-slate-900 dark:text-white mb-2">Transparency</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            We explicitly state what information we need and exactly how it is used to check policy matching.
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm">
          <HardDrive className="w-6 h-6 text-govgreen mb-4" />
          <h3 className="font-bold text-slate-900 dark:text-white mb-2">Local-First Processing</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Uploaded document analysis is done locally or instantly deleted from server memory after parsing.
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm">
          <Lock className="w-6 h-6 text-govorange mb-4" />
          <h3 className="font-bold text-slate-900 dark:text-white mb-2">Vault Isolation</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Your documents are stored entirely locally on your device, locked strictly to your unique UID, and never shared with third parties.
          </p>
        </div>
      </div>

      {/* Policy Content */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 md:p-10 shadow-sm space-y-8 text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
        <section>
          <h2 className="text-2xl font-bold text-slate-950 dark:text-white mb-4">1. Introduction</h2>
          <p>
            Welcome to Nyayasetu Advocate. We are committed to protecting your personal data and respect your privacy. This Privacy Policy details how we handle, process, and protect your information when using our platform for discovering schemes, scanning documents, or evaluating legal notices.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-950 dark:text-white mb-4">2. Information We Collect</h2>
          <p className="mb-4">
            To provide accurate service matchmaking and document analysis, we may process:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Demographic Information:</strong> Age, state of residence, gender, income range, caste group, and profession to run scheme eligibility checks.</li>
            <li><strong>Document Data:</strong> When uploading PDF/image documents for scan, our AI extracts the textual contents. This data is kept strictly within memory during active computation.</li>
            <li><strong>Account Credentials:</strong> Secure email, name, and access credentials when creating an account.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-950 dark:text-white mb-4">3. Localized Data Policy</h2>
          <p>
            Our core mission is local privacy. For document fraud checking and legal notice decoding, text analysis is run in sandboxed memory. We do not index, catalog, or save your original uploaded PDF files on permanent storage media unless explicitly authorized to save it to your secure citizen vault.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-950 dark:text-white mb-4">4. Secure Local-First Vault</h2>
          <p>
            The Secure Document Vault stores your identity cards and certificates locally in your browser. All data is keyed strictly under your unique Supabase User ID (UID), ensuring that no other user or third party can ever access your personal details or documents.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-950 dark:text-white mb-4">5. Contact Information</h2>
          <p className="mb-4">
            If you have questions, feedback, or request the deletion of your account metadata, please reach out to us:
          </p>
          <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl">
            <Mail className="w-5 h-5 text-govblue" />
            <a href="mailto:saikat.b4ucko@gmail.com" className="font-bold text-govblue hover:underline">
              saikat.b4ucko@gmail.com
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
