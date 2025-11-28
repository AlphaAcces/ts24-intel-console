/**
 * AI Command Panel Component
 *
 * Provides an interface for operators to send queries to the AI engine
 * and view command history with status indicators.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bot,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { useAiCommand } from '../../domains/ai';
import type { AiCommandEntry, AiCommandStatus } from '../../domains/ai';

interface AiCommandPanelProps {
  className?: string;
  maxHistoryVisible?: number;
  context?: {
    subject?: string;
    view?: string;
  };
}

const StatusIcon: React.FC<{ status: AiCommandStatus }> = ({ status }) => {
  switch (status) {
    case 'pending':
      return <Loader2 className="w-4 h-4 animate-spin text-blue-400" />;
    case 'success':
      return <CheckCircle2 className="w-4 h-4 text-green-400" />;
    case 'error':
      return <XCircle className="w-4 h-4 text-red-400" />;
    default:
      return <Clock className="w-4 h-4 text-gray-400" />;
  }
};

const CommandEntry: React.FC<{
  entry: AiCommandEntry;
  onRemove: (id: string) => void;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ entry, onRemove, isExpanded, onToggle }) => {
  const { t } = useTranslation();
  const formattedTime = new Date(entry.timestamp).toLocaleTimeString('da-DK', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="border border-border-dark rounded-lg bg-component-dark/60 overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-surface-hover/30 transition-colors text-left"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <StatusIcon status={entry.status} />
          <span className="text-sm text-gray-300 truncate flex-1">{entry.query}</span>
          <span className="text-xs text-gray-500 ml-2">{formattedTime}</span>
          {entry.duration && (
            <span className="text-xs text-gray-600">({entry.duration}ms)</span>
          )}
        </div>
        <div className="flex items-center gap-1 ml-2">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-border-dark p-3 space-y-2">
          {entry.status === 'success' && entry.response && (
            <div className="text-sm text-gray-300 whitespace-pre-wrap bg-base-dark/50 rounded p-2">
              {entry.response}
            </div>
          )}
          {entry.status === 'error' && entry.error && (
            <div className="text-sm text-red-300 bg-red-900/20 rounded p-2">
              {entry.error}
            </div>
          )}
          {entry.status === 'pending' && (
            <div className="text-sm text-blue-300 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('ai.processing')}
            </div>
          )}
          <div className="flex justify-end">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(entry.id);
              }}
              className="text-xs text-gray-500 hover:text-red-400 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              {t('ai.remove')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const AiCommandPanel: React.FC<AiCommandPanelProps> = ({
  className = '',
  maxHistoryVisible = 5,
  context,
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { state, isProcessing, executeQuery, clearHistory, removeEntry } = useAiCommand();

  // Auto-expand latest entry when it completes
  useEffect(() => {
    if (state.entries.length > 0) {
      const latest = state.entries[state.entries.length - 1];
      if (latest.status !== 'pending') {
        setExpandedId(latest.id);
      }
    }
  }, [state.entries]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isProcessing) return;

    const trimmedQuery = query.trim();
    setQuery('');

    await executeQuery(trimmedQuery, context);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const visibleEntries = showAllHistory
    ? state.entries
    : state.entries.slice(-maxHistoryVisible);

  const hasMoreHistory = state.entries.length > maxHistoryVisible;

  return (
    <div className={`bg-component-dark rounded-lg border border-border-dark ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border-dark">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-accent-green" />
          <h3 className="text-md font-semibold text-gray-200">{t('ai.title')}</h3>
          {isProcessing && (
            <span className="flex items-center gap-1 text-xs text-blue-400">
              <Sparkles className="w-3 h-3 animate-pulse" />
              {t('ai.thinking')}
            </span>
          )}
        </div>
        {state.entries.length > 0 && (
          <button
            onClick={clearHistory}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            {t('ai.clearHistory')}
          </button>
        )}
      </div>

      {/* Command History */}
      <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
        {visibleEntries.length === 0 ? (
          <div className="text-center py-6 text-gray-500 text-sm">
            <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>{t('ai.emptyState')}</p>
          </div>
        ) : (
          <>
            {hasMoreHistory && !showAllHistory && (
              <button
                onClick={() => setShowAllHistory(true)}
                className="w-full text-xs text-gray-500 hover:text-gray-300 py-1"
              >
                {t('ai.showMore', { count: state.entries.length - maxHistoryVisible })}
              </button>
            )}
            {visibleEntries.map((entry) => (
              <CommandEntry
                key={entry.id}
                entry={entry}
                onRemove={removeEntry}
                isExpanded={expandedId === entry.id}
                onToggle={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
              />
            ))}
          </>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border-dark">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('ai.placeholder')}
            disabled={isProcessing}
            rows={1}
            className="flex-1 bg-base-dark border border-border-dark rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent-green/50 resize-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!query.trim() || isProcessing}
            className="px-4 py-2 bg-accent-green/20 text-accent-green rounded-lg hover:bg-accent-green/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          {t('ai.hint')}
        </p>
      </form>
    </div>
  );
};

export default AiCommandPanel;
