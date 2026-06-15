export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessageDTO {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  tokenCount: number;
  model: string | null;
  embeddingId: string | null;
  createdAt: string;
}

export interface ChatSessionDTO {
  id: string;
  title: string | null;
  messageCount: number;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatSessionDetailDTO {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessageDTO[];
}

export interface SendMessageRequest {
  message: string;
  sessionId?: string | null;
  language?: string;
}

export interface SendMessageResponse {
  reply: string;
  sessionId: string;
  provider?: string;
  model?: string;
  tokenCount?: number;
  dailyUsed: number;
  dailyLimit: number;
  limitExceeded?: boolean;
}

export interface StreamChunk {
  text?: string;
  done?: boolean;
  error?: boolean;
  sessionId?: string;
  dailyUsed?: number;
  dailyLimit?: number;
}

export interface PaginatedMessages {
  messages: ChatMessageDTO[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface PaginatedSessions {
  sessions: ChatSessionDTO[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}
