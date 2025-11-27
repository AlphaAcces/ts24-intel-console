/**
 * Scenario domain constants shared across UI and services.
 */

import type { Scenario, ActionItem } from '../../types';

export const SCENARIO_CATEGORY_CONFIG: Record<Scenario['category'], { color: 'green' | 'yellow' | 'red' | 'blue' }> = {
  Best: { color: 'green' },
  Base: { color: 'yellow' },
  Worst: { color: 'red' },
  Exit: { color: 'blue' },
};

export const PROBABILITY_IMPACT_COLOR: Record<Scenario['probability'] | Scenario['impact'], 'blue' | 'yellow' | 'red'> = {
  Lav: 'blue',
  Middel: 'yellow',
  Høj: 'red',
  Ekstrem: 'red',
};

export const ACTION_PRIORITY_ORDER: Record<ActionItem['priority'], number> = {
  Påkrævet: 1,
  Høj: 2,
  Middel: 3,
};

export const ACTION_PRIORITY_COLOR: Record<ActionItem['priority'], 'red' | 'yellow' | 'blue'> = {
  Påkrævet: 'red',
  Høj: 'yellow',
  Middel: 'blue',
};

export const ACTION_CATEGORY_COLOR: Record<ActionItem['category'], 'blue' | 'green' | 'yellow' | 'gray'> = {
  Juridisk: 'blue',
  Finansiel: 'green',
  Efterretning: 'yellow',
  Kommerciel: 'gray',
  Regulatorisk: 'blue',
  Governance: 'blue',
  Strategisk: 'green',
};

export const SCENARIO_SORT_ORDER: Record<Scenario['category'], number> = {
  Best: 1,
  Base: 2,
  Worst: 3,
  Exit: 4,
};

export const AI_CACHE_KEY = 'ai_scenario_history';
