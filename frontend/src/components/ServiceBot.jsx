import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, User, ChevronRight, FileText, CheckCircle, Search, Maximize2, Minimize2, Mic, MicOff, Loader2, Volume2, VolumeX, Download, Mail, Bot } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../supabase';
import html2pdf from 'html2pdf.js';

export default function ServiceBot({ externallyOpen = false, onExternalClose = null, initialContext = null, onStateChange = null, offset = 0 }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceLoading, setIsVoiceLoading] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Namaste! I am your Omni-Gov Service Assistant. How can I help you today?', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('menu'); // menu, pan_apply, track_status, document_guide, document_guide_menu
  const messagesEndRef = useRef(null);

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

  // PAN Flow State
  const [panStep, setPanStep] = useState(0);
  const [panDetails, setPanDetails] = useState({ name: '', dob: '', fatherName: '', aadhaar: '' });
  const [trackingId, setTrackingId] = useState(null);

  // Tracking Flow State
  const [trackStep, setTrackStep] = useState(0);
  const [trackDetails, setTrackDetails] = useState({ appType: '', trackingId: '', mobile: '' });

  // Document Guide Flow State
  const [docGuideStep, setDocGuideStep] = useState(0);
  const [docDetails, setDocDetails] = useState({ documentName: '', residency: '', ageState: '' });

  // Update Document Flow State
  const [updateStep, setUpdateStep] = useState(0);
  const [updateDetails, setUpdateDetails] = useState({ documentName: '', documentId: '', fieldToUpdate: '', newValue: '' });

  // Document Generator Flow State
  const [genDocStep, setGenDocStep] = useState(0);
  const [genDocDetails, setGenDocDetails] = useState({ docType: '', problemDesc: '', additionalContext: '' });
  const [generatedDoc, setGeneratedDoc] = useState(null);
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    if (externallyOpen) setIsOpen(true);
  }, [externallyOpen]);

  useEffect(() => {
    if (onStateChange) onStateChange(isOpen);
  }, [isOpen, onStateChange]);

  useEffect(() => {
    if (initialContext && externallyOpen) {
      if (initialContext.type === 'document') {
        setMode('document_guide');
        setDocDetails(prev => ({ ...prev, documentName: initialContext.name }));
        setDocGuideStep(2);
        setMessages([
          { type: 'bot', text: 'Namaste! I am your Omni-Gov Service Assistant. How can I help you today?', timestamp: new Date() },
          { type: 'bot', text: `I see you want to know about the **${initialContext.name}**. \n\n${initialContext.desc}\n\nTo help you with the application process, please tell me your current Residency Status (e.g. Resident Indian, NRI).`, timestamp: new Date() }
        ]);
      } else if (initialContext.type === 'platform') {
        setMode('platform_guide');
        setMessages([
          { type: 'bot', text: 'Namaste! I am your Omni-Gov Service Assistant. How can I help you today?', timestamp: new Date() },
          { type: 'bot', text: `I see you want to learn how to register and use **${initialContext.name}**. \n\n${initialContext.desc}\n\nTo get started with the registration guide, do you already have an Aadhaar-linked mobile number active? (Yes/No)`, timestamp: new Date() }
        ]);
      }
    }
  }, [initialContext, externallyOpen]);

  const handleClose = () => {
    setIsOpen(false);
    setIsMaximized(false);
    setMode('menu');
    if (onExternalClose) onExternalClose();
  };

  const addMessage = (type, text) => {
    setMessages(prev => [...prev, { type, text, timestamp: new Date() }]);
  };

  const handleMenuSelect = (selectedMode) => {
    if (selectedMode === 'pan_apply') {
      setMode('pan_apply');
      setPanStep(1);
      addMessage('user', 'I want to apply for a new PAN Card.');
      setTimeout(() => {
        addMessage('bot', 'Great! I can help you apply for a new PAN card. Let\'s get started. Please enter your Full Name exactly as it appears on your Aadhaar.');
      }, 600);
    } else if (selectedMode === 'track_status') {
      setMode('track_status');
      setTrackStep(1);
      addMessage('user', 'I want to track an application.');
      setTimeout(() => {
        addMessage('bot', 'Sure! First, please tell me which application you want to track (e.g. PAN Card, Passport, Voter ID).');
      }, 600);
    } else if (selectedMode === 'document_guide') {
      setMode('document_guide');
      setDocGuideStep(1);
      addMessage('user', 'I need info on applying for an Essential Document.');
      setTimeout(() => {
        addMessage('bot', 'Which document do you need help with? (e.g. Aadhaar Card, Passport, Voter ID, Driving License)');
      }, 600);
    } else if (selectedMode === 'update_document') {
      setMode('update_document');
      setUpdateStep(1);
      addMessage('user', 'I want to update details on my document.');
      setTimeout(() => {
        addMessage('bot', 'No problem. Which document do you want to update? (e.g., Aadhaar Card, PAN Card, Voter ID)');
      }, 600);
    } else if (selectedMode === 'generate_document') {
      setMode('generate_document');
      setGenDocStep(1);
      setGeneratedDoc(null);
      addMessage('user', 'I want to generate a legal document or reply.');
      setTimeout(() => {
        addMessage('bot', 'No problem! What kind of document do you need? (e.g., RTI Application, Appeal Letter, Reply to Notice, Grievance Draft)');
      }, 600);
    } else if (selectedMode === 'eligible_schemes') {
      addMessage('user', 'Know about eligible schemes');
      setTimeout(() => {
        addMessage('bot', 'I can help with that! By analyzing your profile details, you can find eligible schemes, view detailed requirements, and apply directly. Taking you to the Scheme Matcher portal now...');
        setTimeout(() => {
           setIsOpen(false);
           navigate('/schemes');
        }, 3000);
      }, 600);
    } else if (selectedMode === 'legal_question') {
      setMode('general_chat');
      addMessage('user', 'Ask a legal question');
      setTimeout(() => {
        addMessage('bot', 'Sure! Please type or speak your legal question here, and our AI will provide step-by-step verified guidance.');
      }, 600);
    }
  };

  const handlePanFlow = (value) => {
    addMessage('user', value);
    setInput('');

    setTimeout(() => {
      switch (panStep) {
        case 1:
          setPanDetails(prev => ({ ...prev, name: value }));
          setPanStep(2);
          addMessage('bot', `Thanks, ${value}. Now, please enter your Date of Birth (DD/MM/YYYY).`);
          break;
        case 2:
          setPanDetails(prev => ({ ...prev, dob: value }));
          setPanStep(3);
          addMessage('bot', 'Got it. Now please enter your Father\'s Full Name.');
          break;
        case 3:
          setPanDetails(prev => ({ ...prev, fatherName: value }));
          setPanStep(4);
          addMessage('bot', 'Finally, please enter your 12-digit Aadhaar Number.');
          break;
        case 4:
          setPanDetails(prev => ({ ...prev, aadhaar: value }));
          setPanStep(5);
          // Show summary
          addMessage('bot', 'Perfect. Please verify your details below before generating the application:');
          break;
        default:
          break;
      }
    }, 800);
  };

  const confirmPanApplication = () => {
    const newTrackingId = `PAN-2026-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    setTrackingId(newTrackingId);
    setPanStep(6);
    addMessage('bot', `Application successfully submitted! 🎉\n\nYour Tracking ID is: **${newTrackingId}**\n\nYou can use this ID to check your status later.`);
  };

  const handleTrackStatusFlow = (value) => {
    addMessage('user', value);
    setInput('');

    setTimeout(() => {
      switch (trackStep) {
        case 1:
          setTrackDetails(prev => ({ ...prev, appType: value }));
          setTrackStep(2);
          addMessage('bot', `Great! You are tracking a ${value} application. Please provide your Application Tracking ID or Reference Number.`);
          break;
        case 2:
          setTrackDetails(prev => ({ ...prev, trackingId: value }));
          setTrackStep(3);
          addMessage('bot', "Got it. Finally, please enter your registered 10-digit Mobile Number for verification.");
          break;
        case 3:
          setTrackDetails(prev => ({ ...prev, mobile: value }));
          setTrackStep(4);
          addMessage('bot', 'Perfect. Please review the details below before I fetch the status from the concerned department:');
          break;
        default: break;
      }
    }, 800);
  };

  const confirmTrackStatus = () => {
    setTrackStep(5);
    const id = trackDetails.trackingId;
    if (id.startsWith('PAN-')) {
      addMessage('bot', `Tracking Status for ${id}:\n\n🟢 Status: Processing at NSDL\n📆 Expected Dispatch: 7 Working Days\n📍 Current Stage: Document Verification`);
    } else {
      addMessage('bot', `Tracking Status for ${id}:\n\n🟠 Status: Under Review\nNote: We are processing your request. Please check back later.`);
    }
    setTimeout(() => {
       addMessage('bot', 'Is there anything else I can help you with today? Type "menu" to return to the main options.');
       setMode('general_chat');
    }, 1500);
  };

  const handleDocumentGuideFlow = (value) => {
    addMessage('user', value);
    setInput('');

    setTimeout(() => {
      switch (docGuideStep) {
        case 1:
          setDocDetails(prev => ({ ...prev, documentName: value }));
          setDocGuideStep(2);
          addMessage('bot', `Let's gather information for your ${value}. To start, please tell me your current Residency Status (e.g. Resident Indian, NRI).`);
          break;
        case 2:
          setDocDetails(prev => ({ ...prev, residency: value }));
          setDocGuideStep(3);
          addMessage('bot', "Noted. Could you also provide your Age and Current State of Residence? This helps me determine the exact eligibility criteria for you.");
          break;
        case 3:
          setDocDetails(prev => ({ ...prev, ageState: value }));
          setDocGuideStep(4);
          addMessage('bot', 'Thank you! Please confirm your profile details below before I generate your complete document guide:');
          break;
        default: break;
      }
    }, 800);
  };

  const confirmDocumentGuide = () => {
    setDocGuideStep(5);
    const doc = docDetails.documentName.toLowerCase();
    let guideText = "";
    
    if (doc.includes('aadhaar')) {
      guideText = `Here is your complete guide for Aadhaar Card!

📄 **Eligibility:** Any resident of India (including foreigners residing in India for 182 days or more).
📍 **State Norms:** Valid Pan-India.

**Required Documents:**
• Proof of Identity (POI) (e.g., PAN, Passport, Voter ID)
• Proof of Address (POA) (e.g., Ration card, Bank/Post Office Passbook, Electricity Bill)
• Proof of Date of Birth (PDB) (e.g., Birth Certificate, SSC Certificate, Passport)

**Next Steps to Apply:**
1. Locate your nearest Aadhaar Enrolment Centre online at the UIDAI portal. You can book an appointment online to skip the queue.
2. Visit the centre carrying your original POI, POA, and PDB documents.
3. Fill out the Aadhaar Enrolment Form available at the centre.
4. Provide biometric data (fingerprints, iris scan) and demographic details securely to the operator.
5. Collect the acknowledgment slip containing your 14-digit Enrolment ID (EID) to track status.
6. Your Aadhaar will be dispatched within 90 days, or you can download the e-Aadhaar online immediately once generated.

If you need any other help, type "menu" to choose another option.`;
    } else if (doc.includes('passport')) {
      guideText = `Here is your complete guide for Indian Passport!

📄 **Eligibility:** ${docDetails.residency === 'NRI' ? 'Indian Citizens residing abroad.' : 'Indian Citizens by birth, descent, or registration.'}
📍 **State Norms:** Issued centrally by the Ministry of External Affairs, India.

**Required Documents:**
• Proof of Present Address (e.g., Aadhaar, Utility Bill, Passbook)
• Proof of Date of Birth (e.g., Birth Certificate, Aadhaar, PAN)
• Original Education Certificate (for Non-ECR categories)

**Next Steps to Apply:**
1. Register on the Passport Seva Online Portal (passportindia.gov.in) and login to the portal.
2. Click on "Apply for Fresh Passport/Re-issue of Passport".
3. Fill in the required details inside the form and submit it.
4. Click on "Pay and Schedule Appointment" on the "View Saved/Submitted Applications" screen.
5. Print the application receipt containing your Application Reference Number (ARN).
6. Visit the Passport Seva Kendra (PSK) with your original documents on the scheduled date.
7. Complete police verification (usually required before dispatch) to receive the passport via post.

If you need any other help, type "menu" to choose another option.`;
    } else if (doc.includes('voter')) {
      guideText = `Here is your complete guide for Voter ID (EPIC)!

📄 **Eligibility:** Indian citizens aged 18 years or above as of Jan 1st of the current year.
📍 **State Norms:** Valid in ${docDetails.ageState || 'your state'}.

**Required Documents:**
• One passport-sized photograph
• Proof of Identity / Age (e.g., Aadhaar, Birth Certificate, PAN, Passport)
• Proof of Address (e.g., Aadhaar, Bank Passbook, Ration Card, Utility Bill)

**Next Steps to Apply:**
1. Visit the NVSP Portal/Voters' Service Portal (voters.eci.gov.in) or download the Voter Helpline App.
2. Create an account and log in.
3. Select "New Voter Registration" and fill out **Form 6** completely.
4. Upload scanned copies of your recent photograph, Age Proof, and Address Proof.
5. Submit the form. You will receive a Reference ID to track your application.
6. A Booth Level Officer (BLO) may visit your address for physically verifying the details.
7. Once approved, the plastic Voter ID will be delivered via Speed Post.

If you need any other help, type "menu" to choose another option.`;
    } else if (doc.includes('driving') || doc.includes('license')) {
      guideText = `Here is your complete guide for Driving License!

📄 **Eligibility:** Must be 18+ years for light motor vehicles, 16+ for gearless 2-wheelers.
📍 **State Norms:** Issued by your Regional Transport Office (RTO) in ${docDetails.ageState || 'your state'}.

**Required Documents:**
• Proof of Address (e.g., Aadhaar, Passport, Voter ID)
• Proof of Age (e.g., Birth Certificate, PAN, SSC Marksheet)
• Medical Certificate (Form 1A) - usually for applicants above 40 or for commercial vehicles.
• 3 Passport-sized photographs

**Next Steps to Apply:**
1. Visit the Parivahan Sewa portal (sarathi.parivahan.gov.in) and select your state.
2. Apply for a **Learner's License (LL)** first by filling out the online application and securely uploading given documents.
3. Pay the fee and book a slot for your LL test (or take it online via Aadhaar authentication in many states).
4. Upon passing the sign test, download your Learner's License (valid for 6 months).
5. After 30 days of getting the LL, apply for a **Permanent Driving License (DL)** on the same portal.
6. Book a slot for your driving test at the local RTO, bring your own vehicle, and take the final driving test.
7. Upon passing, the smart DL will be sent to your registered address via post.

If you need any other help, type "menu" to choose another option.`;
    } else {
      guideText = `Here is your complete guide for ${docDetails.documentName}!

📄 **Eligibility:** Verified for ${docDetails.residency}
📍 **State Norms:** Applied for ${docDetails.ageState || 'your state'}

**Next Steps:**
1. You can apply via the official central or state government portal online.
2. Alternatively, visit your nearest Common Service Center (CSC) with your basic KYC documents (Aadhaar, PAN, Passport photos).

If you need any other help, type "menu" to choose another option.`;
    }
    
    addMessage('bot', guideText);
    setTimeout(() => {
       setMode('general_chat');
    }, 2000);
  };

  const handleUpdateDocumentFlow = (value) => {
    addMessage('user', value);
    setInput('');

    setTimeout(() => {
      switch (updateStep) {
        case 1:
          setUpdateDetails(prev => ({ ...prev, documentName: value }));
          setUpdateStep(2);
          addMessage('bot', `Got it. What specific information do you need to change on your ${value}? (e.g., Address, Mobile Number, Name, DOB)`);
          break;
        case 2:
          setUpdateDetails(prev => ({ ...prev, fieldToUpdate: value }));
          setUpdateStep(3);
          addMessage('bot', `Please provide your ${updateDetails.documentName || 'Document'} Number for secure verification.`);
          break;
        case 3:
          setUpdateDetails(prev => ({ ...prev, documentId: value }));
          setUpdateStep(4);
          addMessage('bot', `Verification successful! Finally, what is the new ${updateDetails.fieldToUpdate || 'value'} you want to update it to?`);
          break;
        case 4:
          setUpdateDetails(prev => ({ ...prev, newValue: value }));
          setUpdateStep(5);
          addMessage('bot', 'Perfect. Please review your update request below before submission:');
          break;
        default: break;
      }
    }, 800);
  };

  const confirmUpdateDocument = () => {
    setUpdateStep(6);
    const newTrackingId = `UPD-2026-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    addMessage('bot', `Update request successfully submitted! 🎉\n\nYour Update Tracking ID is: **${newTrackingId}**\n\nWe will verify the new ${updateDetails.fieldToUpdate} and update your ${updateDetails.documentName} within 7-10 working days.`);
    setTimeout(() => {
       addMessage('bot', 'Is there anything else I can help you with today? Type "menu" to return to the main options.');
       setMode('general_chat');
    }, 2500);
  };

  const handleGenerateDocumentFlow = (value) => {
    addMessage('user', value);
    setInput('');

    setTimeout(() => {
      switch (genDocStep) {
        case 1:
          setGenDocDetails(prev => ({ ...prev, docType: value }));
          setGenDocStep(2);
          addMessage('bot', `Great. You want to draft a ${value}. Please describe your issue clearly (e.g., 'My pension application was rejected', 'Delay in Aadhaar update').`);
          break;
        case 2:
          setGenDocDetails(prev => ({ ...prev, problemDesc: value }));
          setGenDocStep(3);
          addMessage('bot', 'Got it. Are there any specific reference numbers, dates, or additional context you want me to include? (Say "No" if none)');
          break;
        case 3:
          setGenDocDetails(prev => ({ ...prev, additionalContext: value }));
          setGenDocStep(4);
          addMessage('bot', 'Perfect. Please review your request before I draft the document:');
          break;
        default: break;
      }
    }, 800);
  };

  const confirmGenerateDocument = async () => {
    setGenDocStep(5);
    setIsGeneratingDoc(true);
    addMessage('bot', 'Generating your document... 📝');
    
    try {
      const formData = new FormData();
      formData.append('prompt_text', `Draft a ${genDocDetails.docType} regarding the following issue: ${genDocDetails.problemDesc}. Additional Context: ${genDocDetails.additionalContext}`);
      
      let profileStr = "";
      if (user) {
         const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
         if (data && !error) profileStr = JSON.stringify(data);
      }
      if (profileStr) {
        formData.append('profile_context', profileStr);
      }

      const response = await axios.post('http://localhost:8000/api/ai/generate-document', formData);
      const docMarkdown = response.data.markdown;
      setGeneratedDoc(docMarkdown);
      
      addMessage('bot', `Here is your draft for the ${genDocDetails.docType}. You can download it below.`);
    } catch (error) {
      console.error(error);
      addMessage('bot', 'Sorry, I encountered an error while generating the document. Please try again.');
    } finally {
       setIsGeneratingDoc(false);
    }
  };

  const downloadDocument = () => {
    if (!generatedDoc) return;
    const blob = new Blob([generatedDoc], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${genDocDetails.docType.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadPdfDocument = () => {
    if (!generatedDoc) return;
    
    // Create a temporary element to hold the formatted document for PDF generation
    const element = document.createElement('div');
    element.innerHTML = `
      <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; padding: 30px; color: #000;">
        <pre style="font-family: Arial, sans-serif; white-space: pre-wrap; word-wrap: break-word;">${generatedDoc}</pre>
      </div>
    `;
    
    const opt = {
      margin:       [10, 10, 10, 10],
      filename:     `${genDocDetails.docType.replace(/\s+/g, '_')}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  const emailDocument = () => {
      const subject = encodeURIComponent(`Draft: ${genDocDetails.docType}`);
      const body = encodeURIComponent(`Please find the draft below:\n\n${generatedDoc}\n\n(Remember to attach the downloaded file if required)`);
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const startRecording = async () => {
    window.speechSynthesis.cancel();
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
        await handleVoiceQuery(formData);
      };

      mediaRecorder.start();
      setIsRecording(true);
      addMessage('user', '🎤 [Voice message recorded]');
    } catch (err) {
      console.error(err);
      addMessage('bot', "Microphone access denied or unsupported.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleVoiceQuery = async (formData) => {
    setIsVoiceLoading(true);
    setMessages(prev => [...prev, { type: 'bot', text: 'Processing your voice message... ⏳', timestamp: new Date(), isVoicePlaceholder: true }]);
    
    try {
      let profileStr = "";
      if (user) {
         const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
         if (data && !error) profileStr = JSON.stringify(data);
      }
      if (profileStr) {
        formData.append('profile_context', profileStr);
      }
      
      const response = await axios.post('http://localhost:8000/api/ai/voice', formData);
      const { reply } = response.data;
      
      setMessages(prev => {
         const newMsgs = [...prev];
         const lastBotIdx = newMsgs.map(m => m.isVoicePlaceholder).lastIndexOf(true);
         if (lastBotIdx !== -1) {
            newMsgs[lastBotIdx] = { type: 'bot', text: reply, timestamp: new Date() };
         } else {
            newMsgs.push({ type: 'bot', text: reply, timestamp: new Date() });
         }
         return newMsgs;
      });
      
      const plainReply = reply.replace(/\*/g, '').replace(/#/g, '');
      const utterance = new SpeechSynthesisUtterance(plainReply);
      utterance.pitch = 1.0;
      utterance.rate = 1.0;
      const voices = window.speechSynthesis.getVoices();
      let preferredVoice = voices.find(v => 
          v.name.includes('Neerja') || v.name.includes('Heera') || 
          v.name.includes('Google UK English Female') || 
          (v.lang.includes('en-IN') && v.name.toLowerCase().includes('female')) ||
          v.name.includes('Zira') || v.name.includes('Hazel')
      );
      if (!preferredVoice) preferredVoice = voices.find(v => v.name.toLowerCase().includes('female'));
      if (!preferredVoice) preferredVoice = voices.find(v => !v.name.includes('David') && !v.name.includes('Ravi') && !v.name.includes('Mark') && v.lang.startsWith('en'));
      if (preferredVoice) utterance.voice = preferredVoice;
      
      window.speechSynthesis.cancel();
      if (!isMutedRef.current) {
        window.speechSynthesis.speak(utterance);
      }
      setMode('general_chat');
      
    } catch (error) {
      console.error(error);
      setMessages(prev => {
         const newMsgs = [...prev];
         const lastBotIdx = newMsgs.map(m => m.isVoicePlaceholder).lastIndexOf(true);
         if (lastBotIdx !== -1) {
            newMsgs[lastBotIdx] = { type: 'bot', text: "Sorry, I couldn't process your voice request.", timestamp: new Date() };
         }
         return newMsgs;
      });
    }
    setIsVoiceLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const normalizedInput = input.trim().toLowerCase();
    if (normalizedInput === 'menu' || normalizedInput === 'exit') {
      addMessage('user', input);
      setInput('');
      setTimeout(() => {
        setPanStep(0);
        setTrackStep(0);
        setDocGuideStep(0);
        setUpdateStep(0);
        setGenDocStep(0);
        setGeneratedDoc(null);
        setMode('menu');
        addMessage('bot', 'Returning to the main menu. Please choose an option below:');
      }, 500);
      return;
    }

    if (mode === 'pan_apply' && panStep < 5) {
      handlePanFlow(input);
    } else if (mode === 'track_status' && trackStep < 4) {
      handleTrackStatusFlow(input);
    } else if (mode === 'document_guide' && docGuideStep < 4) {
      handleDocumentGuideFlow(input);
    } else if (mode === 'update_document' && updateStep < 5) {
      handleUpdateDocumentFlow(input);
    } else if (mode === 'generate_document' && genDocStep < 4) {
      handleGenerateDocumentFlow(input);
    } else if (mode === 'platform_guide') {
      addMessage('user', input);
      setInput('');
      setTimeout(() => {
        if (input.toLowerCase().includes('yes') || input.toLowerCase().includes('y')) {
          addMessage('bot', 'Excellent! With an Aadhaar-linked mobile number, you can use e-KYC for instant registration. Please tell me your State so I can provide the exact official portal link and specific instructions.');
        } else {
          addMessage('bot', 'No problem. You can still register manually, but you will need to upload scanned copies of your ID proof. Please tell me your State so I can provide the exact official portal link.');
        }
        setMode('platform_guide_step2'); 
      }, 1000);
    } else if (mode === 'platform_guide_step2') {
      addMessage('user', input);
      setInput('');
      setTimeout(() => {
        addMessage('bot', `Thank you! Based on your location (${input}), here is the verified link to the official portal: [https://example.gov.in].\n\nSteps to use it:\n1. Click 'New User Registration'\n2. Enter your details and verify OTP\n3. Create your profile to start using the services.\n\nIs there anything else you need help with? Type "menu" to return to the main options.`);
        setMode('general_chat');
      }, 1000);
    } else {
      // General fallback chat
      addMessage('user', input);
      setInput('');
      setTimeout(() => {
        addMessage('bot', "I'm currently specialized in Form Assistance. Please choose an option from the menu or type 'menu' to restart.");
        setMode('menu');
      }, 1000);
    }
  };

  if (!isOpen) {
    return (
      <button 
        style={{ transform: `translateY(-${offset}px)` }}
        onClick={() => { setIsOpen(true); }}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-govblue to-blue-600 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 hover:shadow-blue-500/50 transition-transform duration-200 z-50 group animate-bounce-slow"
      >
        <Bot className="w-8 h-8 group-hover:block transition-all" />
        <span className="absolute -top-1 -right-1 bg-red-500 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900"></span>
      </button>
    );
  }

  return (
    <div 
      style={{ transform: isMaximized ? 'none' : `translateY(-${offset}px)` }}
      className={`fixed transition-transform duration-200 animate-fade-in-up flex flex-col overflow-hidden bg-white dark:bg-slate-900 shadow-2xl ${
      isMaximized 
        ? "inset-0 rounded-none z-[100] border-none max-h-none"
        : "bottom-6 right-6 w-[380px] h-[600px] max-h-[80vh] rounded-2xl z-50 border border-slate-200 dark:border-slate-700"
    }`}>
      
      {/* Header */}
      <div className="bg-gradient-to-r from-govblue to-blue-600 p-4 flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-3">
          <img src="/logo.png" alt="Omni-Gov Logo" className="w-12 h-12 object-contain" />
          <div>
            <h3 className="font-bold text-white text-lg leading-tight">Omni-Gov Assistant</h3>
            <p className="text-blue-100 text-xs flex items-center mt-0.5">
               <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></span> Online
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button 
            onClick={toggleMute}
            className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
            title={isMuted ? "Unmute Chatbot" : "Mute Chatbot"}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <button 
            onClick={() => setIsMaximized(!isMaximized)}
            className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
            title={isMaximized ? "Minimize" : "Maximize"}
          >
            {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button 
            onClick={handleClose}
            className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
            title="Close Chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            {msg.type === 'bot' && (
               <div className="w-8 h-8 rounded-full bg-govorange/10 flex items-center justify-center mr-2 shrink-0">
                  <span className="text-govorange font-bold text-xs">AI</span>
               </div>
            )}
            <div 
              className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm ${
                msg.type === 'user' 
                  ? 'bg-govblue text-white rounded-br-sm shadow-md' 
                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm shadow-sm border border-slate-100 dark:border-slate-700'
              } whitespace-pre-wrap`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        
        {/* Interactive Modules inside Chat */}
        {mode === 'menu' && messages[messages.length-1].type === 'bot' && (
          <div className="pl-10 space-y-2 animate-fade-in">
            <button 
               onClick={() => handleMenuSelect('eligible_schemes')}
               className="w-full text-left bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-govorange dark:hover:border-govorange p-3 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center group"
            >
              <Search className="w-5 h-5 text-govorange mr-3 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex-1">Know about eligible schemes</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
            <button 
               onClick={() => handleMenuSelect('generate_document')}
               className="w-full text-left bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-govblue dark:hover:border-govorange p-3 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center group"
            >
              <FileText className="w-5 h-5 text-indigo-500 mr-3 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex-1">Generate a legal doc / reply</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
            <button 
               onClick={() => handleMenuSelect('legal_question')}
               className="w-full text-left bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-govblue dark:hover:border-govorange p-3 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center group"
            >
              <MessageSquare className="w-5 h-5 text-blue-400 mr-3 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex-1">Ask a legal question</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
            <button 
               onClick={() => {
                 addMessage('user', 'exit');
                 setTimeout(() => {
                   setMode('menu');
                   addMessage('bot', 'Returning to the main menu. Please choose an option below:');
                 }, 500);
               }}
               className="w-full text-left bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-red-500 dark:hover:border-red-500 p-3 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center group"
            >
              <X className="w-5 h-5 text-red-500 mr-3 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex-1">Return to Main Menu</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        )}

        {/* PAN Summary Confirmation Box */}
        {mode === 'pan_apply' && panStep === 5 && messages[messages.length-1].type === 'bot' && (
          <div className="pl-10 animate-fade-in">
             <div className="bg-white dark:bg-slate-800 border-2 border-govblue/30 dark:border-govblue/50 rounded-xl p-4 shadow-md">
                <h4 className="font-bold text-govblue dark:text-govorange mb-3 border-b border-slate-100 dark:border-slate-700 pb-2">Application Summary</h4>
                <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                   <p><span className="font-semibold">Name:</span> {panDetails.name}</p>
                   <p><span className="font-semibold">DOB:</span> {panDetails.dob}</p>
                   <p><span className="font-semibold">Father:</span> {panDetails.fatherName}</p>
                   <p><span className="font-semibold">Aadhaar:</span> {panDetails.aadhaar}</p>
                </div>
                <button 
                   onClick={confirmPanApplication}
                   className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center"
                >
                   <CheckCircle className="w-4 h-4 mr-2" /> Confirm & Generate ID
                </button>
             </div>
          </div>
        )}

        {/* Tracking Summary Confirmation Box */}
        {mode === 'track_status' && trackStep === 4 && messages[messages.length-1].type === 'bot' && (
          <div className="pl-10 animate-fade-in">
             <div className="bg-white dark:bg-slate-800 border-2 border-govorange/30 dark:border-govorange/50 rounded-xl p-4 shadow-md">
                <h4 className="font-bold text-govorange mb-3 border-b border-slate-100 dark:border-slate-700 pb-2">Tracking Request Summary</h4>
                <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                   <p><span className="font-semibold">Application:</span> {trackDetails.appType}</p>
                   <p><span className="font-semibold">Tracking ID:</span> {trackDetails.trackingId}</p>
                   <p><span className="font-semibold">Mobile:</span> {trackDetails.mobile}</p>
                </div>
                <button 
                   onClick={confirmTrackStatus}
                   className="mt-4 w-full bg-govorange hover:bg-orange-600 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center"
                >
                   <Search className="w-4 h-4 mr-2" /> Check Live Status
                </button>
             </div>
          </div>
        )}

        {/* Document Guide Summary Box */}
        {mode === 'document_guide' && docGuideStep === 4 && messages[messages.length-1].type === 'bot' && (
          <div className="pl-10 animate-fade-in">
             <div className="bg-white dark:bg-slate-800 border-2 border-govgreen/30 dark:border-govgreen/50 rounded-xl p-4 shadow-md">
                <h4 className="font-bold text-govgreen mb-3 border-b border-slate-100 dark:border-slate-700 pb-2">Guide Profile Overview</h4>
                <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                   <p><span className="font-semibold">Document:</span> {docDetails.documentName}</p>
                   <p><span className="font-semibold">Residency:</span> {docDetails.residency}</p>
                   <p><span className="font-semibold">Age & State:</span> {docDetails.ageState}</p>
                </div>
                <button 
                   onClick={confirmDocumentGuide}
                   className="mt-4 w-full bg-govgreen hover:bg-green-600 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center"
                >
                   <FileText className="w-4 h-4 mr-2" /> Generate Complete Guide
                </button>
             </div>
          </div>
        )}

        {/* Update Document Summary Box */}
        {mode === 'update_document' && updateStep === 5 && messages[messages.length-1].type === 'bot' && (
          <div className="pl-10 animate-fade-in">
             <div className="bg-white dark:bg-slate-800 border-2 border-purple-500/30 dark:border-purple-500/50 rounded-xl p-4 shadow-md">
                <h4 className="font-bold text-purple-600 dark:text-purple-400 mb-3 border-b border-slate-100 dark:border-slate-700 pb-2">Update Request Summary</h4>
                <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                   <p><span className="font-semibold">Document:</span> {updateDetails.documentName}</p>
                   <p><span className="font-semibold">Document ID:</span> {updateDetails.documentId}</p>
                   <p><span className="font-semibold">Field to Update:</span> {updateDetails.fieldToUpdate}</p>
                   <p><span className="font-semibold">New Value:</span> {updateDetails.newValue}</p>
                </div>
                <button 
                   onClick={confirmUpdateDocument}
                   className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center"
                >
                   <CheckCircle className="w-4 h-4 mr-2" /> Submit Update Request
                </button>
             </div>
          </div>
        )}

        {/* Generate Document Summary Box */}
        {mode === 'generate_document' && genDocStep === 4 && !isGeneratingDoc && !generatedDoc && messages[messages.length-1].type === 'bot' && (
          <div className="pl-10 animate-fade-in">
             <div className="bg-white dark:bg-slate-800 border-2 border-indigo-500/30 dark:border-indigo-500/50 rounded-xl p-4 shadow-md">
                <h4 className="font-bold text-indigo-600 dark:text-indigo-400 mb-3 border-b border-slate-100 dark:border-slate-700 pb-2">Document Request Summary</h4>
                <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                   <p><span className="font-semibold">Type:</span> {genDocDetails.docType}</p>
                   <p><span className="font-semibold">Issue:</span> {genDocDetails.problemDesc}</p>
                   <p><span className="font-semibold">Context:</span> {genDocDetails.additionalContext}</p>
                </div>
                <button 
                   onClick={confirmGenerateDocument}
                   disabled={isGeneratingDoc}
                   className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center"
                >
                   {isGeneratingDoc ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />} 
                   {isGeneratingDoc ? "Generating Draft..." : "Generate Draft Now"}
                </button>
             </div>
          </div>
        )}

        {/* Display Generated Document Download Area */}
        {mode === 'generate_document' && generatedDoc && messages[messages.length-1].type === 'bot' && (
           <div className="pl-10 animate-fade-in">
             <div className="bg-white dark:bg-slate-800 border-2 border-indigo-500/30 dark:border-indigo-500/50 rounded-xl p-5 shadow-md space-y-4">
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-lg max-h-64 overflow-y-auto font-mono text-sm whitespace-pre-wrap text-slate-800 dark:text-slate-200">
                   {generatedDoc}
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <button 
                       onClick={downloadDocument}
                       className="w-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-bold py-2 px-3 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition flex items-center justify-center shadow-sm text-sm"
                    >
                       <Download className="w-4 h-4 mr-1.5" /> TXT
                    </button>
                    <button 
                       onClick={downloadPdfDocument}
                       className="w-full bg-govblue text-white font-bold py-2 px-3 rounded-lg hover:bg-blue-600 transition flex items-center justify-center shadow-sm text-sm"
                    >
                       <Download className="w-4 h-4 mr-1.5" /> PDF
                    </button>
                    <button 
                       onClick={emailDocument}
                       className="w-full border-2 border-govblue text-govblue font-bold py-2 px-3 rounded-lg hover:bg-govblue/5 transition flex items-center justify-center text-sm"
                    >
                       <Mail className="w-4 h-4 mr-1.5" /> Email
                    </button>
                </div>
                <button 
                   onClick={() => {
                     setMode('general_chat');
                     addMessage('bot', 'Is there anything else I can help you with today? Type "menu" to return to the options.');
                   }}
                   className="w-full text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-sm font-semibold underline mt-2"
                >
                   Done
                </button>
             </div>
           </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shrink-0">
        <div className="flex items-center space-x-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={(mode === 'menu' || (mode === 'pan_apply' && panStep >= 5) || (mode === 'track_status' && trackStep >= 4) || (mode === 'document_guide' && docGuideStep >= 4) || (mode === 'update_document' && updateStep >= 5) || (mode === 'generate_document' && genDocStep >= 4)) ? "Select an option above..." : "Type your answer..."}
            disabled={mode === 'menu' || (mode === 'pan_apply' && panStep >= 5) || (mode === 'track_status' && trackStep >= 4) || (mode === 'document_guide' && docGuideStep >= 4) || (mode === 'update_document' && updateStep >= 5) || (mode === 'generate_document' && genDocStep >= 4)}
            className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-govblue focus:border-transparent transition-all disabled:opacity-50"
          />
          <button 
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-3 rounded-xl transition-all flex-shrink-0 shadow-sm ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
            }`}
             title={isRecording ? "Stop Recording" : "Start Voice Assistant"}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <button 
            type="submit"
            disabled={!input.trim() || mode === 'menu' || (mode === 'pan_apply' && panStep >= 5) || (mode === 'track_status' && trackStep >= 4) || (mode === 'document_guide' && docGuideStep >= 4) || (mode === 'update_document' && updateStep >= 5) || (mode === 'generate_document' && genDocStep >= 4)}
            className="bg-govblue hover:bg-blue-600 text-white p-3 rounded-xl transition-colors disabled:opacity-50 shadow-sm"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
