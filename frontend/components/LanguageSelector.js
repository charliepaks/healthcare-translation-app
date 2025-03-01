
import React from "react";

// For speech recognition
const SPEECH_LANGS = {
  "en-US": "English (US)",
  "en-GB": "English (UK)",
  "es-ES": "Spanish (Spain)",
  "fr-FR": "French (France)",
  "de-DE": "German (Germany)",
  "ar-SA": "Arabic (Saudi Arabia)",
  "hi-IN": "Hindi (India)",
  "ru-RU": "Russian (Russia)",
  "ja-JP": "Japanese (Japan)",
  "ko-KR": "Korean (South Korea)",
};

// For translation
const TRANSLATE_LANGS = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  ar: "Arabic",
  hi: "Hindi",
  ru: "Russian",
  ja: "Japanese",
  ko: "Korean",
  zh: "Chinese",
};

export default function LanguageSelector({
  sourceLang,
  onSourceChange,
  targetLang,
  onTargetChange,
}) {
  return (
    <div className="flex flex-col space-y-2  items-start mb-4">
      <div className="flex flex-col w-full">
        <label className="font-semibold text-sm mb-1">Spoken Language</label>
        <select
          className="border p-1 rounded w-full"
          value={sourceLang}
          onChange={(e) => onSourceChange(e.target.value)}
        >
          {Object.entries(SPEECH_LANGS).map(([code, label]) => (
            <option key={code} value={code}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col w-full">
        <label className="font-semibold text-sm mb-1">Target Language</label>
        <select
          className="border p-1 rounded w-full"
          value={targetLang}
          onChange={(e) => onTargetChange(e.target.value)}
        >
          {Object.entries(TRANSLATE_LANGS).map(([code, label]) => (
            <option key={code} value={code}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
