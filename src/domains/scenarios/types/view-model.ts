/**
 * Scenario view models used by the ScenariosView and its presentational
 * children. Encapsulates all formatted strings, labels and derived data so the
 * React components can stay declarative.
 */

import type { Scenario } from '../../../types';
import type { ParsedSection } from '../utils/analysisParser';

export type TagColor = 'green' | 'yellow' | 'red' | 'blue' | 'gray';

export interface ScenarioCardViewModel {
  id: string;
  name: string;
  description: string;
  assumptions: string[];
  expectedOutcome: string;
  probabilityLabel: string;
  impactLabel: string;
  accentColor: 'green' | 'yellow' | 'red' | 'blue';
  category: Scenario['category'];
}

export interface ScenarioAnalysisActionViewModel {
  id: string;
  title: string;
  priorityTag: { label: string; color: TagColor };
  categoryTag: { label: string; color: TagColor };
}

export interface ScenarioAnalysisViewModel {
  isVisible: boolean;
  scenarioName: string;
  isLoading: boolean;
  error: string | null;
  sections: ParsedSection[];
  rawText: string;
  generatedAt: string | null;
  source: 'cache' | 'live' | null;
  linkedActions: ScenarioAnalysisActionViewModel[];
}

export interface ScenarioControllerState {
  cards: ScenarioCardViewModel[];
  analysisPanel: ScenarioAnalysisViewModel;
  onSelectScenario: (scenarioId: Scenario['id']) => void;
  onClosePanel: () => void;
}
