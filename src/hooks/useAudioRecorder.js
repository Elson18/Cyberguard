import { useState, useRef, useCallback } from 'react';

export const RECORDING_STATES = {
  IDLE: 'idle',
  RECORDING: 'recording',
  PROCESSING: 'processing',
  SENDING: 'sending',
  SUCCESS: 'success',
  ERROR: 'error',
};

export function useAudioRecorder() {
  const [status, setStatus] = useState(RECORDING_STATES.IDLE);
  const [error, setError] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

  const getSupportedMimeType = () => {
    if (typeof MediaRecorder === 'undefined') return '';
    const mimeTypes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
    ];
    return mimeTypes.find((type) => MediaRecorder.isTypeSupported(type)) || '';
  };

  const releaseMicrophone = useCallback(() => {
    if (streamRef.current) {
      console.log('[Voice] Releasing microphone tracks...');
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      const msg = "Audio recording isn't supported in this browser. Please use a modern browser like Chrome or Edge.";
      console.error(`[Voice] ${msg}`);
      setError(msg);
      setStatus(RECORDING_STATES.ERROR);
      return;
    }

    try {
      setError(null);
      audioChunksRef.current = [];

      console.log('[Voice] Requesting microphone permission...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      console.log('[Voice] Microphone permission granted.');

      const mimeType = getSupportedMimeType();
      console.log(`[Voice] Selected MediaRecorder MIME type: '${mimeType}'`);

      const options = mimeType ? { mimeType } : {};
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          console.log(`[Voice] Audio chunk received: ${event.data.size} bytes`);
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(250); // Deliver chunks every 250ms
      setStatus(RECORDING_STATES.RECORDING);
      console.log('[Voice] Recording started successfully.');
    } catch (err) {
      console.error('[Voice] Microphone permission/recording error:', err);
      let userMsg = 'Failed to access microphone.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        userMsg = 'Microphone permission was denied. Please allow microphone access in your browser settings and try again.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        userMsg = 'No microphone was found. Please connect a microphone and try again.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        userMsg = 'Your microphone is currently in use by another application.';
      }

      setError(userMsg);
      setStatus(RECORDING_STATES.ERROR);
      releaseMicrophone();
    }
  }, [releaseMicrophone]);

  const stopRecording = useCallback(() => {
    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current;
      if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        releaseMicrophone();
        setStatus(RECORDING_STATES.IDLE);
        resolve(null);
        return;
      }

      setStatus(RECORDING_STATES.PROCESSING);
      console.log('[Voice] Stopping MediaRecorder...');

      mediaRecorder.onstop = () => {
        try {
          const mimeType = mediaRecorder.mimeType || getSupportedMimeType() || 'audio/webm';
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          console.log(`[Voice] Combined Blob created. Total size: ${audioBlob.size} bytes, MIME: ${mimeType}`);

          releaseMicrophone();

          if (audioBlob.size === 0) {
            console.warn('[Voice] Audio blob size is 0 bytes.');
            setError('No audio was captured. Please try speaking again.');
            setStatus(RECORDING_STATES.ERROR);
            resolve(null);
            return;
          }

          const ext = mimeType.includes('ogg') ? 'ogg' : mimeType.includes('mp4') ? 'mp4' : 'webm';
          const filename = `cyberguard-voice-${Date.now()}.${ext}`;
          const audioFile = new File([audioBlob], filename, { type: mimeType });

          // Optional dev preview URL
          const previewUrl = URL.createObjectURL(audioBlob);
          setAudioUrl(previewUrl);

          console.log(`[Voice] Audio File generated: ${audioFile.name} (${audioFile.size} bytes)`);
          resolve({ audioBlob, audioFile, previewUrl, mimeType });
        } catch (err) {
          console.error('[Voice] Error creating audio Blob/File:', err);
          releaseMicrophone();
          setError('Error processing recorded audio. Please try again.');
          setStatus(RECORDING_STATES.ERROR);
          resolve(null);
        }
      };

      mediaRecorder.stop();
    });
  }, [releaseMicrophone]);

  const resetAudio = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setStatus(RECORDING_STATES.IDLE);
    setError(null);
    audioChunksRef.current = [];
    releaseMicrophone();
  }, [audioUrl, releaseMicrophone]);

  return {
    status,
    setStatus,
    error,
    setError,
    audioUrl,
    startRecording,
    stopRecording,
    resetAudio,
    isRecording: status === RECORDING_STATES.RECORDING,
    isProcessing: status === RECORDING_STATES.PROCESSING || status === RECORDING_STATES.SENDING,
  };
}
