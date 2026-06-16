import React, { useState } from 'react';
import { Search, HelpCircle, BookOpen, MessageSquare, Phone, ArrowRight, ChevronDown, Shield, FileText } from 'lucide-react';

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const categories = [
    { id: 'all', name: 'All FAQs', icon: HelpCircle },
    { id: 'schemes', name: 'Gov Schemes', icon: BookOpen },
    { id: 'verification', name: 'Verification', icon: Shield },
    { id: 'notices', name: 'Legal Notices', icon: FileText }
  ];

  const faqs = [
    {
      id: 1,
      category: 'schemes',
      question: 'How does the Government Schemes Matcher work?',
      answer: 'Our advanced multi-agent AI RAG (Retrieval-Augmented Generation) system compares your demographic profile (extracted from DigiLocker or manually inputted) with thousands of active national and state government policy documents to suggest matches with the highest accuracy.'
    },
    {
      id: 2,
      category: 'verification',
      question: 'Is my uploaded document data secure?',
      answer: 'Absolutely. All documents scanned for validation or fraud check are processed either on-device or via secure, encrypted local environments. We do not store your physical files on our servers, ensuring 100% data privacy.'
    },
    {
      id: 3,
      category: 'notices',
      question: 'What types of legal notices can Nyayasetu analyze?',
      answer: 'Nyayasetu Legal Assessor AI currently supports traffic challans, basic tax notices, and standard civil summons. The engine breaks down legal terminology into simple, plain English/regional languages and suggests immediate steps.'
    },
    {
      id: 4,
      category: 'schemes',
      question: 'Can I apply for schemes directly through the platform?',
      answer: 'Nyayasetu provides you with exact application links, dynamic chatbot guidance, and prefilled draft details to simplify your application process on the official myScheme or state portals.'
    },
    {
      id: 5,
      category: 'verification',
      question: 'How do I connect my DigiLocker?',
      answer: 'Simply log in to your Nyayasetu account, navigate to the Dashboard, and click on "Connect DigiLocker." You will be redirected to the official government portal to authorize read-only secure sharing.'
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeTab === 'all' || faq.category === activeTab;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full max-w-5xl mx-auto py-12 px-4">
      {/* Header section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-6">
          How can we <span className="bg-gradient-to-r from-govblue to-indigo-500 text-transparent bg-clip-text">help you?</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8 font-medium">
          Search our knowledge base or browse categories below to find answers to your questions.
        </p>

        {/* Search bar */}
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search for articles, guides, questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-govblue transition-all"
          />
        </div>
      </div>

      {/* Grid of support pathways */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 rounded-3xl shadow-md flex flex-col">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-slate-800 flex items-center justify-center mb-6">
            <MessageSquare className="w-6 h-6 text-govblue" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Service Chatbot</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 flex-grow leading-relaxed">
            Talk with our active AI Service Bot at the bottom right of any page to get instant answers.
          </p>
          <span className="text-sm font-bold text-govblue inline-flex items-center">
            Active 24/7
          </span>
        </div>

        <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 rounded-3xl shadow-md flex flex-col">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-slate-800 flex items-center justify-center mb-6">
            <Phone className="w-6 h-6 text-govorange" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Voice Assistant</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 flex-grow leading-relaxed">
            Click the microphone float button on the home page to access full multi-lingual voice search.
          </p>
          <span className="text-sm font-bold text-govorange inline-flex items-center">
            Supported in 10 languages
          </span>
        </div>

        <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 rounded-3xl shadow-md flex flex-col">
          <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-slate-800 flex items-center justify-center mb-6">
            <BookOpen className="w-6 h-6 text-govgreen" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Official Portal Guides</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 flex-grow leading-relaxed">
            Read comprehensive step-by-step guides on applying for and updating essential documents.
          </p>
          <span className="text-sm font-bold text-govgreen inline-flex items-center">
            Verified Guides
          </span>
        </div>
      </div>

      {/* Main FAQ area */}
      <div className="border-t border-slate-200 dark:border-slate-800 pt-12">
        <h2 className="text-3xl font-bold text-slate-950 dark:text-white mb-8">Frequently Asked Questions</h2>
        
        {/* Category switcher */}
        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map(cat => {
            const Icon = cat.icon;
            const isActive = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`flex items-center space-x-2 px-5 py-3 rounded-full font-bold transition-all text-sm ${
                  isActive 
                    ? 'bg-govblue text-white shadow-md' 
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* FAQ list */}
        <div className="space-y-4">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map(faq => (
              <div 
                key={faq.id}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm transition-all"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                  className="w-full px-6 py-5 flex justify-between items-center text-left focus:outline-none"
                >
                  <span className="text-lg font-bold text-slate-800 dark:text-white pr-4">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expandedFaq === faq.id ? 'rotate-180' : ''}`} />
                </button>
                
                {expandedFaq === faq.id && (
                  <div className="px-6 pb-6 pt-2 text-slate-600 dark:text-slate-400 font-medium leading-relaxed border-t border-slate-100 dark:border-slate-700/50">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-center py-12 text-slate-500 font-medium">No results found matching your search criteria.</p>
          )}
        </div>
      </div>
    </div>
  );
}
