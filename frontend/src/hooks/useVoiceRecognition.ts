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
    isRecording: false,
    isProcessing: false,
    transcript: '',
    error: null,
    durationMs: 0,
    volume: 0,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const isSupported = typeof window !== 'undefined' &&
    typeof navigator.mediaDevices?.getUserMedia === 'function' &&
    typeof MediaRecorder !== 'undefined';

  const updateVolume = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    const avg = data.reduce((a, b) => a + b, 0) / data.length;
    setState(prev => ({ ...prev, volume: Math.min(1, avg / 128) }));
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setState(prev => ({
        ...prev, isRecording: true, error: null, transcript: '', durationMs: 0, volume: 0,
      }));

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: SAMPLE_RATE,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
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
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onerror = () => {
        stopRecording();
        setState(prev => ({ ...prev, error: 'Recording failed', isRecording: false }));
      };

      recorder.start(100);
      startTimeRef.current = Date.now();

      const volumeInterval = setInterval(updateVolume, 100);
      timerRef.current = volumeInterval;

      const durationInterval = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        setState(prev => ({ ...prev, durationMs: elapsed }));
        if (elapsed >= MAX_RECORDING_MS) {
          stopRecording();
        }
      }, 200);
      (durationInterval as any).__isDuration = true;
      timerRef.current = volumeInterval;
      (timerRef as any).durationTimer = durationInterval;

    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setState(prev => ({ ...prev, isRecording: false, error: msg }));
      if (options.onError) options.onError(msg);
    }
  }, [updateVolume, options]);

  const stopRecording = useCallback(async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === 'inactive') return;

    return new Promise<void>((resolve) => {
      recorder.addEventListener('stop', async () => {
        setState(prev => ({ ...prev, isProcessing: true }));

        if (timerRef.current) clearInterval(timerRef.current);
        if ((timerRef as any).durationTimer) clearInterval((timerRef as any).durationTimer);

        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
        analyserRef.current = null;

        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
          streamRef.current = null;
        }

        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        chunksRef.current = [];

        if (blob.size < 100) {
          setState(prev => ({ ...prev, isProcessing: false, isRecording: false, error: 'No audio detected' }));
          if (options.onError) options.onError('No audio detected');
          resolve();
          return;
        }

        try {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          await new Promise<void>((r) => { reader.onload = () => r(); });
          const base64 = (reader.result as string).split(',')[1];

          const resp = await api.post<{ text: string }>('/api/voice/asr', {
            audio: base64,
            language: options.language || 'en_us',
          });

          const text = resp.data.text;
          setState(prev => ({
            ...prev, isProcessing: false, isRecording: false, transcript: text, error: null,
          }));

          if (text && options.onTranscript) options.onTranscript(text);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          setState(prev => ({
            ...prev, isProcessing: false, isRecording: false, error: msg,
          }));
          if (options.onError) options.onError(msg);
        }
        resolve();
      });

      recorder.stop();
    });
  }, [options]);

  const cancelRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if ((timerRef as any).durationTimer) clearInterval((timerRef as any).durationTimer);

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }

    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stream.getTracks().forEach(t => t.stop());
      recorder.stop();
    }

    chunksRef.current = [];
    setState(prev => ({
      ...prev, isRecording: false, isProcessing: false, transcript: '', error: null, durationMs: 0, volume: 0,
    }));
  }, []);

  return [
    state,
    { startRecording, stopRecording, cancelRecording, isSupported },
  ];
}
