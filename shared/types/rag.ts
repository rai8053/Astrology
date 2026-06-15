export interface KnowledgeArticleDTO {
  id: string;
  title: string;
  content: string;
  category: KnowledgeCategory;
  tags: string[];
  source: string | null;
  createdAt: string;
  updatedAt: string;
}

export type KnowledgeCategory =
  | 'ZODIAC'
  | 'PLANET'
  | 'HOUSE'
  | 'NAKSHATRA'
  | 'YOGA'
  | 'COMPATIBILITY'
  | 'GEMSTONE'
  | 'DOSHA'
  | 'GENERAL';

export interface RetrievalResult {
  article: KnowledgeArticleDTO;
  score: number;
}

export interface RetrievalMetricDTO {
  id: string;
  sessionId: string | null;
  messageId: string | null;
  query: string;
  k: number;
  results: number;
  latencyMs: number;
  tokensIn: number;
  tokensOut: number;
  createdAt: string;
}

export interface RAGContext {
  documents: RetrievalResult[];
  conversationHistory: Array<{ role: string; content: string }>;
  workingMemory: string;
  tokenBudget: number;
}
