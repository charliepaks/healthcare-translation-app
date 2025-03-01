import React, { useState, useRef } from "react";
import LanguageSelector from "../components/LanguageSelector";
import RecordButton from "../components/RecordButton";

export default function Home() {
  // The user picks these
  const [sourceLang, setSourceLang] = useState("en-US");
  const [targetLang, setTargetLang] = useState("es");

  // Current result
  const [spokenText, setSpokenText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [audioBase64, setAudioBase64] = useState(null);

  // Transcript array
  const [transcripts, setTranscripts] = useState([]);
  
  // UI states
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const transcriptEndRef = useRef(null);

  // Scroll to bottom of transcript
  const scrollToBottom = () => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Called each time we finish a recording
  const handleResult = ({ originalText, translatedText, audioBase64 }) => {
    // Show them in the 'current' fields
    setSpokenText(originalText);
    setTranslatedText(translatedText);
    setAudioBase64(audioBase64);
    
    // Hide the processing spinner
    setIsProcessing(false);

    // Also add to the transcript array with current timestamp
    const now = new Date();
    setTranscripts((prev) => [
      ...prev,
      { 
        originalText, 
        translatedText, 
        audioBase64, 
        timestamp: now,
        timeFormatted: `${now.toLocaleDateString()} ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
      },
    ]);
    
    // Scroll to bottom after transcript updates
    setTimeout(scrollToBottom, 100);
  };

  // Clear entire transcript - using the existing function
  const clearTranscripts = () => {
    setTranscripts([]);
    setShowClearModal(false);
  };

  // Helper to create an object URL for the TTS audio
  const createAudioUrl = (base64) => {
    if (!base64) return null;
    const byteArray = new Uint8Array(
      base64.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
    );
    const blob = new Blob([byteArray], { type: "audio/mp3" });
    return URL.createObjectURL(blob);
  };
  
  const audioUrl = audioBase64 ? createAudioUrl(audioBase64) : null;

  // Modified RecordButton wrapper to handle UI state
  const handleRecordToggle = (isRecordingNow) => {
    setIsRecording(isRecordingNow);
    
    // If we're stopping the recording, show the processing state
    if (!isRecordingNow && isRecording) {
      setIsProcessing(true);
    }
  };

  // Group transcripts by date
  const groupTranscriptsByDate = () => {
    const grouped = {};
    
    transcripts.forEach(transcript => {
      const date = transcript.timestamp.toLocaleDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(transcript);
    });
    
    return grouped;
  };
  
  const groupedTranscripts = groupTranscriptsByDate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 text-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 transition-all duration-300 transform hover:scale-105">
          <h1 className="text-3xl md:text-4xl font-bold text-indigo-700 mb-2">
            Healthcare Translation App
          </h1>
          <p className="text-gray-600">Breaking language barriers in healthcare</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left panel - Controls */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-5 transition-all duration-300 hover:shadow-xl">
              <h2 className="text-xl font-semibold text-indigo-700 mb-4">Settings</h2>
              
              {/* Fixed: Language selectors stacked instead of flexed */}
              <div className="mb-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {/* Spoken Language */}
                  </label>
                  <LanguageSelector
                    sourceLang={sourceLang}
                    onSourceChange={setSourceLang}
                    targetLang={targetLang}
                    onTargetChange={setTargetLang}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {/* Target Language */}
                  </label>
                </div>
              </div>

              {/* Start/Stop Recording with info text */}
              <div className="flex flex-col items-center mb-4">
                <div 
                  className={`transition-all duration-500 ${
                    isRecording ? "animate-pulse bg-red-50 border-red-200" : "bg-white border-gray-200"
                  } border p-4 rounded-lg w-full mb-2`}
                >
                  {/* Fixed: Direct RecordButton implementation (no hidden buttons) */}
                  <RecordButton
                    sourceLang={sourceLang}
                    targetLang={targetLang}
                    onResult={handleResult}
                    onRecordingStateChange={handleRecordToggle}
                    className="flex justify-center space-x-4"
                    startButtonClass={`flex items-center justify-center ${
                      isRecording || isProcessing 
                        ? "bg-gray-400 cursor-not-allowed" 
                        : "bg-blue-500 hover:bg-blue-600"
                    } transition-colors text-white px-4 py-2 rounded-lg`}
                    stopButtonClass={`flex items-center justify-center ${
                      !isRecording
                        ? "bg-gray-300 cursor-not-allowed" 
                        : "bg-red-500 hover:bg-red-600"
                    } transition-colors text-white px-4 py-2 rounded-lg`}
                    startIconClass="h-5 w-5 mr-1"
                    stopIconClass="h-5 w-5 mr-1"
                    processingSpinner={
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    }
                    showProcessingState={isProcessing}
                  />
                </div>
                
                {/* Info text about recording */}
                <p className="text-sm text-gray-600 italic text-center">
                  Click start to begin recording and stop when finished
                </p>
              </div>
              
              {/* Clear transcript button */}
              {/* {transcripts.length > 0 && (
                <button
                  onClick={() => setShowClearModal(true)}
                  className="w-full mt-4 px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 
                  transition-colors duration-300 text-gray-700 font-medium flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear All History
                </button>
              )} */}
            </div>
          </div>
          
          {/* Right panel - Current results and transcript */}
          <div className="md:col-span-2">
            {/* Current translation card */}
            <div className="bg-white rounded-xl shadow-lg p-5 mb-6 transition-all duration-300 hover:shadow-xl">
              <h2 className="text-xl font-semibold text-indigo-700 mb-4">Current Translation</h2>
              
              {/* Current spoken text */}
              <div className="my-3">
                <label className="block font-medium text-gray-700 mb-1">Spoken text:</label>
                <div className="border border-gray-200 p-3 rounded-lg bg-gray-50 min-h-[60px] transition-colors duration-300">
                  {spokenText || <span className="text-gray-400 italic">No text yet</span>}
                </div>
              </div>

              {/* Current translated text */}
              <div className="my-3">
                <label className="block font-medium text-gray-700 mb-1">Translated text:</label>
                <div className="border border-gray-200 p-3 rounded-lg bg-gray-50 min-h-[60px] transition-colors duration-300">
                  {translatedText || <span className="text-gray-400 italic">No translation yet</span>}
                </div>
              </div>

              {/* Audio playback of the translated text */}
              {audioUrl && (
                <div className="my-3 transition-all duration-500 transform hover:scale-105">
                  <label className="block font-medium text-gray-700 mb-1">Audio playback:</label>
                  <audio 
                    controls 
                    src={audioUrl}
                    className="w-full"
                  />
                </div>
              )}
            </div>
            
            {/* Transcript history */}
            <div className="bg-white rounded-xl shadow-lg p-5 transition-all duration-300 hover:shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-indigo-700">Transcript History</h2>
                
                {/* Clear transcript button - more visible placement */}
                {transcripts.length > 0 && (
                  <button
                    onClick={() => setShowClearModal(true)}
                    className="px-4 py-2 rounded-lg bg-red-100 hover:bg-red-200 
                    transition-colors duration-300 text-red-600 text-sm font-medium flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Clear History
                  </button>
                )}
              </div>
              
              <div className="max-h-[400px] overflow-y-auto pr-2">
                {transcripts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    <p className="text-gray-500">No transcripts recorded yet.</p>
                    <p className="text-gray-400 text-sm mt-1">Speak into the microphone to begin</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.keys(groupedTranscripts).map((date) => (
                      <div key={date} className="animate-fadeIn">
                        <div className="flex items-center mb-2">
                          <div className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                            {date}
                          </div>
                          <div className="border-t border-gray-200 flex-grow ml-2"></div>
                        </div>
                        
                        <ul className="space-y-4">
                          {groupedTranscripts[date].map((item, i) => {
                            const itemAudioUrl = item.audioBase64 ? createAudioUrl(item.audioBase64) : null;
                            
                            return (
                              <li 
                                key={i} 
                                className="border border-gray-200 p-4 rounded-lg bg-white transition-all 
                                duration-300 hover:shadow-md"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                                    {item.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </span>
                                </div>
                                
                                <div className="mb-2">
                                  <p className="font-medium text-gray-700">Original:</p>
                                  <p className="ml-1 text-gray-800">{item.originalText}</p>
                                </div>
                                
                                <div className="mb-2">
                                  <p className="font-medium text-gray-700">Translated:</p>
                                  <p className="ml-1 text-gray-800">{item.translatedText}</p>
                                </div>
                                
                                {itemAudioUrl && (
                                  <div className="mt-2 pt-2 border-t border-gray-100">
                                    <audio controls className="w-full">
                                      <source src={itemAudioUrl} type="audio/mp3" />
                                    </audio>
                                  </div>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                    <div ref={transcriptEndRef} />
                  </div>
                )}
              </div>
              
              {/* Floating clear button for easy access when scrolling */}
              {transcripts.length > 3 && (
                <div className="sticky bottom-4 flex justify-center mt-4">
                  <button
                    onClick={() => setShowClearModal(true)}
                    className="px-4 py-2 rounded-full bg-red-500 hover:bg-red-600 
                    transition-colors duration-300 text-white shadow-lg flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Clear All
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Confirmation Modal for clearing transcripts */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4 animate-scaleIn">
            <h3 className="text-xl font-bold mb-4">Clear Transcript History?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to clear all transcript history? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={clearTranscripts}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 transition-colors text-white"
              >
                Clear History
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Global CSS for animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}