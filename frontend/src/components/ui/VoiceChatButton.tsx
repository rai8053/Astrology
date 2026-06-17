import { useEffect, useState } from 'react';
import { Mic, MicOff, Loader2, Square, AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { api } from '@/lib/api';

interface VoiceChatButtonProps {
  onTranscript: (text: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

export function VoiceChatButton({ onTranscript, onError, disabled }: VoiceChatButtonProps) {
  const [voiceAvailable, setVoiceAvailable] = useState<boolean | null>(null);
  const [{ isRecording, isProcessing, transcript, error, durationMs, volume }, voice] = useVoiceRecognition({
    onTranscript,
    onError,
  });

  useEffect(() => {
    api.get<{ available: boolean }>('/voice/config')
      .then(resp => setVoiceAvailable(resp.data.available))
      .catch(() => setVoiceAvailable(false));
  }, []);

  if (voiceAvailable === null) return null;
  if (!voiceAvailable || !voice.isSupported) return null;

  return (
    <div className="relative">
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2"
          >
            <div className="glass-card rounded-xl px-4 py-3 shadow-lg min-w-[200px]">
              <div className="flex items-center gap-3 mb-2">
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="w-3 h-3 rounded-full bg-red-400"
                />
                <span className="text-xs font-medium text-ink/70 dark:text-parchment/70">
                  Recording... {formatTime(durationMs)}
                </span>
                <button
                  onClick={voice.cancelRecording}
                  className="ml-auto p-1 rounded-md hover:bg-ink/5 dark:hover:bg-white/5 transition-colors"
                  aria-label="Cancel recording"
                >
                  <Square className="w-3 h-3 fill-ink/40 text-ink/40" />
                </button>
              </div>
              <div className="flex gap-0.5 items-end h-6">
                {Array.from({ length: 32 }).map((_, i) => {
                  const active = i / 32 < volume;
                  return (
                    <motion.div
                      key={i}
                      animate={{
                        height: active ? `${12 + Math.random() * 60}%` : '15%',
                        opacity: active ? 0.8 : 0.2,
                      }}
                      transition={{ duration: 0.1 }}
                      className="w-1 rounded-full bg-gradient-to-t from-gold/60 to-gold"
                    />
                  );
                })}
              </div>
              <p className="text-[10px] text-ink/40 dark:text-parchment/40 mt-1.5 text-center">
                Speak your astrology question
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isProcessing && (
        <div className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-gold/10 text-gold text-xs">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Transcribing...</span>
        </div>
      )}

      {!isRecording && !isProcessing && (
        <button
          onClick={voice.startRecording}
          disabled={disabled}
          className="p-2 rounded-lg hover:bg-gold/10 transition-colors disabled:opacity-40"
          aria-label="Start voice recording"
          title="Ask a question with your voice"
        >
          <Mic className="w-4 h-4 text-gold" />
        </button>
      )}

      {isRecording && !isProcessing && (
        <button
          onClick={voice.stopRecording}
          className="p-2 rounded-lg bg-red-400/20 hover:bg-red-400/30 transition-colors"
          aria-label="Stop recording"
        >
          <MicOff className="w-4 h-4 text-red-400" />
        </button>
      )}

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap"
          >
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-400/10 text-red-400 text-[10px]">
              <AlertCircle className="w-3 h-3" />
              <span>{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
