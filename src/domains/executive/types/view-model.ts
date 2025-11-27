/**
 * Executive Summary View Models
 *
 * Defines the presentational data contracts used by the ExecutiveSummaryView
 * and subcomponents. All heavy data shaping happens in the controller hook so
 * the React components can remain lean and focused on rendering.
 */

import type { MutableRefObject } from 'react';
import type { ExecutiveFinancialAlert } from '../../../types';

export type TagColor = 'green' | 'red' | 'yellow' | 'blue' | 'gray';

export interface TrendChartViewModel {
  title: string;
  data: Array<{ year: number; value: number }>;
  lineColor: string;
  highlightColor: string;
  containerRef: MutableRefObject<HTMLDivElement | null>;
  valueFormatter: (value: number | null) => string;
}

export interface FinancialMetricViewModel {
  label: string;
  value: string;
  delta?: {
    label: string;
    direction: 'up' | 'down';
    tone: 'positive' | 'negative';
  };
}

export interface FinancialAlertViewModel {
  id: ExecutiveFinancialAlert['id'];
  label: string;
  description: string;
  value: string;
}

export interface FinancialCardViewModel {
  title: string;
  subtitle: string;
  tone: 'warning' | 'neutral';
  metaTag?: { label: string; color: TagColor };
  metrics: FinancialMetricViewModel[];
  charts: TrendChartViewModel[];
  alerts: FinancialAlertViewModel[];
  alertsTitle?: string;
}

export interface RiskScoreViewModel {
  category: string;
  justification: string;
  tag: { label: string; color: TagColor };
}

export interface RiskCardViewModel {
  title: string;
  subtitle: string;
  complianceLabel: string;
  compliance: string;
  taxCaseLabel: string;
  taxCaseValue: string;
  redFlags: string[];
  riskScores: RiskScoreViewModel[];
  metaTag: { label: string; color: TagColor };
  containerRef: MutableRefObject<HTMLDivElement | null>;
}

export interface ActionListItemViewModel {
  id: string;
  title: string;
  description?: string;
  priorityTag: { label: string; color: TagColor };
  horizonTag?: { label: string; color: TagColor };
  ownerLabel: string;
  horizonLabel: string;
  dateLabel?: string;
  metaLine?: string;
}

export interface ActionsCardViewModel {
  title: string;
  subtitle: string;
  actionsCtaLabel: string;
  noDeadlinesLabel: string;
  onViewActions: () => void;
  sectionLabels: {
    upcomingDeadlines: string;
    criticalEvents: string;
    boardActionables: string;
    nextKeyEvents: string;
    responsibility: string;
    horizon: string;
    notSpecified: string;
    notApplicable: string;
  };
  sections: {
    upcomingDeadlines: ActionListItemViewModel[];
    criticalEvents: ActionListItemViewModel[];
    boardActionables: ActionListItemViewModel[];
    upcomingEvents: ActionListItemViewModel[];
  };
}

export interface ExecutiveAlertViewModel {
  id: string;
  title: string;
  message: string;
  severity: 'critical' | 'error' | 'warning' | 'info';
  severityLabel: string;
  severityColor: TagColor;
  categoryLabel: string;
  timestampLabel: string;
}

export interface ExecutiveSummaryControllerState {
  header: {
    eyebrow: string;
    title: string;
    subtitle: string;
    exportLabel: string;
    exportingLabel: string;
    timelineLabel: string;
    onTimeline: () => void;
    onExport: () => void;
    isExporting: boolean;
  };
  alertsTitle: string;
  alerts: ExecutiveAlertViewModel[];
  financialCard: FinancialCardViewModel;
  riskCard: RiskCardViewModel;
  actionsCard: ActionsCardViewModel;
}
