import { useState, useEffect, useRef, useCallback } from 'react';

// Map CyberGuard i18n language codes to BCP 47 locales for browser SpeechRecognition
export const LOCALE_MAP = {
  en: 'en-IN',
  ta: 'ta-IN',
  hi: 'hi-IN',
  te: 'te-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  bn: 'bn-IN',
  mr: 'mr-IN',
  gu: 'gu-IN',
  pa: 'pa-IN',
  or: 'or-IN',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  pt: 'pt-PT',
  ar: 'ar-SA',
  ja: 'ja-JP',
  ko: 'ko-KR',
  zh: 'zh-CN',
};

export const RECOGNITION_STATES = {
  IDLE: 'IDLE',
  LISTENING: 'LISTENING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  ERROR: 'ERROR',
};

export function useSpeechRecognition({ lang = 'en', onTranscript = null } = {}) {
  const [status, setStatus] = useState(RECOGNITION_STATES.IDLE);
  const [error, setError] = useState(null);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  
  const recognitionRef = useRef(null);
  const isManuallyStoppedRef = useRef(false);

  // Check browser support
  const isSupported = typeof window !== 'undefined' && 
    Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

  const getLocale = useCallback((languageCode) => {
    return LOCALE_MAP[languageCode] || 'en-IN';
  }, []);

  // Initialize SpeechRecognition instance
  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = getLocale(lang);

    recognition.onstart = () => {
      setStatus(RECOGNITION_STATES.LISTENING);
      setError(null);
      setInterimTranscript('');
    };

    recognition.onresult = (event) => {
      let currentInterim = '';
      let currentFinal = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        const transcriptText = result[0].transcript;
        if (result.isFinal) {
          currentFinal += transcriptText;
        } else {
          currentInterim += transcriptText;
        }
      }

      if (currentFinal) {
        setFinalTranscript((prev) => {
          const updated = prev ? `${prev} ${currentFinal.trim()}` : currentFinal.trim();
          if (onTranscript) onTranscript(updated, currentInterim);
          return updated;
        });
      } else {
        if (onTranscript) onTranscript(finalTranscript, currentInterim);
      }

      setInterimTranscript(currentInterim);
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      let errorMessage = 'An error occurred during voice recognition.';

      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        errorMessage = 'Microphone access is required for voice input. Please allow microphone access in your browser settings.';
      } else if (event.error === 'no-speech') {
        errorMessage = 'No speech was detected. Please try speaking again.';
      } else if (event.error === 'audio-capture') {
        errorMessage = 'No microphone was found. Please ensure a microphone is connected.';
      } else if (event.error === 'network') {
        errorMessage = 'Network error occurred during speech recognition.';
      }

      setError(errorMessage);
      setStatus(RECOGNITION_STATES.ERROR);
    };

    recognition.onend = () => {
      if (status !== RECOGNITION_STATES.ERROR) {
        setStatus(RECOGNITION_STATES.COMPLETED);
      }
      setInterimTranscript('');
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore cleanup error if already stopped
        }
      }
    };
  }, [isSupported, getLocale, lang]);

  // Update language dynamically when app language changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = getLocale(lang);
    }
  }, [lang, getLocale]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError("Voice input isn't supported in this browser. Please use a supported browser like Chrome or Edge.");
      setStatus(RECOGNITION_STATES.ERROR);
      return;
    }

    if (!recognitionRef.current) return;

    try {
      isManuallyStoppedRef.current = false;
      setError(null);
      setInterimTranscript('');
      setFinalTranscript('');
      recognitionRef.current.start();
      setStatus(RECOGNITION_STATES.LISTENING);
    } catch (err) {
      // In case start is called while already running
      if (err.name === 'InvalidStateError') {
        try {
          recognitionRef.current.stop();
          setTimeout(() => {
            recognitionRef.current.start();
          }, 100);
        } catch (retryErr) {
          console.error('Failed to restart speech recognition:', retryErr);
        }
      } else {
        console.error('Failed to start speech recognition:', err);
      }
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;

    try {
      isManuallyStoppedRef.current = true;
      setStatus(RECOGNITION_STATES.PROCESSING);
      recognitionRef.current.stop();
      setTimeout(() => {
        setStatus(RECOGNITION_STATES.COMPLETED);
      }, 200);
    } catch (err) {
      console.error('Failed to stop speech recognition:', err);
      setStatus(RECOGNITION_STATES.COMPLETED);
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (status === RECOGNITION_STATES.LISTENING) {
      stopListening();
    } else {
      startListening();
    }
  }, [status, startListening, stopListening]);

  const resetSpeech = useCallback(() => {
    setStatus(RECOGNITION_STATES.IDLE);
    setError(null);
    setInterimTranscript('');
    setFinalTranscript('');
  }, []);

  return {
    isSupported,
    status,
    error,
    interimTranscript,
    finalTranscript,
    startListening,
    stopListening,
    toggleListening,
    resetSpeech,
    activeLocale: getLocale(lang),
  };
}
