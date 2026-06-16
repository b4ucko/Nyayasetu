import React from 'react';
import { FileText, CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function Terms() {
  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-4">
      {/* Page Header */}
      <div className="text-center mb-16">
        <div className="w-16 h-16 bg-blue-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <FileText className="w-8 h-8 text-govorange" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Terms of Service</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Last updated: June 16, 2026</p>
      </div>

      {/* Warning/Important disclaimer box */}
      <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30 p-6 rounded-3xl mb-12 flex items-start space-x-4">
        <Info className="w-6 h-6 text-govorange shrink-0 mt-1" />
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white mb-1">Important Disclaimer</h4>
          <p className="text-sm text-slate-700 dark:text-slate-350 leading-relaxed font-medium">
            Nyayasetu Advocate is an AI-powered assistant designed to find schemes, verify documents, and parse legal notices. It is NOT a substitute for professional legal advice or official government services.
          </p>
        </div>
      </div>

      {/* Terms Content */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 md:p-10 shadow-sm space-y-8 text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
        <section>
          <h2 className="text-2xl font-bold text-slate-950 dark:text-white mb-4">1. Agreement to Terms</h2>
          <p>
            By accessing or using Nyayasetu Advocate, you agree to comply with and be bound by these Terms of Service. If you do not agree, please discontinue use of the platform immediately.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-950 dark:text-white mb-4">2. Permitted Use</h2>
          <p className="mb-4">
            You agree to use Nyayasetu only for lawful, personal, and informational purposes. Specifically:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>You must not upload malicious documents or try to inject instructions into our RAG text extraction tools.</li>
            <li>You must not scrape or abuse the AI API keys.</li>
            <li>You must provide truthful and accurate demographic inputs to secure accurate scheme suggestions.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-950 dark:text-white mb-4">3. Accuracy of AI Output</h2>
          <p>
            Our RAG model reads thousands of pages of official rules. However, rules change, and exceptions apply. Always verify details with official departments or qualified legal professionals before taking final action. We are not liable for decisions based on AI suggestions.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-950 dark:text-white mb-4">4. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted under law, Nyayasetu and its developers shall not be liable for any direct, indirect, or consequential damages resulting from errors, omissions, or delays in information retrieved via the platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-950 dark:text-white mb-4">5. Modifications to Service</h2>
          <p>
            We reserve the right to modify, suspend, or terminate all or part of Nyayasetu at any time without notice.
          </p>
        </section>
      </div>
    </div>
  );
}
