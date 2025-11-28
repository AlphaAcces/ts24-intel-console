/**
 * useAiCommand Hook
 *
 * React hook for interacting with the AI command service.
 */

import { useState, useEffect, useCallback } from 'react';
import type { AiCommandState, AiQueryRequest, AiQueryResponse, AiCommandConfig } from '../types';
import {
  subscribeToAiCommands,
  executeAiQuery,
  clearCommandHistory,
  removeCommandEntry,
  getAiCommandState,
} from '../services/aiCommandService';

export interface UseAiCommandReturn {
  /** Current state of AI commands */
  state: AiCommandState;
  /** Whether a query is currently being processed */
  isProcessing: boolean;
  /** Execute a new AI query */
  executeQuery: (query: string, context?: AiQueryRequest['context']) => Promise<AiQueryResponse>;
  /** Clear all command history */
  clearHistory: () => void;
  /** Remove a single command entry */
  removeEntry: (entryId: string) => void;
  /** Most recent command entry */
  lastEntry: AiCommandState['entries'][0] | null;
}

export function useAiCommand(config?: Partial<AiCommandConfig>): UseAiCommandReturn {
  const [state, setState] = useState<AiCommandState>(getAiCommandState);

  useEffect(() => {
    const unsubscribe = subscribeToAiCommands((newState) => {
      setState(newState);
    });
    return unsubscribe;
  }, []);

  const executeQuery = useCallback(
    async (query: string, context?: AiQueryRequest['context']): Promise<AiQueryResponse> => {
      const request: AiQueryRequest = { query, context };
      return executeAiQuery(request, config);
    },
    [config]
  );

  const clearHistory = useCallback(() => {
    clearCommandHistory();
  }, []);

  const removeEntry = useCallback((entryId: string) => {
    removeCommandEntry(entryId);
  }, []);

  const lastEntry = state.entries.length > 0 ? state.entries[state.entries.length - 1] : null;

  return {
    state,
    isProcessing: state.isProcessing,
    executeQuery,
    clearHistory,
    removeEntry,
    lastEntry,
  };
}

export default useAiCommand;
