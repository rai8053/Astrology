import { useState, useRef, useCallback } from 'react';
import { api } from '@/lib/api';

interface VoiceRecognitionOptions {
  language?: string;
  onTranscript?: (text: string) => void;
  onError?: (error: string) => void;
}

interface VoiceRecognitionState {
  isRecording: boolean;
  isProcessing: boolean;
  transcript: string;
  error: string | null;
  durationMs: number;
  volume: number;
}

interface VoiceRecognitionActions {
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  cancelRecording: () => void;
  isSupported: boolean;
}

const MAX_RECORDING_MS = 30000;
const SAMPLE_RATE = 16000;

export function useVoiceRecognition(
  options: VoiceRecognitionOptions = {},
): [VoiceRecognitionState, VoiceRecognitionActions] {
  const [state, setState] = useState<VoiceRecognitionState>({
    isRecording: false, isProcessing: false, transcript: '', error: null, durationMs: 0, volume: 0,
  });

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const stateRef = useRef(state);
  stateRef.current = state;

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const volumeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const durationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processingRef = useRef(false);
  const stopPromiseRef = useRef<{ resolve: () => void } | null>(null);

  const isSupported = typeof window !== 'undefined' &&
    typeof navigator.mediaDevices?.getUserMedia === 'function' &&
    typeof MediaRecorder !== 'undefined';

  const clearTimers = useCallback(() => {
    if (volumeTimerRef.current !== null) { clearInterval(volumeTimerRef.current); volumeTimerRef.current = null; }
    if (durationTimerRef.current !== null) { clearInterval(durationTimerRef.current); durationTimerRef.current = null; }
  }, []);

  const cleanupMedia = useCallback(() => {
    if (audioContextRef.current) { audioContextRef.current.close(); audioContextRef.current = null; }
    analyserRef.current = null;
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
  }, []);

  const stopRecording = useCallback(async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === 'inactive' || processingRef.current) return;

    clearTimers();
    processingRef.current = true;

    recorder.stop();

    return new Promise<void>((resolve) => {
      stopPromiseRef.current = { resolve };
    });
  }, [clearTimers]);

  const cancelRecording = useCallback(() => {
    clearTimers();
    processingRef.current = false;
    cleanupMedia();

    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stream.getTracks().forEach(t => t.stop());
      recorder.stop();
    }

    chunksRef.current = [];
    setState(prev => ({
      ...prev, isRecording: false, isProcessing: false, transcript: '', error: null, durationMs: 0, volume: 0,
    }));
  }, [clearTimers, cleanupMedia]);

  const startRecording = useCallback(async () => {
    try {
      processingRef.current = false;
      setState(prev => ({
        ...prev, isRecording: true, error: null, transcript: '', durationMs: 0, volume: 0,
      }));

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { sampleRate: SAMPLE_RATE, channelCount: 1, echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;

      const audioContext = new AudioContext({ sampleRate: SAMPLE_RATE });
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus' : 'audio/webm';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        cleanupMedia();

        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        chunksRef.current = [];

        if (blob.size < 100) {
          setState(prev => ({ ...prev, isRecording: false, isProcessing: false, error: 'No audio detected', volume: 0 }));
          processingRef.current = false;
          const { onError } = optionsRef.current;
          if (onError) onError('No audio detected');
          stopPromiseRef.current?.resolve();
          return;
        }

        setState(prev => ({ ...prev, isRecording: false, isProcessing: true }));

        try {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          await new Promise<void>((r) => { reader.onload = () => r(); });
          const base64 = (reader.result as string).split(',')[1];

          const resp = await api.post<{ text: string }>('/api/voice/asr', {
            audio: base64,
            language: optionsRef.current.language || 'en_us',
          });

          const text = resp.data.text;
          setState(prev => ({
            ...prev, isProcessing: false, transcript: text, error: null, volume: 0,
          }));

          const { onTranscript } = optionsRef.current;
          if (text && onTranscript) onTranscript(text);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          setState(prev => ({
            ...prev, isProcessing: false, error: msg, volume: 0,
          }));
          const { onError } = optionsRef.current;
          if (onError) onError(msg);
        }
        processingRef.current = false;
        stopPromiseRef.current?.resolve();
      };

      recorder.onerror = () => {
        clearTimers();
        cleanupMedia();
        chunksRef.current = [];
        setState(prev => ({ ...prev, isRecording: false, isProcessing: false, error: 'Recording failed' }));
        processingRef.current = false;
        stopPromiseRef.current?.resolve();
      };

      recorder.start(100);
      startTimeRef.current = Date.now();

      volumeTimerRef.current = setInterval(() => {
        const analyser = analyserRef.current;
        if (!analyser) return;
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setState(prev => ({ ...prev, volume: Math.min(1, avg / 128) }));
      }, 100);

      durationTimerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        setState(prev => ({ ...prev, durationMs: elapsed }));
        if (elapsed >= MAX_RECORDING_MS) {
          stopRecording();
        }
      }, 200);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      cleanupMedia();
      setState(prev => ({ ...prev, isRecording: false, error: msg }));
      const { onError } = optionsRef.current;
      if (onError) onError(msg);
    }
  }, [cleanupMedia]);

  return [
    state,
    { startRecording, stopRecording, cancelRecording, isSupported },
  ];
}
