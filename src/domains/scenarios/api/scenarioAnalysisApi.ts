/**
 * Scenario analysis API stubs.
 *
 * These helpers simulate API endpoints that a backend would expose for the
 * dashboards. They wrap the client-side analysis service so the rest of the
 * application can treat AI analysis as if it was fetched from a remote source.
 */

import type { Scenario, ActionItem } from '../../../types';
import {
  analyzeScenario,
  getAnalysisResults,
  type ScenarioAnalysisResult,
} from '../services/aiScenarioAnalysisService';
import { getGeminiApiKey } from '../../../lib/ai';

export interface ScenarioAnalysisApiResponse {
  status: number;
  data?: ScenarioAnalysisResult;
  error?: string;
}

interface RealtimeAnalysisOptions {
  forceRefresh?: boolean;
  apiKeyOverride?: string;
}

/**
 * Mimics GET /api/scenarios/:id/analysis
 */
export const fetchScenarioAnalysisRealtime = async (
  scenario: Scenario,
  actions: ActionItem[],
  options: RealtimeAnalysisOptions = {}
): Promise<ScenarioAnalysisApiResponse> => {
  const apiKey = options.apiKeyOverride ?? getGeminiApiKey();

  const result = await getAnalysisResults({
    scenarioId: scenario.id,
    scenario,
    actions,
    apiKey: apiKey ?? undefined,
    forceRefresh: options.forceRefresh ?? false,
  });

  if (!result) {
    return {
      status: apiKey ? 204 : 401,
      error: apiKey
        ? 'Ingen AI-analyse tilgængelig endnu.'
        : 'Manglende AI API-nøgle. Tilføj VITE_GEMINI_API_KEY.',
    };
  }

  return {
    status: 200,
    data: result,
  };
};

/**
 * Mimics POST /api/scenarios/:id/analysis to force a new run.
 */
export const requestScenarioAnalysisRefresh = async (
  scenario: Scenario,
  actions: ActionItem[],
  options: RealtimeAnalysisOptions = {}
): Promise<ScenarioAnalysisApiResponse> => {
  const apiKey = options.apiKeyOverride ?? getGeminiApiKey();

  if (!apiKey) {
    return {
      status: 401,
      error: 'AI-modulet er ikke aktiveret. Tilføj VITE_GEMINI_API_KEY for at køre analyser.',
    };
  }

  const result = await analyzeScenario({
    scenario,
    actions,
    apiKey,
  });

  return {
    status: 201,
    data: result,
  };
};
