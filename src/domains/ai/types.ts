/**
 * AI Command Domain Types
 *
 * Types for AI command panel, query execution, and command history.
 */

export type AiCommandStatus = 'idle' | 'pending' | 'success' | 'error';

export interface AiCommandEntry {
  id: string;
  query: string;
  response: string | null;
  status: AiCommandStatus;
  timestamp: string;
  duration?: number; // ms
  error?: string;
  model?: string;
  tokens?: {
    input: number;
    output: number;
  };
}

export interface AiCommandState {
  entries: AiCommandEntry[];
  isProcessing: boolean;
  currentQuery: string | null;
}

export interface AiCommandConfig {
  maxHistorySize: number;
  defaultModel: string;
  systemPrompt?: string;
}

export const DEFAULT_AI_CONFIG: AiCommandConfig = {
  maxHistorySize: 50,
  defaultModel: 'gemini-2.5-flash',
  systemPrompt: `Du er en intelligent assistent for TSL Intelligence Console.
Du hjælper operatører med at analysere finansielle data, risikoscore, og virksomhedsstrukturer.
Svar altid præcist og professionelt på dansk.`,
};

export interface AiQueryRequest {
  query: string;
  context?: {
    subject?: string;
    view?: string;
    data?: Record<string, unknown>;
  };
  apiKey?: string;
}

export interface AiQueryResponse {
  success: boolean;
  response?: string;
  error?: string;
  duration?: number;
  model?: string;
}
