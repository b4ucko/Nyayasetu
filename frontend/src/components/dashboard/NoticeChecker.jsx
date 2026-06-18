import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { UploadCloud, MessageSquare, AlertTriangle, FileText, Send, User, Bot, AlertCircle } from 'lucide-react';
import { ProgressiveFluxLoader } from '../ui/progressive-flux-loader';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const NOTICE_PHASES = [
  { at: 0, label: "uploading document..." },
  { at: 20, label: "scanning layout & text..." },
  { at: 45, label: "analyzing legal jargon..." },
  { at: 75, label: "evaluating options & risks..." },
  { at: 95, label: "summarizing required actions..." },
];

const ExpandableText = ({ text, className }) => {
  const [expanded, setExpanded] = useState(false);
  const safeText = typeof text === 'string' ? text : '';
  const isLong = safeText.length > 80;
  
  const displayText = expanded ? safeText : (isLong ? safeText.slice(0, 80) + '...' : safeText);
  
  return (
    <div className={className}>
       <div className="prose prose-sm dark:prose-invert max-w-none text-current">
         <ReactMarkdown>{displayText}</ReactMarkdown>
       </div>
       {isLong && (
          <button 
             onClick={() => setExpanded(!expanded)} 
             type="button"
             className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 text-xs font-bold mt-1 outline-none"
          >
             {expanded ? 'Read less' : 'Read more'}
          </button>
       )}
    </div>
  );
};

// Pure JS client-side image compression using HTML5 Canvas API
const compressImage = (file) => {
  return new Promise((resolve) => {
    // Only compress images, return PDF files as-is
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Constraint max width and height to 1600px for swift OCR and crisp layout
        const MAX_WIDTH = 1600;
        const MAX_HEIGHT = 1600;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Compress as JPEG format with 0.8 quality factor
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.8
        );
      };
      img.onerror = () => resolve(file);
      img.src = event.target.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
};

