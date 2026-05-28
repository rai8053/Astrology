import { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Send, MessageCircle, Trash2, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatSession {
  id: string;
  title: string;
  updatedAt: string;
}

export function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    chatMutation.mutate(input, { onSettled: () => { setStreaming(false); setInput(''); } });
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold">AI Astrologer</h1>
          <p className="text-ink/60 dark:text-parchment/60 mt-1">Chat with your Vedic guide</p>
        </div>
        <Button variant="ghost" size="sm" onClick={newSession}><Sparkles className="w-4 h-4" /> New Chat</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-2">
          <Card className="p-3">
            <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-ink/50 mb-3">History</h3>
            {sessionsData?.data?.length ? (
              <div className="space-y-1">
                {sessionsData.data.map((s) => (
                  <button key={s.id} onClick={() => loadSession(s.id)}
                    className="w-full text-left text-xs p-2 rounded-lg hover:bg-ink/5 dark:hover:bg-white/5 truncate transition-colors">
                    {s.title || 'Chat'}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-ink/40">No sessions yet</p>
            )}
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card className="h-[500px] flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 p-4">
              {messages.length === 0 && !streaming && (
                <div className="text-center py-16">
                  <MessageCircle className="w-12 h-12 text-ink/20 mx-auto mb-3" />
                  <p className="text-ink/50 text-sm">Ask anything about astrology, spirituality, or life guidance</p>
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {['What is my ruling planet?', 'How to balance my dosha?', 'Best gemstone for Leo?'].map((q, i) => (
                      <button key={i} onClick={() => { setInput(q); }}
                        className="px-3 py-1.5 text-xs border border-ink/20 dark:border-white/20 rounded-full hover:border-gold/50 transition-colors">
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                    m.role === 'user'
                      ? 'bg-gold text-cosmic'
                      : 'bg-ink/5 dark:bg-white/5'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {streaming && (
                <div className="flex justify-start">
                  <div className="bg-ink/5 dark:bg-white/5 p-3 rounded-lg">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gold rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-ink/10 dark:border-white/10 p-4 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask your astrologer..."
                className="flex-1 bg-transparent border-b border-ink/20 dark:border-white/20 outline-none focus:border-gold py-2 text-sm font-serif"
              />
              <Button size="sm" onClick={handleSend} loading={chatMutation.isPending}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
