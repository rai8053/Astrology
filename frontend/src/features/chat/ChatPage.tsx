import { useState, useRef, useEffect, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Send, MessageCircle, Sparkles, Trash2, Bot, User, Stars, Crown, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { api } from '@/lib/api';
import { PremiumButton } from '@/components/PremiumButton';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { VoiceChatButton } from '@/components/ui/VoiceChatButton';
import { AudioPlayer } from '@/components/ui/AudioPlayer';
import { useTranslation } from '@/lib/i18n';
import type { ChatMessageDTO, ChatSessionDTO, PaginatedMessages, PaginatedSessions } from '@shared/types/chat';

const DAILY_FREE_LIMIT = 10;
const MESSAGES_PER_PAGE = 50;

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-end gap-2 max-w-[88%] md:max-w-[78%]">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gold/20 to-amber-400/20 flex items-center justify-center mb-1 shrink-0">
          <Bot className="w-3.5 h-3.5 text-gold" />
        </div>
        <div className="glass-card rounded-2xl rounded-bl-md px-5 py-3.5">
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
    </div>
  );
}

function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-gold prose-headings:font-semibold prose-headings:mt-4 prose-headings:mb-2 prose-p:leading-relaxed prose-p:my-1.5 prose-strong:text-gold/90 prose-ul:my-1 prose-li:my-0.5 prose-code:text-gold/80 prose-code:bg-white/5 prose-code:px-1 prose-code:rounded prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

