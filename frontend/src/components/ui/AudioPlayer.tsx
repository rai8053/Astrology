import { useState, useRef, useCallback, useEffect } from 'react';
import { Play, Pause, Loader2, Volume2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';

interface AudioPlayerProps {
  text: string;
  autoPlay?: boolean;
  onError?: (error: string) => void;
}

export function AudioPlayer({ text, autoPlay = false, onError }: AudioPlayerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    };
  }, []);

  const playAudio = useCallback(async () => {
    if (!text) return;

    setIsLoading(true);
    setError(null);

    try {
      const resp = await api.post<{ audio: string; audioType: string }>('/voice/tts', {
        text: text.slice(0, 2000),
      });

      const audioBase64 = resp.data.audio;
      const audioType = resp.data.audioType || 'audio/mpeg';

      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);

      const byteChars = atob(audioBase64);
      const byteNums = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) {
        byteNums[i] = byteChars.charCodeAt(i);
      }
      const byteArr = new Uint8Array(byteNums);
      const blob = new Blob([byteArr], { type: audioType });
      const url = URL.createObjectURL(blob);
      audioUrlRef.current = url;

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        setIsPlaying(false);
        const msg = 'Audio playback failed';
        setError(msg);
        if (onError) onError(msg);
      };

      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      if (onError) onError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [text, onError]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  }, []);

  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      stopAudio();
    } else {
      playAudio();
    }
  }, [isPlaying, playAudio, stopAudio]);

  if (isLoading) {
    return (
      <button
        disabled
        className="p-1.5 rounded-lg bg-gold/10 text-gold/60"
        aria-label="Generating audio"
      >
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={togglePlayback}
        className={`p-1.5 rounded-lg transition-colors ${
          isPlaying
            ? 'bg-gold/20 text-gold'
            : 'bg-gold/5 hover:bg-gold/10 text-gold/70 hover:text-gold'
        }`}
        aria-label={isPlaying ? 'Stop audio' : 'Play audio'}
        title={isPlaying ? 'Stop' : 'Listen to response'}
      >
        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
      </motion.button>

      {error && (
        <span className="flex items-center gap-1 text-[10px] text-red-400/70">
          <AlertCircle className="w-2.5 h-2.5" /> {error}
        </span>
      )}
    </div>
  );
}
