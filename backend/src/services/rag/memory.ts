import { prisma } from '../../lib/prisma.js';
import { logger } from '../../lib/logger.js';
import { embeddingService } from './embedding.js';

const MAX_HISTORY_TOKENS = 3000;
const MAX_HISTORY_MESSAGES = 20;
const WORKING_MEMORY_TRUNCATE = 1000;
const SUMMARY_INTERVAL = 10;

interface MemoryEntry {
  role: string;
  content: string;
  timestamp: string;
}

export class MemoryService {
  async getConversationHistory(
    sessionId: string,
    userId: string,
    lastN: number = MAX_HISTORY_MESSAGES,
  ): Promise<MemoryEntry[]> {
    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId, deletedAt: null },
    });
    if (!session) return [];

    const totalMessages = await prisma.chatMessage.count({
      where: { sessionId, deletedAt: null },
    });

    const messages = await prisma.chatMessage.findMany({
      where: { sessionId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
      take: lastN,
      skip: Math.max(0, totalMessages - lastN),
    });

    return messages.map(m => ({
      role: m.role === 'USER' ? 'user' : m.role === 'ASSISTANT' ? 'assistant' : 'system',
      content: m.content,
      timestamp: m.createdAt.toISOString(),
    }));
  }

  async getConversationHistoryWithContext(
    sessionId: string,
    userId: string,
    maxTokens: number = MAX_HISTORY_TOKENS,
  ): Promise<{
    messages: MemoryEntry[];
    truncated: boolean;
    totalTokens: number;
  }> {
    const history = await this.getConversationHistory(sessionId, userId, MAX_HISTORY_MESSAGES);

    let totalTokens = 0;
    const result: MemoryEntry[] = [];
    let truncated = false;

    for (const msg of history) {
      const msgTokens = Math.ceil(msg.content.length / 4) + 2;
      if (totalTokens + msgTokens > maxTokens) {
        truncated = true;
        break;
      }
      result.push(msg);
      totalTokens += msgTokens;
    }

    return { messages: result, truncated, totalTokens };
  }

  formatForPrompt(messages: MemoryEntry[]): string {
    return messages
      .map(m => `${m.role}: ${m.content}`)
      .join('\n');
  }

  async extractWorkingMemory(
    sessionId: string,
    userId: string,
  ): Promise<string> {
    const history = await this.getConversationHistory(sessionId, userId, MAX_HISTORY_MESSAGES);

    const keyDetails: string[] = [];
    for (const msg of history) {
      const lower = msg.content.toLowerCase();
      if (this.containsBirthInfo(lower)) {
        keyDetails.push(`[Birth info mentioned]: ${msg.content.slice(0, 200)}`);
      }
      if (this.containsZodiacInfo(lower)) {
        keyDetails.push(`[Zodiac mentioned]: ${msg.content.slice(0, 150)}`);
      }
      if (this.containsPlanetInfo(lower)) {
        keyDetails.push(`[Planet mentioned]: ${msg.content.slice(0, 150)}`);
      }
    }

    if (keyDetails.length === 0) return '';

    const unique = [...new Set(keyDetails)];
    return unique
      .join('\n')
      .slice(0, WORKING_MEMORY_TRUNCATE);
  }

  private containsBirthInfo(text: string): boolean {
    const patterns = [
      'born', 'birth', 'born on', 'date of birth', 'dob',
      'time of birth', 'birth time', 'birth place', 'birth chart',
      'my chart', 'ascendant', 'lagna', 'rashi', 'nakshatra',
      'sun sign', 'moon sign', 'rising sign',
    ];
    return patterns.some(p => text.includes(p));
  }

  private containsZodiacInfo(text: string): boolean {
    const zodiacSigns = [
      'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
      'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
      'mesh', 'vrishabh', 'mithun', 'karka', 'simha', 'kanya',
      'tula', 'vrischik', 'dhanu', 'makar', 'kumbh', 'meen',
    ];
    return zodiacSigns.some(s => text.includes(s));
  }

  private containsPlanetInfo(text: string): boolean {
    const planets = [
      'sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter',
      'saturn', 'rahu', 'ketu', 'surya', 'chandra', 'budha',
      'shukra', 'mangal', 'guru', 'shani',
    ];
    return planets.some(p => text.includes(p));
  }

  async shouldGenerateSummary(
    sessionId: string,
  ): Promise<boolean> {
    const count = await prisma.chatMessage.count({
      where: { sessionId, deletedAt: null, role: 'USER' },
    });
    return count > 0 && count % SUMMARY_INTERVAL === 0;
  }

  async buildContextWindow(
    sessionId: string,
    userId: string,
    retrievedDocs: string,
  ): Promise<{
    history: MemoryEntry[];
    historyFormatted: string;
    workingMemory: string;
    tokenEstimate: number;
  }> {
    const { messages, totalTokens: historyTokens } =
      await this.getConversationHistoryWithContext(sessionId, userId);

    const workingMemory = await this.extractWorkingMemory(sessionId, userId);
    const workingMemTokens = Math.ceil(workingMemory.length / 4);
    const docTokens = Math.ceil(retrievedDocs.length / 4);

    const total = historyTokens + workingMemTokens + docTokens;

    return {
      history: messages,
      historyFormatted: this.formatForPrompt(messages),
      workingMemory,
      tokenEstimate: total,
    };
  }
}

export const memoryService = new MemoryService();
