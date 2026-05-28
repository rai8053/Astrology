import { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Send, MessageCircle, Sparkles, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { PremiumButton } from '@/components/PremiumButton';
import { PremiumCard } from '@/components/ui/PremiumCard';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatSession {
  id: string;
  title: string;
  updatedAt: string;
}

const suggestedPrompts = [
  'What is my ruling planet?',
  'How to balance my dosha?',
  'Best gemstone for Leo?',
  'What career suits my chart?',
];

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="glass-card rounded-2xl px-5 py-3.5">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
              className="w-2 h-2 bg-gold/60 rounded-full"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ message, index }: { message: ChatMessage; index: number }) {
  const isUser = message.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[85%] md:max-w-[75%] p-3.5 rounded-2xl text-sm leading-relaxed ${
        isUser
          ? 'bg-gradient-to-br from-gold to-amber-400 text-cosmic shadow-lg shadow-gold/20'
          : 'glass-card'
      }`}>
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </motion.div>
  );
}

export function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: sessionsData, refetch: refetchSessions } = useQuery({
    queryKey: ['chat-sessions'],
    queryFn: () => api.get<ChatSession[]>('/api/chat/sessions'),
  });

  const chatMutation = useMutation({
    mutationFn: (message: string) =>
      api.post<{ reply: string; sessionId: string }>('/api/chat', { message, sessionId }),
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: 'assistant', content: data.data.reply }]);
      if (data.data.sessionId !== sessionId) setSessionId(data.data.sessionId);
      refetchSessions();
    },
  });

  const handleSend = () => {
    if (!input.trim() || streaming) return;
    setMessages((prev) => [...prev, { role: 'user', content: input }]);
    setStreaming(true);
    chatMutation.mutate(input, {
      onSettled: () => { setStreaming(false); setInput(''); inputRef.current?.focus(); },
    });
  };

  const newSession = () => {
    setMessages([]);
    setSessionId(null);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadSession = async (id: string) => {
    try {
      const res = await api.get<{ messages: ChatMessage[] }>(`/api/chat/sessions/${id}`);
      setMessages(res.data.messages || []);
      setSessionId(id);
    } catch { /* ignore */ }
  };

  const deleteSession = async (id: string) => {
    try {
      await api.delete(`/api/chat/sessions/${id}`);
      if (sessionId === id) newSession();
      refetchSessions();
    } catch { /* ignore */ }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold">AI Astrologer</h1>
          <p className="text-ink/50 dark:text-parchment/50 mt-1">Chat with your Vedic guide</p>
        </div>
        <PremiumButton variant="ghost" size="sm" icon={<Sparkles className="w-4 h-4" />} onClick={newSession}>
          New Chat
        </PremiumButton>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-2">
          <PremiumCard glass className="p-3">
            <h3 className="text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-ink/40 dark:text-parchment/40 mb-3 px-1">History</h3>
            {sessionsData?.data?.length ? (
              <div className="space-y-1">
                {sessionsData.data.map((s) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="group flex items-center gap-1"
                  >
                    <button
                      onClick={() => loadSession(s.id)}
                      className="flex-1 text-left text-xs p-2 rounded-lg hover:bg-gold/10 dark:hover:bg-white/[0.04] truncate transition-colors text-ink/60 dark:text-parchment/60 hover:text-gold"
                    >
                      {s.title || 'Chat'}
                    </button>
                    <button
                      onClick={() => deleteSession(s.id)}
                      className="p-1.5 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-ink/30 dark:text-parchment/30 px-1">No sessions yet</p>
            )}
          </PremiumCard>
        </div>

        <div className="lg:col-span-3">
          <PremiumCard glass className="h-[600px] flex flex-col p-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
              <AnimatePresence>
                {messages.length === 0 && !streaming && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-16"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <MessageCircle className="w-14 h-14 text-gold/20 mx-auto mb-4" />
                    </motion.div>
                    <p className="text-ink/40 dark:text-parchment/40 text-sm mb-6">
                      Ask anything about astrology, spirituality, or life guidance
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
                      {suggestedPrompts.map((q, i) => (
                        <motion.button
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => { setInput(q); inputRef.current?.focus(); }}
                          className="px-4 py-2 text-xs border border-gold/20 rounded-full hover:border-gold/50 hover:bg-gold/5 transition-all text-ink/50 dark:text-parchment/50"
                        >
                          {q}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {messages.map((m, i) => (
                <ChatBubble key={i} message={m} index={i} />
              ))}

              {streaming && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-ink/10 dark:border-white/[0.06] p-4 md:p-5">
              <div className="flex gap-3 items-center">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask your astrologer..."
                  className="flex-1 bg-transparent border-b border-ink/20 dark:border-white/10 outline-none focus:border-gold py-2.5 text-sm font-serif placeholder:text-ink/30 dark:placeholder:text-parchment/30 transition-colors"
                />
                <PremiumButton
                  size="sm"
                  onClick={handleSend}
                  loading={chatMutation.isPending}
                  icon={<Send className="w-4 h-4" />}
                />
              </div>
            </div>
          </PremiumCard>
        </div>
      </div>
    </motion.div>
  );
}
