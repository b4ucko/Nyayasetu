import React, { useState, useRef } from 'react';
import axios from 'axios';
import { AlertCircle, WifiOff, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../supabase';

export default function VoiceAssistant() {
  const { user } = useAuth();
  const [transcript, setTranscript] = useState('');
  const [replyText, setReplyText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const isMutedRef = useRef(false);

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    isMutedRef.current = newMuted;
    if (newMuted) {
      window.speechSynthesis.cancel();
    }
  };

  // Force voice loading on mount so it's ready when needed
  React.useEffect(() => {
    window.speechSynthesis.getVoices();
  }, []);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    setErrorMsg(''); // Clear previous errors
    window.speechSynthesis.cancel(); // Stop any pending speech
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        setTranscript('Audio recorded successfully and sent to AI...');
        await handleVoiceQuery(formData);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setReplyText('');
      setTranscript('Listening... Speak now and tap again to stop.');
      
    } catch (err) {
      console.error(err);
      setErrorMsg("Microphone access denied or unsupported. Please allow permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleVoiceQuery = async (payload) => {
    setLoading(true);
    setErrorMsg('');
    try {
      let profileStr = "";
      if (user) {
         const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
         if (data && !error) profileStr = JSON.stringify(data);
      }

      const isFormData = payload instanceof FormData;
      let fd = payload;
      
      if (!isFormData) {
        fd = new FormData();
        fd.append('transcript', payload.transcript);
        setTranscript(payload.transcript);
      }
      
      if (profileStr) {
        fd.append('profile_context', profileStr);
      }
      
      const response = await axios.post('http://localhost:8000/api/ai/voice', fd);
      
      const { reply } = response.data;
      setReplyText(reply);
      
      // Filter out Markdown artifacts and read response aloud natively
      const plainReply = reply.replace(/\*/g, '').replace(/#/g, '');
      const utterance = new SpeechSynthesisUtterance(plainReply);
      
      // Tune for a softer, more natural human inflection
      utterance.pitch = 1.0; // Natural pitch (less creepy)
      utterance.rate = 1.0; // Natural pacing

      // Attempt to find a native Indian Female Voice or Google's female voice
      const voices = window.speechSynthesis.getVoices();
      
      // Specifically target known Female voices and STRICTLY avoid 'Ravi', 'David', or 'Mark'
      let preferredVoice = voices.find(v => 
          v.name.includes('Neerja') || 
          v.name.includes('Heera') || 
          v.name.includes('Google UK English Female') || 
          (v.lang.includes('en-IN') && v.name.toLowerCase().includes('female')) ||
          v.name.includes('Zira') || 
          v.name.includes('Hazel')
      );

      if (!preferredVoice) {
         preferredVoice = voices.find(v => v.name.toLowerCase().includes('female'));
      }

      // Absolute fallback if no explicitly named "Female" voice is found: Pick anything that isn't a known male
      if (!preferredVoice) {
         preferredVoice = voices.find(v => !v.name.includes('David') && !v.name.includes('Ravi') && !v.name.includes('Mark') && v.lang.startsWith('en'));
      }
      
      if (preferredVoice) {
         utterance.voice = preferredVoice;
      }
      
      window.speechSynthesis.cancel();
      if (!isMutedRef.current) {
         window.speechSynthesis.speak(utterance);
      }

    } catch (error) {
      console.error("Voice Error:", error);
      let errorMessage = "Backend error. Ensure the server is running and API keys are set.";
      if (error.response?.data?.detail) errorMessage = error.response.data.detail;
      setErrorMsg(errorMessage);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 glass dark:bg-slate-800/50 rounded-2xl shadow-xl max-w-2xl mx-auto text-center border border-white dark:border-slate-700 transition-colors relative">
      <div className="absolute top-6 right-20 z-[110]">
        <button 
          onClick={toggleMute} 
          className="p-2 rounded-full transition-colors flex items-center shadow-sm bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 text-slate-400 hover:text-govblue hover:bg-blue-50 dark:hover:bg-slate-700"
          title={isMuted ? "Unmute Assistant" : "Mute Assistant"}
        >
          {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6 text-govblue" />}
        </button>
      </div>
      <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-white transition-colors">Gov Voice Assistant</h2>
      <p className="text-slate-600 dark:text-slate-400 mb-8 transition-colors">Speak naturally or type your query. We listen and reply instantly.</p>
      
      {errorMsg && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-xl flex items-center justify-center space-x-3 text-sm font-medium animate-fade-in transition-colors">
          {errorMsg.includes('Network') ? <WifiOff className="w-5 h-5 text-red-500" /> : <AlertCircle className="w-5 h-5 text-red-500" />}
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Microphone Interaction Button */}
      <button 
        onClick={isRecording ? stopRecording : startRecording}
        className={`w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg transition-all border-4 ${isRecording ? 'bg-red-500 border-red-400 animate-pulse scale-110 shadow-red-500/50' : 'bg-gradient-to-br from-govblue to-blue-600 border-indigo-400 hover:scale-105 shadow-blue-500/30'}`}
      >
        <span className="text-5xl text-white">
           {isRecording ? "⏹" : "🎤"}
        </span>
      </button>

      {transcript && (
        <div className="mb-4 text-center font-medium text-govblue dark:text-blue-400 animate-fade-in">
          {transcript}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center space-x-3 text-govorange font-medium animate-pulse py-4">
           <div className="w-5 h-5 border-2 border-govorange border-t-transparent rounded-full animate-spin"></div>
           <span>Processing audio and generating smart reply...</span>
        </div>
      )}

      {replyText && !loading && (
        <div className="mt-6 bg-green-50 dark:bg-green-900/20 p-6 rounded-2xl border border-green-100 dark:border-green-800 transition-colors w-full text-left relative animate-fade-in shadow-inner">
          <div className="flex items-center text-xs text-green-700 dark:text-green-400 font-bold uppercase mb-4 tracking-wider">
             <Volume2 className="w-4 h-4 mr-2 animate-pulse text-green-600 dark:text-green-500" /> Assistant Says:
          </div>
          <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed" style={{whiteSpace: 'pre-wrap'}}>
             {replyText}
          </p>
        </div>
      )}

      {/* Manual Text Fallback */}
      <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 w-full animate-fade-in">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 text-left">Prefer typing? Enter your query below:</p>
        <div className="flex items-center space-x-2 w-full">
          <input 
            type="text"
            placeholder="Type your question here and hit Enter..."
            className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-govblue transition-all"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                window.speechSynthesis.cancel();
                handleVoiceQuery({ transcript: e.target.value });
                e.target.value = '';
              }
            }}
          />
          <button 
            className="bg-govblue hover:bg-blue-600 text-white font-bold p-3 rounded-xl transition-colors shadow-sm"
            onClick={(e) => {
              const input = e.target.previousElementSibling;
              if (input.value.trim()) {
                 window.speechSynthesis.cancel();
                 handleVoiceQuery({ transcript: input.value });
                 input.value = '';
              }
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
