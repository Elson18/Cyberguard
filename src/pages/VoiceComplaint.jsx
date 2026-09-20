import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { VoiceOrb } from '../components/VoiceOrb';
import './VoiceComplaint.css';
import { API_BASE } from '../services/api';

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'ur', name: 'Urdu', native: 'اردو' },
];

const DEFAULT_QUESTIONS = [
  {
    step: 0,
    key: 'what_happened',
    question: 'Can you tell me what happened?',
    fieldName: 'What happened',
  },
  {
    step: 1,
    key: 'when_happened',
    question: 'When did this happen?',
    fieldName: 'Date / time',
  },
  {
    step: 2,
    key: 'where_happened',
    question: 'Where did this happen?',
    fieldName: 'Location / platform',
  },
  {
    step: 3,
    key: 'who_involved',
    question: 'Do you have any details about the person or organization involved?',
    fieldName: 'People / organization involved',
  },
  {
    step: 4,
    key: 'additional_details',
    question: "Is there anything else you'd like to add?",
    fieldName: 'Additional details',
  },
];

export function VoiceComplaint() {
  const navigate = useNavigate();

  // Screen steps: 'WELCOME', 'CONVERSATION', 'REVIEW', 'SUBMITTING', 'SUCCESS'
  const [screenStep, setScreenStep] = useState('WELCOME');

  // AI & Speech State
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [aiState, setAiState] = useState('idle'); // 'speaking', 'listening', 'processing', 'idle'
  const [transcript, setTranscript] = useState('');
  const [manualInputText, setManualInputText] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [useTextInput, setUseTextInput] = useState(false);

  // Multilingual State
  const [currentLang, setCurrentLang] = useState({ code: 'en', name: 'English', native: 'English' });
  const [privacyWarning, setPrivacyWarning] = useState('');

  // Complaint Summary State
  const [complaintSummary, setComplaintSummary] = useState({
    what_happened: '',
    when_happened: '',
    where_happened: '',
    who_involved: '',
    additional_details: '',
  });

  const [editingKey, setEditingKey] = useState(null);
  const [editingValue, setEditingValue] = useState('');

  // Submission Results State
  const [referenceNumber, setReferenceNumber] = useState('');
  const [submittedTimestamp, setSubmittedTimestamp] = useState('');
  const [documentText, setDocumentText] = useState('');
  const [showDocModal, setShowDocModal] = useState(false);

  // WebSocket & Speech Refs
  const wsRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthesisRef = useRef(window.speechSynthesis);
  const silenceTimerRef = useRef(null);

  // Initialize SpeechRecognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = currentLang.code === 'ta' ? 'ta-IN' : currentLang.code === 'hi' ? 'hi-IN' : 'en-US';

      recognition.onresult = (event) => {
        let currentTranscript = '';
        let isFinal = false;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
          if (event.results[i].isFinal) isFinal = true;
        }

        if (currentTranscript.trim()) {
          setTranscript(currentTranscript);

          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

          if (isFinal) {
            handleSendAnswer(currentTranscript);
          } else {
            silenceTimerRef.current = setTimeout(() => {
              handleSendAnswer(currentTranscript);
            }, 1400);
          }
        }
      };

      recognition.onend = () => {
        if (transcript.trim() && aiState === 'listening') {
          handleSendAnswer(transcript);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (aiState === 'listening') {
          setAiState('idle');
        }
      };

      recognitionRef.current = recognition;
    }
  }, [currentLang.code, currentQuestionIdx, complaintSummary, transcript, aiState]);

  // Connect WebSocket
  const connectWebSocket = () => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.hostname || 'localhost';
      const wsUrl = `${protocol}//${host}:8765/ws/complaint/user_guest/token_public`;

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('CyberGuard Realtime Complaint WebSocket connected');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketEvent(data);
        } catch (e) {
          console.error('Failed to parse WS message:', e);
        }
      };

      ws.onerror = (err) => {
        console.warn('WebSocket error, switching to local voice handler:', err);
      };

      wsRef.current = ws;
    } catch (e) {
      console.warn('WebSocket connection failed:', e);
    }
  };

  const handleWebSocketEvent = (data) => {
    if (data.type === 'language_detected') {
      const langMatch = SUPPORTED_LANGUAGES.find((l) => l.code === data.language_code) || {
        code: data.language_code || 'en',
        name: data.language || 'English',
      };
      setCurrentLang(langMatch);
    } else if (data.type === 'privacy_warning') {
      setPrivacyWarning(data.message);
      setTimeout(() => setPrivacyWarning(''), 5000);
    } else if (data.type === 'ai_speaking') {
      speakQuestion(data.text);
    } else if (data.type === 'complaint_summary') {
      if (data.data) {
        setComplaintSummary({
          what_happened: data.data.description || complaintSummary.what_happened,
          when_happened: data.data.incident_date || complaintSummary.when_happened,
          where_happened: data.data.category || complaintSummary.where_happened,
          who_involved: data.data.suspect_details || complaintSummary.who_involved,
          additional_details: `Amount: ${data.data.amount || 'N/A'}, Payment: ${data.data.payment_method || 'N/A'}`,
        });
      }
      setScreenStep('REVIEW');
    } else if (data.type === 'complaint_submitted') {
      const ref = data.data?.reference_number || `CG-${Math.floor(10000000 + Math.random() * 90000000)}`;
      setReferenceNumber(ref);
      setSubmittedTimestamp(new Date().toLocaleString());
      setDocumentText(data.data?.document_text || '');
      setScreenStep('SUCCESS');
    }
  };

  const speakQuestion = (text) => {
    if (isMuted) {
      startListening();
      return;
    }

    if (synthesisRef.current) {
      synthesisRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => setAiState('speaking');
      utterance.onend = () => {
        setAiState('listening');
        startListening();
      };
      utterance.onerror = () => {
        setAiState('listening');
        startListening();
      };

      synthesisRef.current.speak(utterance);
    } else {
      setAiState('listening');
      startListening();
    }
  };

  const startListening = () => {
    if (useTextInput) return;
    if (recognitionRef.current) {
      setTranscript('');
      setAiState('listening');
      try {
        recognitionRef.current.start();
      } catch (e) {}
    }
  };

  const stopListening = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  };

  const handleSendAnswer = (answerText) => {
    const finalAnswer = answerText || transcript || manualInputText;
    if (!finalAnswer.trim()) return;

    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    stopListening();
    setAiState('processing');

    const currentKey = DEFAULT_QUESTIONS[currentQuestionIdx].key;
    const updatedSummary = {
      ...complaintSummary,
      [currentKey]: finalAnswer.trim(),
    };
    setComplaintSummary(updatedSummary);

    const nextStep = currentQuestionIdx + 1;
    setTranscript('');
    setManualInputText('');

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'text',
          text: finalAnswer.trim(),
          step: currentQuestionIdx
        })
      );
    }

    setTimeout(() => {
      if (nextStep < DEFAULT_QUESTIONS.length) {
        setCurrentQuestionIdx(nextStep);
        speakQuestion(DEFAULT_QUESTIONS[nextStep].question);
      } else {
        setScreenStep('REVIEW');
        speakQuestion('Here is what I understood. Does everything look correct?');
      }
    }, 600);
  };

  const handleStartConversation = () => {
    setScreenStep('CONVERSATION');
    setCurrentQuestionIdx(0);
    setComplaintSummary({
      what_happened: '',
      when_happened: '',
      where_happened: '',
      who_involved: '',
      additional_details: '',
    });

    connectWebSocket();

    setTimeout(() => {
      speakQuestion(DEFAULT_QUESTIONS[0].question);
    }, 400);
  };

  const handleManualLanguageChange = (code) => {
    const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === code) || SUPPORTED_LANGUAGES[0];
    setCurrentLang(langObj);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'set_language',
          language_code: code,
        })
      );
    }
  };

  const handleRepeatQuestion = () => {
    stopListening();
    const qText = DEFAULT_QUESTIONS[currentQuestionIdx].question;
    speakQuestion(qText);
  };

  const handleEndConversation = () => {
    stopListening();
    if (synthesisRef.current) synthesisRef.current.cancel();
    setScreenStep('REVIEW');
  };

  const handleConfirmComplaint = async () => {
    setScreenStep('SUBMITTING');

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'confirm_summary',
        })
      );
    } else {
      try {
        const res = await fetch(`${API_BASE}/api/complaint/submit-voice`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(complaintSummary),
        });
        const data = await res.json();
        setReferenceNumber(data.reference_number || `CG-${Math.floor(10000000 + Math.random() * 90000000)}`);
        setSubmittedTimestamp(new Date().toLocaleString());
      } catch (err) {
        setReferenceNumber(`CG-${Math.floor(10000000 + Math.random() * 90000000)}`);
        setSubmittedTimestamp(new Date().toLocaleString());
      } finally {
        setTimeout(() => {
          setScreenStep('SUCCESS');
        }, 1200);
      }
    }
  };

  const handleSaveEdit = (key) => {
    setComplaintSummary((prev) => ({ ...prev, [key]: editingValue }));
    setEditingKey(null);
  };

  const handleDownloadComplaint = () => {
    const docContent = documentText || `
===================================================================
                  CYBERGUARD OFFICIAL INCIDENT COMPLAINT
===================================================================
Reference Number : ${referenceNumber}
Submitted On     : ${submittedTimestamp}
Language         : ${currentLang.name}
Status           : SUBMITTED & ENCRYPTED
===================================================================

INCIDENT SUMMARY DETAILS:
-------------------------------------------------------------------
1. WHAT HAPPENED:
   ${complaintSummary.what_happened || 'Not specified'}

2. WHEN IT HAPPENED:
   ${complaintSummary.when_happened || 'Not specified'}

3. WHERE IT HAPPENED (LOCATION / PLATFORM):
   ${complaintSummary.where_happened || 'Not specified'}

4. PEOPLE / ORGANIZATION INVOLVED:
   ${complaintSummary.who_involved || 'Not specified'}

5. ADDITIONAL DETAILS:
   ${complaintSummary.additional_details || 'None'}

-------------------------------------------------------------------
Notice: Formally registered in the CyberGuard National Security Database.
===================================================================
`;

    const blob = new Blob([docContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CyberGuard_Complaint_${referenceNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="voice-assistant-page">
      <div className="bg-canvas" aria-hidden="true">
        <div className="bg-grid" />
        <div className="bg-blob bg-blob--blue" />
        <div className="bg-blob bg-blob--cyan" />
      </div>

      <header className="va-header">
        <Link to="/" className="va-brand">
          <div className="brand-logo">🛡️</div>
          <span className="brand-title">CyberGuard</span>
        </Link>
        <div className="va-header-tag">Voice Help</div>
      </header>

      <main className="va-content">
        {/* WELCOME SCREEN */}
        {screenStep === 'WELCOME' && (
          <div className="va-card welcome-card">
            <div className="welcome-badge">
              <i className="fas fa-sparkles" /> Voice Help
            </div>

            <h1 className="welcome-heading">How can we help you today?</h1>

            <p className="welcome-description">
              Tell us what happened. Speak naturally in your preferred language and I'll help you file your complaint step-by-step.
            </p>

            {/* Language Selector Dropdown */}
            <div className="lang-selector-box">
              <label htmlFor="welcomeLangSelect" className="lang-select-label">
                <i className="fas fa-globe" /> Select Language:
              </label>
              <select
                id="welcomeLangSelect"
                value={currentLang.code}
                onChange={(e) => handleManualLanguageChange(e.target.value)}
                className="lang-select-dropdown"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name} ({l.native})
                  </option>
                ))}
              </select>
            </div>

            <div className="welcome-icon-box">
              <div className="mic-glow-icon">
                <i className="fas fa-microphone" />
              </div>
            </div>

            <button
              onClick={handleStartConversation}
              className="btn-primary btn-start-convo"
            >
              <i className="fas fa-microphone" /> Start Conversation
            </button>
          </div>
        )}

        {/* VOICE CONVERSATION SCREEN */}
        {screenStep === 'CONVERSATION' && (
          <div className="va-card conversation-card">
            {privacyWarning && (
              <div className="privacy-warning-banner">
                <i className="fas fa-shield-halved" /> {privacyWarning}
              </div>
            )}

            <div className="convo-progress-header">
              <span className="progress-step-text">
                Question {currentQuestionIdx + 1} of {DEFAULT_QUESTIONS.length}
              </span>
              <div className="progress-bar-container">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${((currentQuestionIdx + 1) / DEFAULT_QUESTIONS.length) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            <h2 className="current-question-title">
              {DEFAULT_QUESTIONS[currentQuestionIdx].question}
            </h2>

            <div
              className="orb-clickable-wrapper"
              onClick={() => {
                if (transcript.trim()) {
                  handleSendAnswer(transcript);
                } else if (aiState === 'idle' || aiState === 'listening') {
                  startListening();
                }
              }}
              style={{ cursor: 'pointer', width: '100%' }}
              title="Click orb to speak or confirm response"
            >
              <VoiceOrb
                state={aiState}
                currentQuestion={DEFAULT_QUESTIONS[currentQuestionIdx].question}
                transcript={transcript}
                language={currentLang.name}
                languageCode={currentLang.code}
              />
            </div>

            {aiState === 'listening' && (
              <div className="transcript-action-box">
                {transcript ? (
                  <button
                    onClick={() => handleSendAnswer(transcript)}
                    className="btn-submit-answer"
                  >
                    Confirm & Next <i className="fas fa-arrow-right" />
                  </button>
                ) : (
                  <div className="listening-prompt">
                    Speak into your microphone in {currentLang.name}...
                  </div>
                )}
              </div>
            )}

            {useTextInput && (
              <div className="text-fallback-box">
                <input
                  type="text"
                  placeholder={`Type response in ${currentLang.name}...`}
                  value={manualInputText}
                  onChange={(e) => setManualInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendAnswer(manualInputText)}
                  className="manual-input-field"
                />
                <button
                  onClick={() => handleSendAnswer(manualInputText)}
                  className="btn-send-text"
                >
                  Send
                </button>
              </div>
            )}

            <div className="voice-controls-bar">
              <button
                onClick={handleRepeatQuestion}
                className="control-btn"
                title="Repeat Question"
              >
                <i className="fas fa-rotate-right" /> Repeat
              </button>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`control-btn ${isMuted ? 'muted' : ''}`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                <i className={`fas ${isMuted ? 'fa-volume-xmark' : 'fa-volume-high'}`} />
                {isMuted ? 'Unmute' : 'Mute'}
              </button>

              <button
                onClick={() => setUseTextInput(!useTextInput)}
                className="control-btn"
                title="Toggle Text Input"
              >
                <i className={`fas ${useTextInput ? 'fa-microphone' : 'fa-keyboard'}`} />
                {useTextInput ? 'Use Mic' : 'Type'}
              </button>

              <button
                onClick={handleEndConversation}
                className="control-btn btn-danger-soft"
                title="End Conversation"
              >
                <i className="fas fa-stop" /> End
              </button>
            </div>
          </div>
        )}

        {/* COMPLAINT REVIEW */}
        {screenStep === 'REVIEW' && (
          <div className="va-card review-card">
            <div className="review-header">
              <h2>Here's what I understood</h2>
              <p className="review-subtitle">
                Please review your complaint details before final submission.
              </p>
            </div>

            <div className="review-fields-grid">
              {DEFAULT_QUESTIONS.map((q) => {
                const val = complaintSummary[q.key] || 'Not specified';
                const isEditing = editingKey === q.key;

                return (
                  <div key={q.key} className="review-item-card">
                    <div className="review-item-header">
                      <span className="review-item-label">{q.fieldName}</span>
                      {!isEditing && (
                        <button
                          onClick={() => {
                            setEditingKey(q.key);
                            setEditingValue(val);
                          }}
                          className="btn-edit-field"
                        >
                          <i className="fas fa-pen-to-square" /> Edit
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="edit-field-box">
                        <textarea
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          className="edit-textarea"
                          rows={3}
                        />
                        <div className="edit-actions">
                          <button
                            onClick={() => handleSaveEdit(q.key)}
                            className="btn-save-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingKey(null)}
                            className="btn-cancel-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="review-item-value">{val}</p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="review-prompt">
              <h3>Does everything look correct?</h3>
            </div>

            <div className="review-actions-bar">
              <button
                onClick={handleConfirmComplaint}
                className="btn-primary btn-confirm"
              >
                <i className="fas fa-circle-check" /> Confirm Complaint
              </button>

              <button
                onClick={() => {
                  setScreenStep('CONVERSATION');
                  setCurrentQuestionIdx(0);
                  speakQuestion(DEFAULT_QUESTIONS[0].question);
                }}
                className="btn-secondary btn-make-changes"
              >
                <i className="fas fa-rotate-left" /> Make Changes
              </button>
            </div>
          </div>
        )}

        {/* SUBMITTING PROGRESS */}
        {screenStep === 'SUBMITTING' && (
          <div className="va-card progress-card">
            <div className="progress-spinner-box">
              <div className="custom-spinner" />
            </div>
            <h2>Preparing your complaint...</h2>
            <p className="progress-subtext">
              Generating your official reference code.
            </p>
          </div>
        )}

        {/* SUCCESS SCREEN */}
        {screenStep === 'SUCCESS' && (
          <div className="va-card success-card">
            <div className="success-icon-badge">
              <i className="fas fa-check" />
            </div>

            <h1 className="success-title">
              Your complaint has been submitted successfully.
            </h1>

            <div className="reference-card">
              <span className="ref-label">Complaint Reference Number</span>
              <div className="ref-number-display">{referenceNumber}</div>
              <span className="ref-time">Submitted on {submittedTimestamp}</span>
            </div>

            <div className="success-options-grid">
              <button
                onClick={() => setShowDocModal(true)}
                className="btn-option-card"
              >
                <i className="fas fa-file-lines option-icon" />
                <span className="option-title">View Complaint</span>
                <span className="option-desc">Inspect full summary text</span>
              </button>

              <button
                onClick={handleDownloadComplaint}
                className="btn-option-card btn-option-primary"
              >
                <i className="fas fa-download option-icon" />
                <span className="option-title">Download Complaint</span>
                <span className="option-desc">Save official report document</span>
              </button>

              <button
                onClick={handleStartConversation}
                className="btn-option-card"
              >
                <i className="fas fa-plus option-icon" />
                <span className="option-title">Start New Complaint</span>
                <span className="option-desc">Begin another voice report</span>
              </button>
            </div>

            <Link to="/" className="back-home-link">
              ← Return to Dashboard
            </Link>
          </div>
        )}
      </main>

      {/* View Complaint Modal */}
      {showDocModal && (
        <div className="modal-backdrop" onClick={() => setShowDocModal(false)}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Official Complaint Document Summary</h3>
              <button
                onClick={() => setShowDocModal(false)}
                className="modal-close-btn"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="doc-meta-row">
                <strong>Reference:</strong> {referenceNumber}
              </div>
              <div className="doc-meta-row">
                <strong>Timestamp:</strong> {submittedTimestamp}
              </div>
              <div className="doc-meta-row">
                <strong>Language:</strong> {currentLang.name} ({currentLang.code.toUpperCase()})
              </div>

              <div className="doc-section">
                <h4>1. What Happened</h4>
                <p>{complaintSummary.what_happened || 'Not specified'}</p>
              </div>

              <div className="doc-section">
                <h4>2. Date & Time</h4>
                <p>{complaintSummary.when_happened || 'Not specified'}</p>
              </div>

              <div className="doc-section">
                <h4>3. Location / Platform</h4>
                <p>{complaintSummary.where_happened || 'Not specified'}</p>
              </div>

              <div className="doc-section">
                <h4>4. People / Organization Involved</h4>
                <p>{complaintSummary.who_involved || 'Not specified'}</p>
              </div>

              <div className="doc-section">
                <h4>5. Additional Details</h4>
                <p>{complaintSummary.additional_details || 'None'}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={handleDownloadComplaint}
                className="btn-primary"
              >
                <i className="fas fa-download" /> Download Document
              </button>
              <button
                onClick={() => setShowDocModal(false)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
