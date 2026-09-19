import React from 'react';
import './VoiceOrb.css';

export function VoiceOrb({ state = 'idle', currentQuestion = '', transcript = '', language = 'English', languageCode = 'en' }) {
  const getStateLabel = () => {
    switch (state) {
      case 'speaking':
        return 'CyberGuard is speaking...';
      case 'listening':
        return 'Listening...';
      case 'processing':
        return 'Processing...';
      default:
        return 'Ready';
    }
  };

  const getStateIcon = () => {
    switch (state) {
      case 'speaking':
        return 'fa-volume-high';
      case 'listening':
        return 'fa-microphone';
      case 'processing':
        return 'fa-spinner fa-spin';
      default:
        return 'fa-microphone';
    }
  };

  return (
    <div className={`voice-orb-container voice-orb--${state}`}>
      {/* Top Badges: Status + Language Indicator */}
      <div className="voice-badges-row">
        <div className="voice-status-badge">
          <i className={`fas ${getStateIcon()} status-icon`} aria-hidden="true" />
          <span className="status-text">{getStateLabel()}</span>
        </div>

        <div className="voice-lang-badge">
          <i className="fas fa-globe lang-icon" aria-hidden="true" />
          <span>Language: <strong>{language}</strong></span>
        </div>
      </div>

      {/* Main Animated Orb Visualizer */}
      <div className="orb-wrapper">
        <div className="orb-ring ring-1"></div>
        <div className="orb-ring ring-2"></div>
        <div className="orb-ring ring-3"></div>

        <div className="orb-core">
          <div className="orb-inner-glow"></div>
          <div className="orb-icon-center">
            {state === 'speaking' ? (
              <div className="sound-wave-bars">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
            ) : state === 'listening' ? (
              <div className="mic-pulse-icon">
                <i className="fas fa-microphone" />
              </div>
            ) : state === 'processing' ? (
              <div className="spinner-center">
                <i className="fas fa-circle-notch fa-spin" />
              </div>
            ) : (
              <i className="fas fa-microphone" />
            )}
          </div>
        </div>
      </div>

      {/* Spoken text / transcript live preview */}
      {transcript && state === 'listening' && (
        <div className="live-transcript-bubble">
          <span className="transcript-label">You said:</span> "{transcript}"
        </div>
      )}
    </div>
  );
}
