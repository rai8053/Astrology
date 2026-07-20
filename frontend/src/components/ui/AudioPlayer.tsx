import { useState, useRef, useCallback, useEffect } from 'react';
import { Pause, Volume2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface AudioPlayerProps {
  text: string;
  autoPlay?: boolean;
  onError?: (error: string) => void;
}

export function AudioPlayer({ text, autoPlay = false, onError }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState<boolean | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);
  }, []);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  const playAudio = useCallback(() => {
    if (!text) return;
    window.speechSynthesis.cancel();
    setError(null);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = (e) => {
      setIsPlaying(false);
      const msg = e.error === 'canceled' ? null : 'Speech synthesis failed';
      if (msg) {
        setError(msg);
        if (onError) onError(msg);
      }
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [text, onError]);

  const stopAudio = useCallback(() => {
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setIsPlaying(false);
  }, []);

  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      stopAudio();
    } else {
      playAudio();
    }
  }, [isPlaying, playAudio, stopAudio]);

  if (supported === null) return null;
  if (!supported) return null;

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
