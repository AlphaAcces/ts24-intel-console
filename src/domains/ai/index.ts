/**
 * AI Domain
 *
 * Central module for AI command functionality, including
 * query execution, command history, and React hooks.
 */

// Types
export type {
  AiCommandStatus,
  AiCommandEntry,
  AiCommandState,
  AiCommandConfig,
  AiQueryRequest,
  AiQueryResponse,
} from './types';

export { DEFAULT_AI_CONFIG } from './types';

// Services
export {
  initAiCommandService,
  subscribeToAiCommands,
  getAiCommandState,
  getCommandHistory,
  clearCommandHistory,
  executeAiQuery,
  removeCommandEntry,
} from './services/aiCommandService';

// Hooks
export { useAiCommand } from './hooks/useAiCommand';
