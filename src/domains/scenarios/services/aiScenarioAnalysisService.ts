/**
 * Scenario AI analysis service. Handles cache management, Gemini prompt generation
 * and live subscriptions so components and hooks remain declarative.
 */

import type { Scenario, ActionItem } from '../../../types';
import { AI_CACHE_KEY } from '../constants';
import { parseAnalysisSections } from '../utils/analysisParser';
import type { ParsedSection } from '../utils/analysisParser';

const isBrowserEnvironment = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

type ScenarioAnalysisCacheEntry = {
  rawText: string;
  generatedAt: string;
};

type ScenarioAnalysisCache = Record<string, ScenarioAnalysisCacheEntry>;

export interface ScenarioAnalysisResult {
  scenarioId: string;
  rawText: string;
  sections: ParsedSection[];
  generatedAt: string;
  source: 'cache' | 'live';
}

type ScenarioAnalysisListener = (result: ScenarioAnalysisResult) => void;

const listeners = new Set<ScenarioAnalysisListener>();

const notifyListeners = (result: ScenarioAnalysisResult) => {
  listeners.forEach(listener => listener(result));
};

const upgradeLegacyEntry = (value: unknown): ScenarioAnalysisCacheEntry | null => {
  if (!value) return null;

  if (typeof value === 'string') {
    return {
      rawText: value,
      generatedAt: new Date().toISOString(),
    };
  }

  if (typeof value === 'object' && 'rawText' in (value as Record<string, unknown>)) {
    const entry = value as Partial<ScenarioAnalysisCacheEntry>;
    if (!entry.rawText) return null;
    return {
      rawText: entry.rawText,
      generatedAt: entry.generatedAt ?? new Date().toISOString(),
    };
  }

  return null;
};

const readCache = (): ScenarioAnalysisCache => {
  if (!isBrowserEnvironment) {
    return {};
  }

  const cachedData = window.localStorage.getItem(AI_CACHE_KEY);
  if (!cachedData) {
    return {};
  }

  try {
    const parsed = JSON.parse(cachedData) as Record<string, unknown>;
    const entries = Object.entries(parsed)
      .map(([scenarioId, value]) => {
        const upgraded = upgradeLegacyEntry(value);
        return upgraded ? ([scenarioId, upgraded] as const) : null;
      })
      .filter((entry): entry is readonly [string, ScenarioAnalysisCacheEntry] => Boolean(entry));

    return Object.fromEntries(entries);
  } catch (error) {
    console.warn('Failed to parse AI scenario cache, clearing store.', error);
    window.localStorage.removeItem(AI_CACHE_KEY);
    return {};
  }
};

const writeCache = (cache: ScenarioAnalysisCache) => {
  if (!isBrowserEnvironment) {
    return;
  }

  window.localStorage.setItem(AI_CACHE_KEY, JSON.stringify(cache));
};

export const getCachedScenarioAnalysis = (scenarioId: string): ScenarioAnalysisCacheEntry | null => {
  const cache = readCache();
  return cache[scenarioId] ?? null;
};

export const setCachedScenarioAnalysis = (scenarioId: string, entry: ScenarioAnalysisCacheEntry) => {
  const cache = readCache();
  cache[scenarioId] = entry;
  writeCache(cache);
};

interface ScenarioAnalysisRequest {
  scenario: Scenario;
  actions: ActionItem[];
  apiKey: string;
}

export const generateScenarioAnalysis = async ({
  scenario,
  actions,
  apiKey,
}: ScenarioAnalysisRequest): Promise<string> => {
  const { generateGeminiContent } = await import('../../../lib/ai');

  const actionsList = actions
    .map(action => `- ${action.id}: ${action.title} (Prioritet: ${action.priority})`)
    .join('\n');

  const prompt = `
Du er en ekspert i risikoanalyse og strategi for virksomheder.
Analysér følgende scenarie for virksomheden TS Logistik og generér en "mini-playbook" på dansk.

**Scenarie: ${scenario.name}**
- Beskrivelse: ${scenario.description}
- Forudsætninger: ${scenario.assumptions.join(', ')}
- Forventet Udfald: ${scenario.expectedOutcome}

**Tilgængelige Handlinger (Actions):**
${actionsList}

**Din opgave:**
Generér en kortfattet analyse i 3 dele. Brug markdown til formatering med overskrifter (##) og lister (*).

## 1. Konsekvenser
* Hvad betyder dette scenarie helt konkret for TS Logistik? Dæk økonomi, drift, og Ümit Cetin personligt. (3-5 punkter)

## 2. Kritiske Handlinger
* Baseret på listen af handlinger, hvilke 3-5 er de absolut vigtigste at fokusere på i netop dette scenarie? List dem med deres ID og titel.

## 3. Mini-Playbook (Næste 30 dage)
* **Konkrete Næste Skridt:** Hvad er de tre første, mest presserende ting, ledelsen skal gøre inden for 30 dage?
* **Triggere at Overvåge:** Hvilke 3 konkrete signaler eller hændelser indikerer, at virksomheden er på vej ind i dette scenarie?
`;

  return generateGeminiContent(prompt, apiKey);
};

export interface AnalyzeScenarioOptions extends ScenarioAnalysisRequest {
  forceRefresh?: boolean;
}

export const analyzeScenario = async ({
  scenario,
  actions,
  apiKey,
}: AnalyzeScenarioOptions): Promise<ScenarioAnalysisResult> => {
  const rawText = await generateScenarioAnalysis({ scenario, actions, apiKey });
  const generatedAt = new Date().toISOString();
  const sections = parseAnalysisSections(rawText);

  setCachedScenarioAnalysis(scenario.id, { rawText, generatedAt });

  const result: ScenarioAnalysisResult = {
    scenarioId: scenario.id,
    rawText,
    sections,
    generatedAt,
    source: 'live',
  };

  notifyListeners(result);
  return result;
};

export interface GetAnalysisResultsOptions {
  scenarioId: string;
  scenario?: Scenario;
  actions?: ActionItem[];
  apiKey?: string;
  forceRefresh?: boolean;
}

export const getAnalysisResults = async ({
  scenarioId,
  scenario,
  actions,
  apiKey,
  forceRefresh = false,
}: GetAnalysisResultsOptions): Promise<ScenarioAnalysisResult | null> => {
  const cached = getCachedScenarioAnalysis(scenarioId);

  if (cached && !forceRefresh) {
    return {
      scenarioId,
      rawText: cached.rawText,
      sections: parseAnalysisSections(cached.rawText),
      generatedAt: cached.generatedAt,
      source: 'cache',
    };
  }

  if (!scenario || !actions?.length || !apiKey) {
    if (!cached) {
      return null;
    }

    return {
      scenarioId,
      rawText: cached.rawText,
      sections: parseAnalysisSections(cached.rawText),
      generatedAt: cached.generatedAt,
      source: 'cache',
    };
  }

  return analyzeScenario({ scenario, actions, apiKey });
};

export const subscribeToScenarioAnalysis = (listener: ScenarioAnalysisListener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
