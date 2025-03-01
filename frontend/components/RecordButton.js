// import React, { useState, useRef } from "react";

// export default function RecordButton({
//   sourceLang,
//   targetLang,
//   onResult,
// }) {
//   // We'll do the entire pipeline: record → transcribe → translate → TTS
//   const [recording, setRecording] = useState(false);
//   const mediaRecorderRef = useRef(null);
//   const audioChunksRef = useRef([]);

//   const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

//   const startRecording = async () => {
//     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//     const recorder = new MediaRecorder(stream);
//     mediaRecorderRef.current = recorder;
//     audioChunksRef.current = [];

//     recorder.ondataavailable = (e) => {
//       if (e.data.size > 0) {
//         audioChunksRef.current.push(e.data);
//       }
//     };

//     recorder.onstop = async () => {
//       setRecording(false);

//       // Combine into single Blob
//       const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
//       audioChunksRef.current = [];

//       // Send to backend for transcription (sourceLang)
//       const formData = new FormData();
//       formData.append("file", blob, "recorded.webm");

//       // 1) Transcription
//       const speechRes = await fetch(`${API_URL}/api/speech/transcribe?lang=${sourceLang}`, {
//         method: "POST",
//         body: formData,
//       });
//       if (!speechRes.ok) {
//         console.error("Speech transcription failed:", await speechRes.text());
//         return;
//       }
//       const speechData = await speechRes.json(); // { transcript: "..." }
//       const originalText = speechData.transcript;

//       // 2) Translation
//       const translateRes = await fetch(`${API_URL}/api/translate`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           text: originalText,
//           source_lang: sourceLang,
//           target_lang: targetLang,
//         }),
//       });
//       const translateData = await translateRes.json();
//       const translatedText = translateData.translated_text;

//       // 3) TTS
//       const ttsRes = await fetch(`${API_URL}/api/tts`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           text: translatedText,
//           lang: targetLang,
//         }),
//       });
//       const ttsData = await ttsRes.json(); // { audio_base64: "..." }
//       const audioBase64 = ttsData.audio_base64;

//       // Return everything to the parent
//       if (onResult) {
//         onResult({
//           originalText,
//           translatedText,
//           audioBase64,
//         });
//       }
//     };

//     // Start
//     recorder.start();
//     setRecording(true);
//   };

//   const stopRecording = () => {
//     const recorder = mediaRecorderRef.current;
//     if (!recorder || recorder.state !== "recording") {
//       return;
//     }
//     recorder.stop();
//   };

//   return (
//     <div className="flex space-x-3 my-3">
//       <button
//         onClick={startRecording}
//         disabled={recording}
//         className={`px-4 py-2 rounded font-semibold ${
//           recording ? "bg-gray-300" : "bg-blue-600"
//         } text-white`}
//       >
//         {recording ? "Recording..." : "Start"}
//       </button>
//       <button
//         onClick={stopRecording}
//         disabled={!recording}
//         className={`px-4 py-2 rounded font-semibold ${
//           recording ? "bg-red-600" : "bg-gray-300"
//         } text-white`}
//       >
//         Stop
//       </button>
//     </div>
//   );
// }

import React, { useState, useRef } from "react";

export default function RecordButton({ sourceLang, targetLang, onResult }) {
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    audioChunksRef.current = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        audioChunksRef.current.push(e.data);
      }
    };
    recorder.onstop = async () => {
      setRecording(false);
      setLoading(true); // Show loader

      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      audioChunksRef.current = [];
      const formData = new FormData();
      formData.append("file", blob, "recorded.webm");
      
      try {
        // 1) Transcription
        const speechRes = await fetch(`${API_URL}/api/speech/transcribe?lang=${sourceLang}`, {
          method: "POST",
          body: formData,
        });
        if (!speechRes.ok) {
          console.error("Speech transcription failed:", await speechRes.text());
          setLoading(false);
          return;
        }
        const speechData = await speechRes.json();
        const originalText = speechData.transcript;

        // 2) Translation
        const translateRes = await fetch(`${API_URL}/api/translate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: originalText, source_lang: sourceLang, target_lang: targetLang }),
        });
        const translateData = await translateRes.json();
        const translatedText = translateData.translated_text;

        // 3) TTS
        const ttsRes = await fetch(`${API_URL}/api/tts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: translatedText, lang: targetLang }),
        });
        const ttsData = await ttsRes.json();
        const audioBase64 = ttsData.audio_base64;

        if (onResult) {
          onResult({ originalText, translatedText, audioBase64 });
        }
      } catch (error) {
        console.error("Error processing audio:", error);
      }

      setLoading(false); // Hide loader when API calls complete
    };
    recorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== "recording") {
      return;
    }
    recorder.stop();
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      <button
        onClick={startRecording}
        disabled={recording || loading}
        className="px-4 py-2 text-white bg-green-600 rounded-lg disabled:opacity-50 w-40"
      >
        {recording ? "Recording..." : "Start"}
      </button>

      <button
        onClick={stopRecording}
        disabled={!recording || loading}
        className="px-4 py-2 text-white bg-red-600 rounded-lg disabled:opacity-50 w-40"
      >
        Stop
      </button>

      {loading && (
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          <span className="text-gray-700">Processing...</span>
        </div>
      )}
    </div>
  );
}