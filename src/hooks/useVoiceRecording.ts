"use client";

import { useState, useRef, useCallback } from 'react';

interface VoiceRecordingState {
  isRecording: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  isSupported: boolean;
}

interface VoiceRecordingReturn extends VoiceRecordingState {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  clearTranscript: () => void;
  retryRecording: () => Promise<void>;
}

export function useVoiceRecording(): VoiceRecordingReturn {
  const [state, setState] = useState<VoiceRecordingState>({
    isRecording: false,
    transcript: '',
    interimTranscript: '',
    error: null,
    isSupported: true, // Assume supported until proven otherwise
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const clearTranscript = useCallback(() => {
    setState(prev => ({ ...prev, transcript: '', interimTranscript: '', error: null }));
  }, []);

  const retryRecording = useCallback(async () => {
    setState(prev => ({ ...prev, error: null, isSupported: true }));
    await startRecording();
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null, transcript: '' }));

      // Check for Web Speech API support
      if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        throw new Error('Voice recording is not supported in your browser. Please use Chrome, Firefox, Safari, or Edge, or type your entry instead.');
      }

      // Check for microphone permission
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone access is not available. Please check your browser permissions or type your entry instead.');
      }

      // Test microphone access
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
          } 
        });
        // Stop the test stream immediately
        stream.getTracks().forEach(track => track.stop());
      } catch (micError) {
        throw new Error('Microphone permission denied. Please allow microphone access and try again, or type your entry instead.');
      }

      // Set up Web Speech API for real-time transcription
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognitionClass();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setState(prev => ({ ...prev, isRecording: true, isSupported: true }));
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setState(prev => {
          // Only add final transcripts to the permanent transcript
          // Interim transcripts are just for real-time feedback
          return {
            ...prev,
            transcript: prev.transcript + finalTranscript,
            interimTranscript: interimTranscript,
          };
        });
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        let errorMessage = 'Voice recording is temporarily unavailable. ';
        
        switch (event.error) {
          case 'no-speech':
            errorMessage += 'No speech detected. Please try speaking more clearly.';
            break;
          case 'audio-capture':
            errorMessage += 'Microphone access failed. Please check your microphone and try again.';
            break;
          case 'not-allowed':
            errorMessage += 'Microphone permission denied. Please allow microphone access and try again.';
            break;
          case 'network':
            errorMessage += 'Speech recognition service is unavailable. This can happen due to network issues or service outages.';
            break;
          case 'service-not-allowed':
            errorMessage += 'Speech recognition service is not available in your region or browser.';
            break;
          case 'bad-grammar':
            errorMessage += 'Speech recognition configuration error.';
            break;
          default:
            errorMessage += 'Please try again or type your entry instead.';
        }
        
        setState(prev => ({
          ...prev,
          error: errorMessage,
          isRecording: false,
          isSupported: false,
        }));
      };

      recognition.onend = () => {
        setState(prev => ({ ...prev, isRecording: false }));
      };

      recognitionRef.current = recognition;
      recognition.start();

    } catch (error) {
      console.error('Error starting recording:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to start recording. Please type your entry instead.',
        isRecording: false,
        isSupported: false,
      }));
    }
  }, []);

  const stopRecording = useCallback(() => {
    try {
      // Stop Speech Recognition
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      setState(prev => ({ ...prev, isRecording: false }));
    } catch (error) {
      console.error('Error stopping recording:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to stop recording',
        isRecording: false,
      }));
    }
  }, []);

  return {
    ...state,
    startRecording,
    stopRecording,
    clearTranscript,
    retryRecording,
  };
}

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}