export default function NoticeChecker() {
  const [file, setFile] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [progress, setProgress] = useState(0);
  const [tempResult, setTempResult] = useState(null);
  const [animationDone, setAnimationDone] = useState(false);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatContainerRef = useRef(null);

  // Wait for both API response and animation to be complete before showing results
  useEffect(() => {
    if (tempResult && animationDone) {
      setAnalysisResult(tempResult);
      setMessages([
        { 
          role: 'system', 
          content: `I've analyzed your ${tempResult.notice_type || 'notice'}. You can now ask me any specific questions about it, what it means, or what you should do next.` 
        }
      ]);
      setAnalysisLoading(false);
      setTempResult(null);
      setAnimationDone(false);
    }
  }, [tempResult, animationDone]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    // Client-side validations
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
      setValidationError("Unsupported file type. Only PDF and images (.jpg, .jpeg, .png, .webp) are allowed.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setValidationError("File exceeds maximum allowed size of 10MB.");
      return;
    }

    setValidationError('');
    setAnalysisLoading(true);
    setAnalysisError(false);
    setAnalysisResult(null);
    setTempResult(null);
    setAnimationDone(false);
    setProgress(0);
    setMessages([]); // Reset chat when new file is uploaded

    // Phase 1: Preparing/compressing document (0% to 15%)
    setProgress(5);

    // Yield control to the browser's main thread so React has time to render the loader UI and run animations
    setTimeout(async () => {
      let currentProgress = 5;
      
      const compressionProgressInterval = setInterval(() => {
        if (currentProgress < 15) {
          currentProgress += 2;
          setProgress(currentProgress);
        } else {
          clearInterval(compressionProgressInterval);
        }
      }, 50);

      let progressInterval = null;

      try {
        // Compress the image before uploading to reduce network traffic
        const compressedFile = await compressImage(file);
        clearInterval(compressionProgressInterval);
        setProgress(15);
        currentProgress = 15;

        const formData = new FormData();
        formData.append('file', compressedFile);

        // Phase 2: Uploading notice file (15% to 45%)
        const response = await axios.post('http://localhost:8000/api/ai/analyze-notice', formData, {
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const uploadPercent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              // map upload percent (0 to 100) to progress (15 to 45)
              const uploadProgress = 15 + Math.round(uploadPercent * 0.30);
              currentProgress = uploadProgress;
              setProgress(uploadProgress);
            }
          }
        });
        
        // Ensure we hit 45% when upload completes
        setProgress(45);
        currentProgress = 45;

        // Phase 3, 4, 5: Backend processing and AI analysis (45% to 95%)
        // Run a smooth decelerating interval to show ongoing analysis
        progressInterval = setInterval(() => {
          const remaining = 95 - currentProgress;
          const step = Math.max(0.5, remaining * 0.08); // Decelerates calmly as it approaches 95%
          currentProgress = Math.min(95, currentProgress + step);
          setProgress(currentProgress);
        }, 200);

        // Direct JSON parsing from native backend dict (no regex string replacements)
        const cleanData = response.data.analysis;
        const parsedData = typeof cleanData === 'string' ? JSON.parse(cleanData) : cleanData;

        if (progressInterval) clearInterval(progressInterval);
        setProgress(100);
        setTempResult(parsedData);
      } catch (error) {
        console.error("Notice Analysis Error:", error);
        if (compressionProgressInterval) clearInterval(compressionProgressInterval);
        if (progressInterval) clearInterval(progressInterval);
        setAnalysisError(true);
        setAnalysisLoading(false);
      }
    }, 100);
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !analysisResult || chatLoading) return;

    const userMessage = chatInput.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatInput('');
    setChatLoading(true);

    const formData = new FormData();
    formData.append('question', userMessage);
    formData.append('notice_context', JSON.stringify(analysisResult));

    try {
      const response = await axios.post('http://localhost:8000/api/ai/chat-notice', formData);
      setMessages(prev => [...prev, { role: 'ai', content: response.data.reply }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I couldn't process your question at the moment. Please try again." }]);
    }
    setChatLoading(false);
  };



  return (
    <div className="p-4 glass dark:bg-slate-800/50 rounded-2xl shadow-xl w-full max-w-6xl mx-auto space-y-4 border border-white dark:border-slate-700 transition-colors text-left">
      <AnimatePresence mode="wait">
        {analysisLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="py-20 bg-white/40 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-850 rounded-2xl flex flex-col items-center justify-center shadow-inner my-4 w-full"
          >
            <ProgressiveFluxLoader 
              value={progress}
              phases={NOTICE_PHASES} 
              onComplete={() => setAnimationDone(true)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="w-full space-y-4"
          >
          <div className="flex items-center space-x-3 mb-1">
            <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-xl border border-red-200 dark:border-red-800">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white transition-colors">AI Notice Checker</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Upload a legal notice or official letter for instant breakdown & chat.</p>
            </div>
          </div>

          {/* Upload Section */}
          <form onSubmit={handleUpload} className="space-y-2 bg-white/50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Upload Notice Document (Image or PDF)</label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => {
                  setFile(e.target.files[0]);
                  setValidationError('');
                }}
                className="flex-1 p-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm transition-colors file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-600 hover:file:bg-red-100 dark:file:bg-red-900/10 dark:file:text-red-400"
              />
              <button 
                type="submit" 
                disabled={analysisLoading || !file} 
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white font-bold rounded-xl shadow-md disabled:opacity-50 transition w-48 flex items-center justify-center whitespace-nowrap"
              >
                <UploadCloud className="w-4 h-4 mr-2" /> Analyze Notice
              </button>
            </div>
          </form>

          {validationError && (
            <div className="bg-red-50 border border-red-200 p-6 rounded-2xl flex items-start space-x-4 shadow-sm dark:bg-red-900/20 dark:border-red-800">
               <AlertCircle className="w-6 h-6 text-red-500 mt-0.5" />
               <div>
                 <h4 className="text-red-800 dark:text-red-400 font-bold mb-1">Validation Error</h4>
                 <p className="text-red-700 dark:text-red-300 text-sm">{validationError}</p>
               </div>
            </div>
          )}

          {analysisError && (
            <div className="bg-red-50 border border-red-200 p-6 rounded-2xl flex items-start space-x-4 shadow-sm dark:bg-red-900/20 dark:border-red-800">
               <AlertCircle className="w-6 h-6 text-red-500 mt-0.5" />
               <div>
                 <h4 className="text-red-800 dark:text-red-400 font-bold mb-1">Analysis Failed</h4>
                 <p className="text-red-700 dark:text-red-300 text-sm">We couldn't analyze the document. Please ensure it's a clear image or PDF.</p>
               </div>
            </div>
          )}

          {analysisResult && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start mt-4 animate-fade-in-up">
              {/* Analysis View */}
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-3 h-full flex flex-col justify-between">
                <div className="flex items-center space-x-2 pb-2 border-b border-slate-100 dark:border-slate-700 shrink-0">
                   <FileText className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                   <h3 className="font-bold text-base text-slate-800 dark:text-white">Notice Breakdown</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-2 flex-grow overflow-y-auto custom-scrollbar">
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                     <span className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 block mb-1">Notice Type</span>
                     <span className="text-sm font-semibold text-slate-900 dark:text-slate-200">{String(analysisResult.notice_type || 'Unknown')}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                     <span className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 block mb-1">Severity</span>
                     <span className={`text-sm font-bold ${typeof analysisResult.severity === 'string' && analysisResult.severity.includes('High') ? 'text-red-600 dark:text-red-400' : typeof analysisResult.severity === 'string' && analysisResult.severity.includes('Medium') ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                       {String(analysisResult.severity || 'Unknown')}
                     </span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700 col-span-2">
                     <span className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 block mb-1">Sender</span>
                     <ExpandableText text={typeof analysisResult.sender === 'string' ? analysisResult.sender : JSON.stringify(analysisResult.sender || 'Not found')} className="text-sm font-semibold text-slate-900 dark:text-slate-200" />
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700 col-span-2">
                     <span className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 block mb-1">Important Dates</span>
                     <ExpandableText text={typeof analysisResult.key_dates === 'string' ? analysisResult.key_dates : JSON.stringify(analysisResult.key_dates || 'No specific dates found')} className="text-sm font-medium text-red-600 dark:text-red-400" />
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700 col-span-2">
                     <span className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 block mb-1">Plain English Summary</span>
                     <ExpandableText text={typeof analysisResult.summary === 'string' ? analysisResult.summary : JSON.stringify(analysisResult.summary)} className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed" />
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800 col-span-2">
                     <span className="text-xs uppercase font-bold tracking-wider text-red-600 dark:text-red-400 block mb-1">Required Action</span>
                     <ExpandableText text={typeof analysisResult.required_action === 'string' ? analysisResult.required_action : JSON.stringify(analysisResult.required_action)} className="text-sm font-bold text-red-800 dark:text-red-300 leading-relaxed" />
                  </div>
                </div>
              </div>

              {/* Chat View */}
              <div className="flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 h-[450px] overflow-hidden">
                 <div className="p-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 flex items-center space-x-2 shrink-0">
                    <MessageSquare className="w-5 h-5 text-indigo-500" />
                    <h3 className="font-bold text-slate-800 dark:text-white">Ask AI Legal Advisor</h3>
                 </div>
                 
                 <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar bg-slate-50/50 dark:bg-slate-900/10">
                   {messages.map((msg, idx) => (
                     <div key={idx} className={`flex items-start max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse space-x-reverse' : 'mr-auto'} space-x-3`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'bg-slate-200 dark:bg-slate-700'}`}>
                          {msg.role === 'user' ? <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> : <Bot className="w-5 h-5 text-slate-600 dark:text-slate-300" />}
                        </div>
                        <div className={`p-3.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-tl-sm shadow-sm'}`}>
                          {msg.role === 'user' ? (
                            <div className="whitespace-pre-wrap">{msg.content}</div>
                          ) : (
                            <div className="prose prose-sm dark:prose-invert text-slate-700 dark:text-slate-300 max-w-none">
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                          )}
                        </div>
                     </div>
                   ))}
                   {chatLoading && (
                     <div className="flex items-start space-x-3 max-w-[85%] mr-auto">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                          <Bot className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                        </div>
                        <div className="p-4 rounded-2xl rounded-tl-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center space-x-2">
                           <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                           <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                           <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                        </div>
                     </div>
                   )}
                 </div>

                 <form onSubmit={handleChatSubmit} className="p-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shrink-0">
                    <div className="relative flex items-center">
                       <input
                         type="text"
                         value={chatInput}
                         onChange={(e) => setChatInput(e.target.value)}
                         placeholder="Ask about this notice..."
                         disabled={chatLoading}
                         className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
                       />
                       <button 
                         type="submit" 
                         disabled={!chatInput.trim() || chatLoading}
                         className="absolute right-1 p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-colors disabled:opacity-50 disabled:hover:bg-indigo-600"
                       >
                         <Send className="w-4 h-4 ml-0.5" />
                       </button>
                    </div>
                 </form>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
  );
}