function ChatBubble({ message, index }: { message: ChatMessageDTO; index: number }) {
  const isUser = message.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className={`flex items-start gap-3 mb-5 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold/20 to-amber-400/20 flex items-center justify-center mt-1 shrink-0 border border-gold/10">
          <Bot className="w-4 h-4 text-gold" />
        </div>
      )}
      <div className={`${
        isUser
          ? 'bg-gradient-to-br from-gold to-amber-400 text-cosmic shadow-lg shadow-gold/20 rounded-2xl rounded-br-md'
          : 'glass-card-premium rounded-2xl rounded-bl-md border border-white/[0.04] shadow-premium'
      } max-w-[88%] md:max-w-[78%] p-4 text-sm leading-relaxed`}>
        {isUser ? (
          <p className="font-medium">{message.content}</p>
        ) : (
          <>
            <MarkdownContent content={message.content} />
            <div className="mt-2 flex justify-end">
              <AudioPlayer text={message.content} />
            </div>
          </>
        )}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold/20 to-amber-400/20 flex items-center justify-center mt-1 shrink-0 border border-gold/10">
          <User className="w-4 h-4 text-gold" />
        </div>
      )}
    </motion.div>
  );
}

export function ChatPage() {
  const { t, language } = useTranslation();
  const suggestedPrompts = [
    t('chat.promptRulingPlanet'),
    t('chat.promptBalanceDosha'),
    t('chat.promptGemstone'),
    t('chat.promptCareer'),
  ];

  const [messages, setMessages] = useState<ChatMessageDTO[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [dailyUsed, setDailyUsed] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [msgPage, setMsgPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [totalMessages, setTotalMessages] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: sessionsData, refetch: refetchSessions } = useQuery({
    queryKey: ['chat-sessions'],
    queryFn: () => api.get<PaginatedSessions>('/api/chat/sessions'),
  });

  const { data: subData } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => api.get<{ plan: string; status: string }>('/api/payments/subscription'),
  });

  useEffect(() => {
    if (subData?.data) {
      setIsPremium(subData.data.plan !== 'FREE' || subData.data.status === 'TRIALING');
    }
  }, [subData]);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const payload: Record<string, unknown> = { message, language };
      if (sessionId) payload.sessionId = sessionId;

      const token = localStorage.getItem('accessToken');
      const baseUrl = '';
      const res = await fetch(`${baseUrl}/api/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Server returned ${res.status}${text ? ': ' + text.slice(0, 200) : ''}`);
      }

      const contentType = res.headers.get('Content-Type') || '';

      if (contentType.includes('text/event-stream')) {
        return await consumeStream(res);
      }

      const data = await res.json();
      if (!data.success) throw new Error(data.error || t('ui.requestFailed'));
      return data.data;
    },
    onSuccess: (data: any) => {
      if (data?.reply) {
        setMessages((prev) => [...prev, {
          id: `msg-${Date.now()}`,
          sessionId: data.sessionId || sessionId || '',
          role: 'assistant',
          content: data.reply,
          tokenCount: data.reply.length,
          model: data.model || null,
          embeddingId: null,
          createdAt: new Date().toISOString(),
        }]);
      }
      if (data?.sessionId && data.sessionId !== sessionId) setSessionId(data.sessionId);
      if (data?.dailyUsed) setDailyUsed(data.dailyUsed as number);
      refetchSessions();
      setError(null);
      setStreamText('');
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : t('chat.failedResponse'));
      setStreamText('');
    },
  });

  const consumeStream = useCallback(async (response: Response): Promise<{ reply: string; sessionId: string; dailyUsed: number }> => {
    const reader = response.body?.getReader();
    if (!reader) throw new Error(t('ui.streamNotAvailable'));

    const decoder = new TextDecoder();
    let result = { reply: '', sessionId: '', dailyUsed: 0 };

    setStreaming(true);

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.done) {
              if (data.sessionId) result.sessionId = data.sessionId;
              if (data.dailyUsed) result.dailyUsed = data.dailyUsed;
              return { reply: result.reply || '', sessionId: result.sessionId, dailyUsed: result.dailyUsed };
            }
            if (data.error) {
              result.reply = data.text || '';
              return { reply: result.reply, sessionId: result.sessionId, dailyUsed: result.dailyUsed };
            }
            if (data.delta) {
              result.reply += data.delta;
              setStreamText(result.reply);
            }
            if (data.text && !data.delta) {
              result.reply = data.text;
              setStreamText(data.text);
            }
          } catch { /* skip malformed JSON */ }
        }
      }
    } finally {
      setStreaming(false);
    }

    return { reply: result.reply || '', sessionId: result.sessionId, dailyUsed: result.dailyUsed };
  }, []);

  const loadSessionMessages = useCallback(async (id: string, page: number = 1) => {
    try {
      const res = await api.get<PaginatedMessages>(`/api/chat/sessions/${id}/messages?page=${page}&limit=${MESSAGES_PER_PAGE}&order=oldest`);
      if (page === 1) {
        setMessages(res.data.messages || []);
      } else {
        setMessages((prev) => [...prev, ...(res.data.messages || [])]);
      }
      const m = res.meta as { page?: number; hasMore?: boolean; total?: number } | undefined;
      if (m) {
        if (m.page != null) setMsgPage(m.page);
        if (m.hasMore != null) setHasMoreMessages(m.hasMore);
        if (m.total != null) setTotalMessages(m.total);
      }
      setSessionId(id);
    } catch { /* ignore */ }
  }, []);

  const loadMoreMessages = () => {
    if (sessionId) {
      loadSessionMessages(sessionId, msgPage + 1);
    }
  };

  const handleSend = async (msg?: string) => {
    const text = msg ?? input;
    if (!text.trim() || streaming) return;
    setMessages((prev) => [...prev, {
      id: `temp-${Date.now()}`,
      sessionId: sessionId || '',
      role: 'user',
      content: text,
      tokenCount: text.length,
      model: null,
      embeddingId: null,
      createdAt: new Date().toISOString(),
    }]);
    setInput('');
    setStreaming(true);
    setStreamText('');

    try {
      const payload: Record<string, unknown> = { message: text, language };
      if (sessionId) payload.sessionId = sessionId;

      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (!res.ok) throw new Error(`Server returned ${res.status}`);

      const contentType = res.headers.get('Content-Type') || '';

      if (contentType.includes('text/event-stream')) {
        const reader = res.body?.getReader();
        if (!reader) throw new Error(t('ui.streamNotAvailable'));
        const decoder = new TextDecoder();
        let reply = '';
        let sid = sessionId;
        let used = dailyUsed;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split('\n')) {
            if (!line.startsWith('data: ')) continue;
            try {
              const data = JSON.parse(line.slice(6));
              if (data.done) {
                if (data.sessionId) sid = data.sessionId;
                if (data.dailyUsed) used = data.dailyUsed;
                break;
              }
              if (data.error) {
                reply = data.text || '';
                break;
              }
              if (data.delta) {
                reply += data.delta;
                setStreamText(reply);
              }
              if (data.text && !data.delta) {
                reply = data.text;
                setStreamText(data.text);
              }
            } catch { /* skip */ }
          }
        }

        setMessages((prev) => [...prev, {
          id: `msg-${Date.now()}`,
          sessionId: sid || sessionId || '',
          role: 'assistant',
          content: reply,
          tokenCount: reply.length,
          model: null,
          embeddingId: null,
          createdAt: new Date().toISOString(),
        }]);
        if (sid && sid !== sessionId) setSessionId(sid);
        if (used) setDailyUsed(used);
        refetchSessions();
        setError(null);
      } else {
        const data = await res.json();
        if (!data.success) throw new Error(data.error || t('ui.requestFailed'));
        setMessages((prev) => [...prev, {
          id: `msg-${Date.now()}`,
          sessionId: data.data.sessionId || sessionId || '',
          role: 'assistant',
          content: data.data.reply,
          tokenCount: data.data.reply.length,
          model: data.data.model || null,
          embeddingId: null,
          createdAt: new Date().toISOString(),
        }]);
        if (data.data.sessionId && data.data.sessionId !== sessionId) setSessionId(data.data.sessionId);
        if (data.data.dailyUsed) setDailyUsed(data.data.dailyUsed);
        refetchSessions();
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('chat.failedResponse'));
    } finally {
      setStreaming(false);
      setStreamText('');
      inputRef.current?.focus();
    }
  };

  const newSession = () => {
    setMessages([]);
    setSessionId(null);
    setStreamText('');
    setMsgPage(1);
    setHasMoreMessages(false);
    setTotalMessages(0);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming, streamText]);

  const loadSession = async (id: string) => {
    await loadSessionMessages(id, 1);
  };

  const deleteSession = async (id: string) => {
    try {
      await api.delete(`/api/chat/sessions/${id}`);
      if (sessionId === id) newSession();
      refetchSessions();
    } catch { /* ignore */ }
  };

  const limitRemaining = isPremium ? Infinity : DAILY_FREE_LIMIT - dailyUsed;

  const sessions = sessionsData?.data?.sessions || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold/20 to-amber-400/20 flex items-center justify-center">
            <Stars className="w-5 h-5 text-gold" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-sans font-bold tracking-tight">{t('chat.title')}</h1>
            <p className="text-ink/50 dark:text-parchment/50 text-xs mt-0.5">{t('chat.subtitle')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isPremium && dailyUsed > 0 && (
            <span className="text-[10px] text-gold/60 font-mono bg-gold/5 px-2.5 py-1 rounded-full border border-gold/10">
              {limitRemaining}/{DAILY_FREE_LIMIT}
            </span>
          )}
          {isPremium && (
            <span className="text-[10px] text-gold font-mono bg-gold/10 px-2.5 py-1 rounded-full border border-gold/20 flex items-center gap-1">
              <Crown className="w-3 h-3" /> {t('chat.premiumBadge')}
            </span>
          )}
          <PremiumButton variant="ghost" size="sm" icon={<Sparkles className="w-4 h-4" />} onClick={newSession}>
            {t('chat.newChat')}
          </PremiumButton>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="lg:col-span-1 space-y-2 order-2 lg:order-1">
          <PremiumCard glass className="p-3">
            <h3 className="text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-ink/40 dark:text-parchment/40 mb-3 px-1">
              {t('chat.history')}
            </h3>
            {sessions.length ? (
              <div className="space-y-1 max-h-[300px] lg:max-h-[400px] overflow-y-auto scrollbar-thin">
                {sessions.map((s) => (
                  <div key={s.id} className="group flex items-center gap-1">
                    <button
                      onClick={() => loadSession(s.id)}
                      className="flex-1 text-left text-xs p-2 rounded-lg hover:bg-gold/10 dark:hover:bg-white/[0.04] truncate transition-colors text-ink/60 dark:text-parchment/60 hover:text-gold"
                    >
                      {s.title || t('chat.title')}
                    </button>
                    <button
                      onClick={() => deleteSession(s.id)}
                      className="p-1.5 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-ink/30 dark:text-parchment/30 px-1">{t('chat.noSessions')}</p>
            )}
          </PremiumCard>
        </div>

        <div className="lg:col-span-3 order-1 lg:order-2">
          <PremiumCard glass className="h-[550px] md:h-[600px] flex flex-col p-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 md:p-5 scrollbar-thin">
              {hasMoreMessages && (
                <div className="text-center mb-4">
                  <button
                    onClick={loadMoreMessages}
                    className="text-[11px] text-gold/60 hover:text-gold transition-colors font-medium"
                  >
                    ↑ {t('chat.loadMore')}
                  </button>
                </div>
              )}

              <AnimatePresence mode="wait">
                {messages.length === 0 && !streaming && !streamText && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-12 md:py-16"
                  >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gold/15 to-amber-400/15 flex items-center justify-center">
                      <MessageCircle className="w-8 h-8 text-gold/40" />
                    </div>
                    <p className="text-ink/40 dark:text-parchment/40 text-sm mb-6 max-w-sm mx-auto px-4">
                      {t('chat.emptyPrompt')}
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto px-2">
                      {suggestedPrompts.map((q, i) => (
                        <motion.button
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleSend(q)}
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
                <ChatBubble key={m.id || i} message={m} index={i} />
              ))}

              {streamText && (
                <div className="flex items-start gap-3 mb-5 justify-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold/20 to-amber-400/20 flex items-center justify-center mt-1 shrink-0 border border-gold/10">
                    <Bot className="w-4 h-4 text-gold" />
                  </div>
                  <div className="glass-card-premium rounded-2xl rounded-bl-md border border-white/[0.04] shadow-premium max-w-[88%] md:max-w-[78%] p-4 text-sm leading-relaxed">
                    <MarkdownContent content={streamText} />
                  </div>
                </div>
              )}

              {streaming && !streamText && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {!isPremium && !streaming && dailyUsed > 0 && dailyUsed >= DAILY_FREE_LIMIT - 2 && (
              <div className="px-4 md:px-5 pt-2">
                <p className="text-[10px] text-gold/60 flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  {limitRemaining <= 0
                    ? t('chat.limitReached')
                    : t('chat.limitRemaining', { count: limitRemaining })}
                </p>
              </div>
            )}

            {error && (
              <div className="px-4 md:px-5 pt-2">
                <p className="text-xs text-red-400/80 flex items-center gap-1">
                  <span>&#9888;</span> {error}
                </p>
              </div>
            )}

            <div className="border-t border-ink/10 dark:border-white/[0.06] p-3 md:p-4">
              <div className="flex gap-2 items-center">
                <input
                  ref={inputRef}
                  autoFocus
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder={t('chat.placeholder')}
                  disabled={streaming}
                  className="flex-1 bg-transparent border border-ink/10 dark:border-white/[0.06] rounded-xl px-4 py-2.5 text-sm font-sans placeholder:text-ink/30 dark:placeholder:text-parchment/30 transition-colors focus:border-gold/40 focus:outline-none disabled:opacity-50"
                />
                <VoiceChatButton
                  onTranscript={(text) => setInput(text)}
                  disabled={streaming}
                />
                <PremiumButton
                  size="sm"
                  onClick={() => handleSend()}
                  loading={streaming}
                  disabled={streaming || !input.trim()}
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
