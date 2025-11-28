/**
 * AI Command Service
 *
 * Handles AI query execution, history management, and caching.
 */

import { generateGeminiContent, getGeminiApiKey, GEMINI_MODEL_ID } from '../../../lib/ai';
import type {
  AiCommandEntry,
  AiCommandState,
  AiQueryRequest,
  AiQueryResponse,
  AiCommandConfig,
} from '../types';

const HISTORY_STORAGE_KEY = 'ai:command:history:v1';

// ============================================================================
// Storage Helpers
// ============================================================================

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function loadHistory(): AiCommandEntry[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AiCommandEntry[];
  } catch (e) {
    console.warn('Failed to load AI command history', e);
    return [];
  }
}

function saveHistory(entries: AiCommandEntry[], maxSize: number = 50): void {
  if (!isBrowser()) return;
  try {
    // Keep only most recent entries
    const trimmed = entries.slice(-maxSize);
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.warn('Failed to save AI command history', e);
  }
}

// ============================================================================
// State Management
// ============================================================================

type Listener = (state: AiCommandState) => void;

let state: AiCommandState = {
  entries: [],
  isProcessing: false,
  currentQuery: null,
};

const listeners = new Set<Listener>();

function notifyListeners(): void {
  listeners.forEach((listener) => {
    try {
      listener(state);
    } catch (e) {
      console.error('AI command listener error', e);
    }
  });
}

function setState(update: Partial<AiCommandState>): void {
  state = { ...state, ...update };
  notifyListeners();
}

// ============================================================================
// Public API
// ============================================================================

export function initAiCommandService(): void {
  const entries = loadHistory();
  setState({ entries });
}

export function subscribeToAiCommands(listener: Listener): () => void {
  listeners.add(listener);
  // Immediately call with current state
  listener(state);
  return () => {
    listeners.delete(listener);
  };
}

export function getAiCommandState(): AiCommandState {
  return state;
}

export function getCommandHistory(): AiCommandEntry[] {
  return state.entries;
}

export function clearCommandHistory(): void {
  setState({ entries: [] });
  saveHistory([]);
}

function generateId(): string {
  return `cmd_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function buildPrompt(request: AiQueryRequest, config: AiCommandConfig): string {
  const systemPrompt = config.systemPrompt || '';
  let contextStr = '';

  if (request.context) {
    const { subject, view, data } = request.context;
    const parts: string[] = [];
    if (subject) parts.push(`Aktiv sag: ${subject}`);
    if (view) parts.push(`Aktuel visning: ${view}`);
    if (data) parts.push(`Relevante data: ${JSON.stringify(data, null, 2)}`);
    if (parts.length > 0) {
      contextStr = `\n\nKontekst:\n${parts.join('\n')}`;
    }
  }

  return `${systemPrompt}${contextStr}\n\nBrugerforespørgsel: ${request.query}`;
}

export async function executeAiQuery(
  request: AiQueryRequest,
  config: Partial<AiCommandConfig> = {}
): Promise<AiQueryResponse> {
  const fullConfig: AiCommandConfig = {
    maxHistorySize: config.maxHistorySize ?? 50,
    defaultModel: config.defaultModel ?? GEMINI_MODEL_ID,
    systemPrompt: config.systemPrompt,
  };

  const entryId = generateId();
  const startTime = Date.now();

  // Create pending entry
  const pendingEntry: AiCommandEntry = {
    id: entryId,
    query: request.query,
    response: null,
    status: 'pending',
    timestamp: new Date().toISOString(),
    model: fullConfig.defaultModel,
  };

  // Add to state
  setState({
    entries: [...state.entries, pendingEntry],
    isProcessing: true,
    currentQuery: request.query,
  });

  try {
    const apiKey = request.apiKey ?? getGeminiApiKey();

    if (!apiKey) {
      throw new Error('AI API-nøgle mangler. Konfigurer venligst din API-nøgle i indstillingerne.');
    }

    const prompt = buildPrompt(request, fullConfig);
    const response = await generateGeminiContent(prompt, apiKey);
    const duration = Date.now() - startTime;

    // Update entry with success
    const successEntry: AiCommandEntry = {
      ...pendingEntry,
      response,
      status: 'success',
      duration,
    };

    const updatedEntries = state.entries.map((e: AiCommandEntry) =>
      e.id === entryId ? successEntry : e
    );

    setState({
      entries: updatedEntries,
      isProcessing: false,
      currentQuery: null,
    });

    saveHistory(updatedEntries, fullConfig.maxHistorySize);

    return {
      success: true,
      response,
      duration,
      model: fullConfig.defaultModel,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Ukendt fejl opstod';

    // Update entry with error
    const errorEntry: AiCommandEntry = {
      ...pendingEntry,
      status: 'error',
      error: errorMessage,
      duration,
    };

    const updatedEntries = state.entries.map((e: AiCommandEntry) =>
      e.id === entryId ? errorEntry : e
    );

    setState({
      entries: updatedEntries,
      isProcessing: false,
      currentQuery: null,
    });

    saveHistory(updatedEntries, fullConfig.maxHistorySize);

    return {
      success: false,
      error: errorMessage,
      duration,
    };
  }
}

export function removeCommandEntry(entryId: string): void {
  const updatedEntries = state.entries.filter((e: AiCommandEntry) => e.id !== entryId);
  setState({ entries: updatedEntries });
  saveHistory(updatedEntries);
}

// Initialize on module load
if (isBrowser()) {
  initAiCommandService();
}
