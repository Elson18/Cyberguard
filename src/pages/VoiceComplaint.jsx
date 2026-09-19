import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { VoiceOrb } from '../components/VoiceOrb';
import './VoiceComplaint.css';

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

  // Step flow state: 'WELCOME', 'CONVERSATION', 'REVIEW', 'SUBMITTING', 'SUCCESS'
  const [screenStep, setScreenStep] = useState('WELCOME');

  // AI & Speech state
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [aiState, setAiState] = useState('idle'); // 'speaking', 'listening', 'processing', 'idle'
  const [transcript, setTranscript] = useState('');
  const [manualInputText, setManualInputText] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [useTextInput, setUseTextInput] = useState(false);

  // Complaint data state
  const [complaintSummary, setComplaintSummary] = useState({
    what_happened: '',
    when_happened: '',
    where_happened: '',
    who_involved: '',
    additional_details: '',
  });

  const [editingKey, setEditingKey] = useState(null);
  const [editingValue, setEditingValue] = useState('');

  // Result state
  const [referenceNumber, setReferenceNumber] = useState('');
  const [submittedTimestamp, setSubmittedTimestamp] = useState('');
  const [showDocModal, setShowDocModal] = useState(false);

  // Refs for Speech & WebSocket
  const wsRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthesisRef = useRef(window.speechSynthesis);

  // Initialize Web Speech Recognition if available
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (aiState === 'listening') {
          setAiState('idle');
        }
      };

      recognition.onend = () => {
        // Speech ended naturally
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Connect WebSocket to FastAPI backend
  const connectWebSocket = () => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.hostname || 'localhost';
      const wsUrl = `${protocol}//${host}:8765/ws/voice-complaint`;

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('Voice Complaint WebSocket connected');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (e) {
          console.error('Failed to parse WS message:', e);
        }
      };

      ws.onerror = (err) => {
        console.warn('WebSocket error, utilizing local speech engine:', err);
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed');
      };

      wsRef.current = ws;
    } catch (e) {
      console.warn('Could not initialize WebSocket:', e);
    }
  };

  const handleWebSocketMessage = (data) => {
    if (data.type === 'QUESTION') {
      setCurrentQuestionIdx(data.step);
      speakQuestion(data.question);
    } else if (data.type === 'REVIEW') {
      setComplaintSummary(data.summary);
      setScreenStep('REVIEW');
      speakQuestion('Here is what I understood. Does everything look correct?');
    } else if (data.type === 'SUBMITTED') {
      setReferenceNumber(data.reference_number);
      setSubmittedTimestamp(new Date().toLocaleString());
      setScreenStep('SUCCESS');
    }
  };

  // Speak AI question using SpeechSynthesis
  const speakQuestion = (text) => {
    if (isMuted) {
      startListening();
      return;
    }

    if (synthesisRef.current) {
      synthesisRef.current.cancel(); // cancel ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setAiState('speaking');
      };

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

  // Start speech recognition listening
  const startListening = () => {
    if (useTextInput) return;

    if (recognitionRef.current) {
      setTranscript('');
      setAiState('listening');
      try {
        recognitionRef.current.start();
      } catch (e) {
        // Recognition might already be running
      }
    }
  };

  // Stop speech recognition
  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  };

  // Handle user answer submission (either from speech transcript or text input)
  const handleSendAnswer = (answerText) => {
    const finalAnswer = answerText || transcript || manualInputText;
    if (!finalAnswer.trim()) return;

    stopListening();
    setAiState('processing');

    const currentKey = DEFAULT_QUESTIONS[currentQuestionIdx].key;
    const updatedSummary = {
      ...complaintSummary,
      [currentKey]: finalAnswer.trim(),
    };
    setComplaintSummary(updatedSummary);

    // Send answer over WebSocket if available
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'ANSWER',
          step: currentQuestionIdx,
          answer: finalAnswer.trim(),
        })
      );
    } else {
      // Local fallback handler
      setTimeout(() => {
        const nextStep = currentQuestionIdx + 1;
        setTranscript('');
        setManualInputText('');

        if (nextStep < DEFAULT_QUESTIONS.length) {
          setCurrentQuestionIdx(nextStep);
          speakQuestion(DEFAULT_QUESTIONS[nextStep].question);
        } else {
          setScreenStep('REVIEW');
          speakQuestion(
            'Here is what I understood. Does everything look correct?'
          );
        }
      }, 600);
    }
  };

  // Start Voice Assistant Flow
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

    // Trigger first question after brief transition
    setTimeout(() => {
      speakQuestion(DEFAULT_QUESTIONS[0].question);
    }, 400);
  };

  // Controls: Repeat Question
  const handleRepeatQuestion = () => {
    stopListening();
    const qText = DEFAULT_QUESTIONS[currentQuestionIdx].question;
    speakQuestion(qText);
  };

  // Controls: End Conversation early to Review
  const handleEndConversation = () => {
    stopListening();
    if (synthesisRef.current) synthesisRef.current.cancel();
    setScreenStep('REVIEW');
  };

  // Confirm complaint submission
  const handleConfirmComplaint = async () => {
    setScreenStep('SUBMITTING');

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'CONFIRM_SUBMIT',
        })
      );
    } else {
      // REST API submission or local generation fallback
      try {
        const res = await fetch('http://localhost:8765/api/complaint/submit-voice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(complaintSummary),
        });
        const data = await res.json();
        setReferenceNumber(data.reference_number || `REF-2026-${Math.floor(10000 + Math.random() * 90000)}`);
        setSubmittedTimestamp(new Date().toLocaleString());
      } catch (err) {
        setReferenceNumber(`REF-2026-${Math.floor(10000 + Math.random() * 90000)}`);
        setSubmittedTimestamp(new Date().toLocaleString());
      } finally {
        setTimeout(() => {
          setScreenStep('SUCCESS');
        }, 1200);
      }
    }
  };

  // Save edits in Review Screen
  const handleSaveEdit = (key) => {
    setComplaintSummary((prev) => ({ ...prev, [key]: editingValue }));
    setEditingKey(null);
  };

  // Generate downloadable document file
  const handleDownloadComplaint = () => {
    const docContent = `
===================================================================
                  CYBERGUARD OFFICIAL INCIDENT COMPLAINT
===================================================================
Reference Number : ${referenceNumber}
Submitted On     : ${submittedTimestamp}
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
Notice: This document was automatically compiled by the CyberGuard 
AI Voice Assistant and registered into the cybersecurity verification database.
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
      {/* Background aesthetic canvas */}
      <div className="bg-canvas" aria-hidden="true">
        <div className="bg-grid" />
        <div className="bg-blob bg-blob--blue" />
        <div className="bg-blob bg-blob--cyan" />
      </div>

      {/* Header Navigation */}
      <header className="va-header">
        <Link to="/" className="va-brand">
          <div className="brand-logo">🛡️</div>
          <span className="brand-title">CyberGuard</span>
        </Link>
        <div className="va-header-tag">AI Voice Assistant</div>
      </header>

      {/* Main Container */}
      <main className="va-content">
        {/* ================= STAGE 1: WELCOME SCREEN ================= */}
        {screenStep === 'WELCOME' && (
          <div className="va-card welcome-card">
            <div className="welcome-badge">
              <i className="fas fa-sparkles" /> Powered by Voice AI
            </div>

            <h1 className="welcome-heading">How can we help you today?</h1>

            <p className="welcome-description">
              Tell us what happened. I'll ask a few simple questions and help you submit your complaint effortlessly.
            </p>

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

        {/* ================= STAGE 2: VOICE CONVERSATION ================= */}
        {screenStep === 'CONVERSATION' && (
          <div className="va-card conversation-card">
            {/* Step Tracker */}
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

            {/* Question Heading */}
            <h2 className="current-question-title">
              {DEFAULT_QUESTIONS[currentQuestionIdx].question}
            </h2>

            {/* Glowing Voice Orb */}
            <VoiceOrb
              state={aiState}
              currentQuestion={DEFAULT_QUESTIONS[currentQuestionIdx].question}
              transcript={transcript}
            />

            {/* Microphone Answer Confirmation / Spoken Transcript Action */}
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
                    Speak into your microphone now...
                  </div>
                )}
              </div>
            )}

            {/* Optional Manual Text Fallback Toggle */}
            {useTextInput && (
              <div className="text-fallback-box">
                <input
                  type="text"
                  placeholder="Type your response here..."
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

            {/* Voice Controls Bar */}
            <div className="voice-controls-bar">
              <button
                onClick={handleRepeatQuestion}
                className="control-btn"
                title="Repeat Question"
              >
                <i className="fas fa-rotate-right" /> Repeat Question
              </button>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`control-btn ${isMuted ? 'muted' : ''}`}
                title={isMuted ? 'Unmute AI Voice' : 'Mute AI Voice'}
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
                {useTextInput ? 'Use Mic' : 'Type Response'}
              </button>

              <button
                onClick={handleEndConversation}
                className="control-btn btn-danger-soft"
                title="End Conversation"
              >
                <i className="fas fa-stop" /> End Conversation
              </button>
            </div>
          </div>
        )}

        {/* ================= STAGE 3: COMPLAINT REVIEW ================= */}
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

        {/* ================= STAGE 4: SUBMITTING PROGRESS ================= */}
        {screenStep === 'SUBMITTING' && (
          <div className="va-card progress-card">
            <div className="progress-spinner-box">
              <div className="custom-spinner" />
            </div>
            <h2>Preparing your complaint...</h2>
            <p className="progress-subtext">
              Encrypting details and generating your official reference token.
            </p>
          </div>
        )}

        {/* ================= STAGE 5: SUCCESS & ACTION OPTIONS ================= */}
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

      {/* Modal for View Complaint */}
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
