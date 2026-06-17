import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { ProgressiveFluxLoader } from '../ui/progressive-flux-loader';

const OCR_PHASES = [
  { at: 0, label: "sending file to vision model..." },
  { at: 20, label: "reading text bytes & layouts..." },
  { at: 50, label: "extracting names, DOB, addresses..." },
  { at: 80, label: "masking identifying numbers..." },
  { at: 95, label: "compiling extracted metadata..." },
];

const FRAUD_PHASES = [
  { at: 0, label: "performing secure forensics..." },
  { at: 20, label: "detecting digital edits & photoshop..." },
  { at: 50, label: "verifying watermarks & government seals..." },
  { at: 75, label: "verifying fonts & layout structure..." },
  { at: 95, label: "evaluating authenticity rating..." },
];

export default function DocumentAnalyzer() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [missingData, setMissingData] = useState(false);
  const [isError, setIsError] = useState(false);
  
  const [fraudResult, setFraudResult] = useState(null);
  const [loadingFraud, setLoadingFraud] = useState(false);
  const [fraudError, setFraudError] = useState(false);

  // States to delay display until animation finishes
  const [tempResult, setTempResult] = useState(null);
  const [animationDone, setAnimationDone] = useState(false);

  const [tempFraudResult, setTempFraudResult] = useState(null);
  const [fraudAnimationDone, setFraudAnimationDone] = useState(false);

  const [ocrProgress, setOcrProgress] = useState(0);
  const [fraudProgress, setFraudProgress] = useState(0);

  // Wait for both OCR API response and animation to be complete before showing results
  useEffect(() => {
    if (tempResult && animationDone) {
      setResult(tempResult);
      const lowerResult = tempResult.toLowerCase();
      if (lowerResult.includes("not found") || lowerResult.includes("unclear") || lowerResult.includes("missing") || lowerResult.includes("none")) {
        setMissingData(true);
      }
      setLoading(false);
      setTempResult(null);
      setAnimationDone(false);
    }
  }, [tempResult, animationDone]);

  // Wait for both Fraud API response and animation to be complete before showing results
  useEffect(() => {
    if (tempFraudResult && fraudAnimationDone) {
      setFraudResult(tempFraudResult);
      setLoadingFraud(false);
      setTempFraudResult(null);
      setFraudAnimationDone(false);
    }
  }, [tempFraudResult, fraudAnimationDone]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setMissingData(false);
    setIsError(false);
    setResult(null);
    setTempResult(null);
    setAnimationDone(false);
    setOcrProgress(0);
    setFraudResult(null);
    setTempFraudResult(null);
    setFraudAnimationDone(false);

    const formData = new FormData();
    formData.append('file', file);

    let currentProgress = 0;
    let apiDone = false;
    let textResult = null;
    let didFail = false;

    const progressInterval = setInterval(() => {
      if (currentProgress < 95) {
        currentProgress += 1.5;
        setOcrProgress(currentProgress);
      } else {
        if (apiDone) {
          currentProgress = Math.min(100, currentProgress + 3);
          setOcrProgress(currentProgress);
          if (currentProgress >= 100) {
            clearInterval(progressInterval);
            if (didFail) {
              setTempResult("Error extracting text from document.");
              setIsError(true);
            } else {
              setTempResult(textResult);
            }
          }
        }
      }
    }, 100);

    try {
      const response = await axios.post('http://localhost:8000/api/ai/ocr', formData);
      textResult = response.data.extracted_text;
      apiDone = true;
    } catch (error) {
      console.error("OCR Error:", error);
      didFail = true;
      apiDone = true;
    }
  };

  const handleFraudCheck = async () => {
    if (!file) return;
    setLoadingFraud(true);
    setFraudError(false);
    setFraudResult(null);
    setTempFraudResult(null);
    setFraudAnimationDone(false);
    setFraudProgress(0);
    setResult(null);
    setTempResult(null);
    setAnimationDone(false);
    setMissingData(false);
    setIsError(false);

    const formData = new FormData();
    formData.append('file', file);

    let currentProgress = 0;
    let apiDone = false;
    let fraudAnalysisResult = null;
    let didFail = false;

    const progressInterval = setInterval(() => {
      if (currentProgress < 95) {
        currentProgress += 1.5;
        setFraudProgress(currentProgress);
      } else {
        if (apiDone) {
          currentProgress = Math.min(100, currentProgress + 3);
          setFraudProgress(currentProgress);
          if (currentProgress >= 100) {
            clearInterval(progressInterval);
            if (didFail) {
              setTempFraudResult("Error verifying document authenticity.");
              setFraudError(true);
            } else {
              setTempFraudResult(fraudAnalysisResult);
            }
          }
        }
      }
    }, 100);

    try {
      const response = await axios.post('http://localhost:8000/api/ai/detect-fraud', formData);
      fraudAnalysisResult = response.data.fraud_analysis;
      apiDone = true;
    } catch (error) {
      console.error("Fraud Detection Error:", error);
      didFail = true;
      apiDone = true;
    }
  };

  return (
    <div className="p-6 glass dark:bg-slate-800/50 rounded-2xl shadow-xl w-full max-w-6xl mx-auto space-y-6 border border-white dark:border-slate-700 transition-colors text-left">
      {loading ? (
        <div className="py-20 bg-white/40 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-850 rounded-2xl flex flex-col items-center justify-center shadow-inner animate-fade-in my-4">
          <ProgressiveFluxLoader 
            value={ocrProgress}
            phases={OCR_PHASES} 
            onComplete={() => setAnimationDone(true)}
          />
        </div>
      ) : loadingFraud ? (
        <div className="py-20 bg-white/40 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-850 rounded-2xl flex flex-col items-center justify-center shadow-inner animate-fade-in my-4">
          <ProgressiveFluxLoader 
            value={fraudProgress}
            phases={FRAUD_PHASES} 
            onComplete={() => setFraudAnimationDone(true)}
          />
        </div>
      ) : (
        <>
          <div>
            <h2 className="text-2xl font-bold mb-2 text-slate-800 dark:text-white transition-colors">Document AI (OCR)</h2>
            <p className="text-slate-605 dark:text-slate-400 transition-colors">Upload documents (e.g. Aadhaar, Pan) to extract structured citizen data securely.</p>
          </div>

          <form onSubmit={handleUpload} className="space-y-4 bg-white/50 dark:bg-slate-900/50 p-6 rounded-xl border border-white dark:border-slate-700 transition-colors">
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-govblue/10 file:text-govblue hover:file:bg-govblue/20 dark:file:bg-govorange/10 dark:file:text-govorange dark:hover:file:bg-govorange/20"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button type="submit" disabled={loading || loadingFraud || !file} className="w-full bg-govblue disabled:bg-slate-400 dark:disabled:bg-slate-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition shadow-md disabled:opacity-50">
                Extract Data
              </button>
              <button type="button" onClick={handleFraudCheck} disabled={loadingFraud || loading || !file} className="w-full bg-red-600 disabled:bg-slate-400 dark:disabled:bg-slate-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition shadow-md disabled:opacity-50 flex items-center justify-center">
                <span className="flex items-center"><AlertCircle className="w-5 h-5 mr-2" /> Detect Fraud / Scam</span>
              </button>
            </div>
          </form>

          {missingData && (
            <div className="bg-red-50 border border-red-200 p-6 rounded-2xl flex items-start space-x-4 animate-fade-in shadow-sm dark:bg-red-900/20 dark:border-red-800 transition-colors">
              <AlertCircle className="w-8 h-8 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-red-800 dark:text-red-400 text-lg font-bold mb-2">Missing Identifying Information</h4>
                <p className="text-red-700 dark:text-red-300 text-sm mb-4 leading-relaxed font-medium">
                  The AI scanner determined that specific profile details (like Name, DOB, or strict address fields) are missing or illegible in this document. We need this for accurate scheme recommendations.
                </p>
                <Link to="/dashboard/profile" className="inline-block bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 font-bold py-2.5 px-5 rounded-xl text-sm hover:bg-red-50 dark:hover:bg-slate-700 transition shadow-sm">
                  Update Profile Manually &rarr;
                </Link>
              </div>
            </div>
          )}

          {isError && (
            <div className="bg-red-50 border border-red-200 p-6 rounded-2xl flex items-start space-x-4 animate-fade-in shadow-sm dark:bg-red-900/20 dark:border-red-800 transition-colors mt-6">
              <AlertCircle className="w-8 h-8 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-red-800 dark:text-red-400 text-lg font-bold mb-2">Scan Failed</h4>
                <p className="text-red-700 dark:text-red-300 text-sm mb-4 leading-relaxed font-medium">
                  An error occurred while extracting text from the document. Please try again or check the API connection.
                </p>
              </div>
            </div>
          )}

          {fraudError && (
            <div className="bg-red-50 border border-red-200 p-6 rounded-2xl flex items-start space-x-4 animate-fade-in shadow-sm dark:bg-red-900/20 dark:border-red-800 transition-colors mt-6">
              <AlertCircle className="w-8 h-8 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-red-800 dark:text-red-400 text-lg font-bold mb-2">Scan Failed</h4>
                <p className="text-red-700 dark:text-red-300 text-sm mb-4 leading-relaxed font-medium">
                  An error occurred while verifying the authenticity of the document.
                </p>
              </div>
            </div>
          )}

          {fraudResult && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-inner border border-slate-100 dark:border-slate-700 relative text-sm text-slate-700 dark:text-slate-300 transition-colors mt-6">
              <h3 className="font-bold text-lg mb-4 text-red-600 dark:text-red-400 border-b border-slate-100 dark:border-slate-700 pb-3 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" /> Fraud & Authenticity Report
              </h3>
              {(() => {
                let parsed = null;
                try {
                  const clean = fraudResult.replace(/```(json)?\n?/g, '').replace(/```/g, '').trim();
                  parsed = JSON.parse(clean);
                } catch (e) { }

                if (parsed) {
                   return (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-900/50 shadow-sm transition-all hover:shadow-md">
                            <div className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-1.5">Authenticity Score</div>
                            <div className={`text-2xl font-bold ${parsed.is_authentic > 70 ? 'text-green-600 dark:text-green-400' : parsed.is_authentic > 40 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                              {parsed.is_authentic}%
                            </div>
                          </div>
                          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-900/50 shadow-sm transition-all hover:shadow-md">
                            <div className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-1.5">Fraud Risk</div>
                            <div className={`text-2xl font-bold ${parsed.fraud_risk === 'Low' ? 'text-green-600 dark:text-green-400' : parsed.fraud_risk === 'Medium' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                              {parsed.fraud_risk}
                            </div>
                          </div>
                        </div>
                        {parsed.anomalies_detected && parsed.anomalies_detected.length > 0 && (
                          <div className="p-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 shadow-sm">
                            <div className="text-[11px] uppercase tracking-wider font-bold text-red-600 dark:text-red-400 mb-2">Anomalies Detected</div>
                            <ul className="list-disc list-inside space-y-1 text-red-700 dark:text-red-300 font-medium text-sm">
                              {parsed.anomalies_detected.map((anomaly, idx) => (
                                <li key={idx}>{anomaly}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-900/50 shadow-sm">
                          <div className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-1.5">Recommendation</div>
                          <div className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium text-sm">
                            {parsed.recommendation}
                          </div>
                        </div>
                      </div>
                   );
                }
                return (
                  <div className="font-mono text-xs bg-slate-50 dark:bg-slate-900 p-5 rounded-xl overflow-x-auto shadow-sm border border-slate-100 dark:border-slate-800 whitespace-pre-wrap">
                    {fraudResult}
                  </div>
                );
              })()}
            </div>
          )}

          {result && !missingData && !isError && (
            <div className="bg-green-50 border border-green-200 p-6 rounded-2xl flex items-start space-x-4 animate-fade-in shadow-sm dark:bg-green-900/20 dark:border-green-800 transition-colors mt-6">
              <div className="flex-1">
                <h4 className="text-green-800 dark:text-green-400 text-lg font-bold mb-2">Scan Successful!</h4>
                <p className="text-green-700 dark:text-green-300 text-sm mb-4 leading-relaxed font-medium">
                  We've successfully extracted your details. Based on this document, we can now search for schemes you are eligible for.
                </p>
                <Link to="/dashboard/schemes" className="inline-flex items-center justify-center bg-green-600 dark:bg-green-500 text-white font-bold py-3 px-6 rounded-xl hover:bg-green-700 dark:hover:bg-green-600 transition shadow-md w-full sm:w-auto hover:scale-[1.02]">
                  Find My Schemes
                </Link>
              </div>
            </div>
          )}

          {result && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-inner border border-slate-100 dark:border-slate-700 relative text-sm text-slate-700 dark:text-slate-300 transition-colors">
              <h3 className="font-bold text-lg mb-4 text-govblue dark:text-govorange border-b border-slate-100 dark:border-slate-700 pb-3">Extracted Data Payload:</h3>
              {(() => {
                let parsed = null;
                try {
                  const clean = result.replace(/```(json)?\n?/g, '').replace(/```/g, '').trim();
                  parsed = JSON.parse(clean);
                } catch (e) { }

                if (parsed) {
                  const renderValue = (val) => {
                    if (typeof val === 'object' && val !== null) {
                      return (
                        <div className="mt-2 space-y-2">
                          {Object.entries(val).map(([k, v]) => (
                            <div key={k} className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm">
                              <span className="font-semibold capitalize text-slate-500 dark:text-slate-400 text-xs tracking-wider uppercase block mb-1">{k.replace(/_/g, ' ')}</span>
                              <span className="text-slate-800 dark:text-slate-200 text-sm font-medium">{renderValue(v)}</span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return String(val);
                  };

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      {Object.entries(parsed).map(([key, value]) => {
                        const isLongField = key === 'summary' || key === 'address' || (typeof value === 'object' && value !== null);
                        return (
                          <div key={key} className={`p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-900/50 shadow-sm transition-all hover:shadow-md ${isLongField ? 'md:col-span-2' : ''}`}>
                            <div className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-govblue dark:bg-govorange mr-2"></span>
                              {key.replace(/_/g, ' ')}
                            </div>
                            <div className="text-slate-800 dark:text-slate-200 leading-relaxed text-[14px] font-medium ml-3.5">
                              {renderValue(value)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                }

                return (
                  <div className="font-mono text-xs bg-slate-50 dark:bg-slate-900 p-5 rounded-xl overflow-x-auto shadow-sm border border-slate-100 dark:border-slate-800 whitespace-pre-wrap">
                    {result}
                  </div>
                );
              })()}
            </div>
          )}
        </>
      )}
    </div>
  );
}
