/**
 * useScenariosController
 *
 * Centralises all logic for the scenarios view: translations, AI prompts,
 * caching and derived data for presentation components.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCaseData } from '../../../context/DataContext';
import type { Scenario } from '../../../types';
import {
  ACTION_CATEGORY_COLOR,
  ACTION_PRIORITY_COLOR,
  ACTION_PRIORITY_ORDER,
  SCENARIO_CATEGORY_CONFIG,
  SCENARIO_SORT_ORDER,
} from '../constants';
import {
  analyzeScenario,
  getAnalysisResults,
  subscribeToScenarioAnalysis,
} from '../services/aiScenarioAnalysisService';
import type { ScenarioAnalysisResult } from '../services/aiScenarioAnalysisService';
import { getGeminiApiKey } from '../../../lib/ai';
import type { ScenarioControllerState } from '../types/view-model';

type ScenarioDisplay = {
  name: string;
  description: string;
  assumptions: string[];
  expectedOutcome: string;
};

export const useScenariosController = (): ScenarioControllerState => {
  const { t } = useTranslation();
  const { scenariosData, actionsData } = useCaseData();
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ScenarioAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const scenarioContentMap = useMemo(() => {
    const map: Record<string, ScenarioDisplay> = {
      'scen-best': {
        name: t('scenarios.items.best.name'),
        description: t('scenarios.items.best.description'),
        assumptions: t('scenarios.items.best.assumptions', { returnObjects: true }) as string[],
        expectedOutcome: t('scenarios.items.best.expectedOutcome'),
      },
      'scen-base': {
        name: t('scenarios.items.base.name'),
        description: t('scenarios.items.base.description'),
        assumptions: t('scenarios.items.base.assumptions', { returnObjects: true }) as string[],
        expectedOutcome: t('scenarios.items.base.expectedOutcome'),
      },
      'scen-worst': {
        name: t('scenarios.items.worst.name'),
        description: t('scenarios.items.worst.description'),
        assumptions: t('scenarios.items.worst.assumptions', { returnObjects: true }) as string[],
        expectedOutcome: t('scenarios.items.worst.expectedOutcome'),
      },
      'scen-surprise': {
        name: t('scenarios.items.surprise.name'),
        description: t('scenarios.items.surprise.description'),
        assumptions: t('scenarios.items.surprise.assumptions', { returnObjects: true }) as string[],
        expectedOutcome: t('scenarios.items.surprise.expectedOutcome'),
      },
      'scen-exit': {
        name: t('scenarios.items.exit.name'),
        description: t('scenarios.items.exit.description'),
        assumptions: t('scenarios.items.exit.assumptions', { returnObjects: true }) as string[],
        expectedOutcome: t('scenarios.items.exit.expectedOutcome'),
      },
    };

    return map;
  }, [t]);

  const probabilityLabels = useMemo(() => ({
    Lav: t('scenarios.probability.low'),
    Middel: t('scenarios.probability.medium'),
    Høj: t('scenarios.probability.high'),
    Ekstrem: t('scenarios.probability.extreme'),
  }), [t]);

  const impactLabels = useMemo(() => ({
    Lav: t('scenarios.impact.low'),
    Middel: t('scenarios.impact.medium'),
    Høj: t('scenarios.impact.high'),
    Ekstrem: t('scenarios.impact.extreme'),
  }), [t]);

  const actionPriorityLabels = useMemo(() => ({
    Påkrævet: t('actions.priorities.required'),
    Høj: t('actions.priorities.high'),
    Middel: t('actions.priorities.medium'),
  }), [t]);

  const actionCategoryLabels = useMemo(() => ({
    Juridisk: t('actions.categories.legal'),
    Finansiel: t('actions.categories.financial'),
    Efterretning: t('actions.categories.intelligence'),
    Kommerciel: t('actions.categories.commercial'),
    Regulatorisk: t('actions.categories.regulatory'),
    Governance: t('actions.categories.governance'),
    Strategisk: t('actions.categories.strategic'),
  }), [t]);

  const cards = useMemo(() => {
    const mapped = scenariosData.map(scenario => {
      const display = scenarioContentMap[scenario.id] ?? {
        name: scenario.name,
        description: scenario.description,
        assumptions: scenario.assumptions,
        expectedOutcome: scenario.expectedOutcome,
      };

      return {
        id: scenario.id,
        name: display.name,
        description: display.description,
        assumptions: display.assumptions,
        expectedOutcome: display.expectedOutcome,
        probabilityLabel: probabilityLabels[scenario.probability] ?? scenario.probability,
        impactLabel: impactLabels[scenario.impact] ?? scenario.impact,
        accentColor: SCENARIO_CATEGORY_CONFIG[scenario.category].color,
        category: scenario.category,
      };
    });

    return mapped.sort(
      (a, b) => SCENARIO_SORT_ORDER[a.category] - SCENARIO_SORT_ORDER[b.category]
    );
  }, [impactLabels, probabilityLabels, scenarioContentMap, scenariosData]);

  const selectedScenario = useMemo(() => {
    if (!selectedScenarioId) return null;
    return scenariosData.find(scenario => scenario.id === selectedScenarioId) ?? null;
  }, [scenariosData, selectedScenarioId]);

  useEffect(() => {
    if (!selectedScenario) {
      setAnalysisResult(null);
      setAnalysisError(null);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const scenarioId = selectedScenario.id;
    const apiKey = getGeminiApiKey();

    const handleLiveUpdate = (result: ScenarioAnalysisResult) => {
      if (!isMounted || result.scenarioId !== scenarioId) {
        return;
      }
      setAnalysisResult(result);
      setAnalysisError(null);
      setIsLoading(false);
    };

    const unsubscribe = subscribeToScenarioAnalysis(handleLiveUpdate);

    const runAnalysis = async () => {
      setIsLoading(true);
      setAnalysisError(null);

      try {
        const result = await getAnalysisResults({
          scenarioId,
          scenario: selectedScenario,
          actions: actionsData,
          apiKey: apiKey ?? undefined,
        });

        if (!isMounted) {
          return;
        }

        if (!result) {
          setAnalysisResult(null);
          if (!apiKey) {
            setAnalysisError(
              t('scenarios.ai.missingKey', {
                defaultValue:
                  'AI-modulet er ikke aktiveret. Tilføj VITE_GEMINI_API_KEY for at køre analyser.',
              })
            );
          }
          setIsLoading(false);
          return;
        }

        setAnalysisResult(result);
        setIsLoading(false);

        if (result.source === 'cache' && apiKey) {
          analyzeScenario({
            scenario: selectedScenario,
            actions: actionsData,
            apiKey,
          }).catch((error: unknown) => {
            if (!isMounted) return;
            console.error('AI analysis refresh failed', error);
          });
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message = error instanceof Error ? error.message : '';
        if (!apiKey && !message) {
          setAnalysisError(
            t('scenarios.ai.missingKey', {
              defaultValue:
                'AI-modulet er ikke aktiveret. Tilføj VITE_GEMINI_API_KEY for at køre analyser.',
            })
          );
        } else if (message.includes('Cannot find module')) {
          setAnalysisError(
            t('scenarios.ai.moduleLoadError', {
              defaultValue: 'AI-modulet kunne ikke indlæses i denne session.',
            })
          );
        } else {
          setAnalysisError(message || t('scenarios.ai.error'));
        }
        setIsLoading(false);
      }
    };

    runAnalysis();

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [actionsData, selectedScenario, t]);

  const linkedActions = useMemo(() => {
    if (!selectedScenario) return [];
    return actionsData
      .filter(action => selectedScenario.linkedActions.includes(action.id))
      .sort(
        (a, b) => ACTION_PRIORITY_ORDER[a.priority] - ACTION_PRIORITY_ORDER[b.priority]
      )
      .map(action => ({
        id: action.id,
        title: `${action.id}: ${action.title}`,
        priorityTag: {
          label: actionPriorityLabels[action.priority],
          color: ACTION_PRIORITY_COLOR[action.priority],
        },
        categoryTag: {
          label: actionCategoryLabels[action.category],
          color: ACTION_CATEGORY_COLOR[action.category],
        },
      }));
  }, [actionCategoryLabels, actionPriorityLabels, actionsData, selectedScenario]);

  const onSelectScenario = useCallback((scenarioId: Scenario['id']) => {
    setSelectedScenarioId(scenarioId);
  }, []);

  const onClosePanel = useCallback(() => {
    setSelectedScenarioId(null);
  }, []);

  return {
    cards: cards.map(card => ({
      ...card,
      accentColor: card.accentColor,
      probabilityLabel: card.probabilityLabel,
      impactLabel: card.impactLabel,
    })),
    analysisPanel: {
      isVisible: Boolean(selectedScenario),
      scenarioName: selectedScenario
        ? scenarioContentMap[selectedScenario.id]?.name ?? selectedScenario.name
        : '',
      isLoading,
      error: analysisError,
      sections: analysisResult?.sections ?? [],
      rawText: analysisResult?.rawText ?? '',
      generatedAt: analysisResult?.generatedAt ?? null,
      source: analysisResult?.source ?? null,
      linkedActions,
    },
    onSelectScenario,
    onClosePanel,
  };
};
