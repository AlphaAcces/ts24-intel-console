/**
 * useExecutiveSummaryController
 *
 * Aggregates executive summary data, translations and formatting into a single
 * memoized view model. This keeps the React components dumb and declarative
 * while centralising all business logic and side effects (such as PDF export).
 */

import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCaseData, useActiveSubject, useDataContext } from '../../../context/DataContext';
import type { View, RiskLevel } from '../../../types';
import { useExecutiveKpis } from '../../kpi';
import { alertHandler } from '../../events/handlers/alertHandler';
import { exportExecutiveSummaryReport } from '../services/executiveExportService';
import type {
  ExecutiveAlertViewModel,
  ExecutiveSummaryControllerState,
  FinancialAlertViewModel,
  FinancialMetricViewModel,
  RiskScoreViewModel,
  TagColor,
} from '../types';

const riskLevelColors: Record<RiskLevel | 'N/A', TagColor> = {
  KRITISK: 'red',
  HØJ: 'yellow',
  MODERAT: 'blue',
  LAV: 'green',
  'N/A': 'gray',
};

const severityColors: Record<'critical' | 'error' | 'warning' | 'info', TagColor> = {
  critical: 'red',
  error: 'red',
  warning: 'yellow',
  info: 'blue',
};

export const useExecutiveSummaryController = (
  onNavigate?: (view: View) => void,
): ExecutiveSummaryControllerState => {
  const { t } = useTranslation();
  const subject = useActiveSubject();
  const { caseId } = useDataContext();
  const { executiveSummary } = useCaseData();
  const { financial, risk, actions } = executiveSummary;

  const {
    formatMillions,
    formatChangeLabel,
    formatTrendValue,
    formatAlertValue,
    formatRedFlagValue,
    formatCurrencyValue,
    formatDateValue,
    riskCategoryLabels,
    riskLevelLabels,
    priorityLabels,
    horizonLabels,
  } = useExecutiveKpis();

  const [isExporting, setIsExporting] = useState(false);
  const grossChartRef = useRef<HTMLDivElement | null>(null);
  const profitChartRef = useRef<HTMLDivElement | null>(null);
  const riskCardRef = useRef<HTMLDivElement | null>(null);

  const grossProfitTrend = useMemo(
    () =>
      financial.trendGrossProfit.map(point => ({
        year: point.year,
        value: Number((point.value / 1_000_000).toFixed(1)),
      })),
    [financial.trendGrossProfit],
  );

  const netResultTrend = useMemo(
    () =>
      financial.trendProfitAfterTax.map(point => ({
        year: point.year,
        value: Number((point.value / 1_000_000).toFixed(1)),
      })),
    [financial.trendProfitAfterTax],
  );

  const metrics: FinancialMetricViewModel[] = useMemo(() => {
    const metricList: FinancialMetricViewModel[] = [];

    metricList.push({
      label: t('executive.metric.grossProfit'),
      value: formatMillions(financial.grossProfit),
      delta:
        typeof financial.yoyGrossChange === 'number'
          ? {
              label: formatChangeLabel(financial.yoyGrossChange),
              direction: financial.yoyGrossChange >= 0 ? 'up' : 'down',
              tone: financial.yoyGrossChange >= 0 ? 'positive' : 'negative',
            }
          : undefined,
    });

    metricList.push({
      label: t('executive.metric.profitAfterTax'),
      value: formatMillions(financial.profitAfterTax),
      delta:
        typeof financial.yoyProfitChange === 'number'
          ? {
              label: formatChangeLabel(financial.yoyProfitChange),
              direction: financial.yoyProfitChange >= 0 ? 'up' : 'down',
              tone: financial.yoyProfitChange >= 0 ? 'positive' : 'negative',
            }
          : undefined,
    });

    return metricList;
  }, [financial.grossProfit, financial.profitAfterTax, financial.yoyGrossChange, financial.yoyProfitChange, formatChangeLabel, formatMillions, t]);

  const financialAlerts: FinancialAlertViewModel[] = useMemo(
    () =>
      financial.alerts.map(alert => ({
        id: alert.id,
        label: t(`executive.alert.${alert.id}.label`, { defaultValue: alert.label }),
        description: t(`executive.alert.${alert.id}.description`, { defaultValue: alert.description }),
        value: formatAlertValue(alert.value, alert.unit),
      })),
    [financial.alerts, formatAlertValue, t],
  );

  const financialMetaTag = useMemo(() => {
    if (typeof financial.dso !== 'number') {
      return undefined;
    }
    return {
      label: t('executive.metric.dsoTag', {
        value: financial.dso,
        days: t('executive.units.days', { count: financial.dso }),
      }),
      color: 'yellow' as TagColor,
    };
  }, [financial.dso, t]);

  const riskScores: RiskScoreViewModel[] = useMemo(
    () =>
      risk.riskScores.map(score => ({
        category: riskCategoryLabels[score.category as keyof typeof riskCategoryLabels] ?? score.category,
        justification: score.justification.startsWith('risk.') ? t(score.justification) : score.justification,
        tag: {
          label: riskLevelLabels[score.riskLevel as keyof typeof riskLevelLabels] ?? score.riskLevel,
          color: riskLevelColors[score.riskLevel as RiskLevel] ?? 'gray',
        },
      })),
    [risk.riskScores, riskCategoryLabels, riskLevelLabels, t],
  );

  const redFlagSummaries = useMemo(
    () =>
      risk.redFlags.map(flag => {
        const label = t(`executive.alert.${flag.id}.label`, { defaultValue: flag.id });
        const description = t(`executive.alert.${flag.id}.description`, { defaultValue: '' });
        return `${label}: ${formatRedFlagValue(flag.value, flag.unit)}${description ? ` — ${description}` : ''}`;
      }),
    [risk.redFlags, formatRedFlagValue, t],
  );

  const actionsSectionLabels = useMemo(
    () => ({
      upcomingDeadlines: t('executive.upcomingDeadlines'),
      criticalEvents: t('executive.criticalEvents'),
      boardActionables: t('executive.boardActionables'),
      nextKeyEvents: t('executive.nextKeyEvents'),
      responsibility: t('executive.action.responsibility'),
      horizon: t('executive.action.horizon'),
      notSpecified: t('executive.notSpecified'),
      notApplicable: t('executive.notApplicable'),
    }),
    [t],
  );

  const upcomingDeadlines = useMemo(
    () =>
      actions.upcomingDeadlines.map(item => ({
        id: item.id,
        title: item.title,
        priorityTag: {
          label: priorityLabels[item.priority as keyof typeof priorityLabels] ?? item.priority,
          color: (item.priority === 'Påkrævet' ? 'red' : 'yellow') as TagColor,
        },
        ownerLabel: item.ownerRole ?? actionsSectionLabels.notSpecified,
        horizonLabel: item.timeHorizon
          ? horizonLabels[item.timeHorizon as keyof typeof horizonLabels] ?? item.timeHorizon
          : actionsSectionLabels.notApplicable,
        horizonTag: item.timeHorizon
          ? {
              label: horizonLabels[item.timeHorizon as keyof typeof horizonLabels] ?? item.timeHorizon,
              color: 'blue' as TagColor,
            }
          : undefined,
        metaLine: `${actionsSectionLabels.responsibility}: ${item.ownerRole ?? actionsSectionLabels.notSpecified} · ${actionsSectionLabels.horizon}: ${
          item.timeHorizon
            ? horizonLabels[item.timeHorizon as keyof typeof horizonLabels] ?? item.timeHorizon
            : actionsSectionLabels.notApplicable
        }`,
      })),
    [actions.upcomingDeadlines, actionsSectionLabels, horizonLabels, priorityLabels],
  );

  const criticalEvents = useMemo(
    () =>
      actions.criticalEvents.map(event => ({
        id: `${event.title}-${event.date}`,
        title: event.title,
        description: event.description,
        priorityTag: {
          label: formatDateValue(event.date),
          color: 'red' as TagColor,
        },
        ownerLabel: '',
        horizonLabel: '',
        dateLabel: formatDateValue(event.date),
      })),
    [actions.criticalEvents, formatDateValue],
  );

  const boardActionables = useMemo(
    () =>
      actions.boardActionables.map(action => ({
        id: action.id,
        title: action.title,
        description: action.description,
        priorityTag: {
          label: priorityLabels[action.priority as keyof typeof priorityLabels] ?? action.priority,
          color: (action.priority === 'Påkrævet' ? 'red' : 'yellow') as TagColor,
        },
        horizonTag: action.timeHorizon
          ? {
              label: horizonLabels[action.timeHorizon as keyof typeof horizonLabels] ?? action.timeHorizon,
              color: 'blue' as TagColor,
            }
          : undefined,
        ownerLabel: action.ownerRole ?? actionsSectionLabels.notSpecified,
        horizonLabel: action.timeHorizon
          ? horizonLabels[action.timeHorizon as keyof typeof horizonLabels] ?? action.timeHorizon
          : actionsSectionLabels.notApplicable,
        metaLine: `${actionsSectionLabels.responsibility}: ${action.ownerRole ?? actionsSectionLabels.notSpecified} · ${actionsSectionLabels.horizon}: ${
          action.timeHorizon
            ? horizonLabels[action.timeHorizon as keyof typeof horizonLabels] ?? action.timeHorizon
            : actionsSectionLabels.notApplicable
        }`,
      })),
    [actions.boardActionables, actionsSectionLabels, horizonLabels, priorityLabels],
  );

  const upcomingEvents = useMemo(
    () =>
      actions.upcomingEvents.map(event => ({
        id: `upcoming-${event.title}-${event.date}`,
        title: event.title,
        dateLabel: formatDateValue(event.date),
        description: undefined,
        priorityTag: {
          label: formatDateValue(event.date),
          color: 'blue' as TagColor,
        },
        ownerLabel: '',
        horizonLabel: '',
        metaLine: formatDateValue(event.date),
      })),
    [actions.upcomingEvents, formatDateValue],
  );

  const activeAlerts: ExecutiveAlertViewModel[] = useMemo(() => {
    const alerts = alertHandler.getActiveAlerts().slice(0, 5);
    return alerts.map(alert => ({
      id: alert.id,
      title: alert.title,
      message: alert.message,
      severity: alert.severity,
      severityLabel: t(`executive.alert.severity.${alert.severity}`),
      severityColor: severityColors[alert.severity],
      categoryLabel: t(`executive.alert.category.${alert.category}`),
      timestampLabel: formatDateValue(alert.createdAt.toISOString()),
    }));
  }, [formatDateValue, t]);

  const handleExport = useCallback(async () => {
    try {
      setIsExporting(true);
      await exportExecutiveSummaryReport({
        subject,
        caseId,
        summary: executiveSummary,
        charts: [
          { ref: grossChartRef, title: t('executive.chart.grossTrend') },
          { ref: profitChartRef, title: t('executive.chart.profitTrend') },
          { ref: riskCardRef, title: t('executive.risk.title') },
        ],
      });
    } catch (error) {
      console.error('Executive export failed', error);
    } finally {
      setIsExporting(false);
    }
  }, [caseId, executiveSummary, subject, t]);

  const onTimeline = useCallback(() => {
    onNavigate?.('timeline');
  }, [onNavigate]);

  const onViewActions = useCallback(() => {
    onNavigate?.('actions');
  }, [onNavigate]);

  return {
    header: {
      eyebrow: t('executive.eyebrow'),
      title: t('executive.title'),
      subtitle: t('executive.subtitle'),
      exportLabel: t('executive.export.primary'),
      exportingLabel: t('executive.export.loading'),
      timelineLabel: t('executive.openTimeline'),
      onTimeline,
      onExport: handleExport,
      isExporting,
    },
    alertsTitle: t('executive.activeAlerts'),
    alerts: activeAlerts,
    financialCard: {
      title: t('executive.card.financial.title'),
      subtitle: t('executive.card.financial.subtitle'),
      tone: financial.alerts.length > 0 ? 'warning' : 'neutral',
      metaTag: financialMetaTag,
      metrics,
      charts: [
        {
          title: t('executive.chart.grossTrend'),
          data: grossProfitTrend,
          lineColor: '#00cc66',
          highlightColor: '#22c55e',
          containerRef: grossChartRef,
          valueFormatter: formatTrendValue,
        },
        {
          title: t('executive.chart.profitTrend'),
          data: netResultTrend,
          lineColor: '#38bdf8',
          highlightColor: '#60a5fa',
          containerRef: profitChartRef,
          valueFormatter: formatTrendValue,
        },
      ],
      alerts: financialAlerts,
      alertsTitle: financial.alerts.length > 0 ? t('executive.criticalObservations') : undefined,
    },
    riskCard: {
      title: t('executive.risk.title'),
      subtitle: t('executive.risk.subtitle'),
      complianceLabel: t('executive.risk.complianceNote'),
      compliance: risk.complianceIssue,
      taxCaseLabel: t('executive.risk.taxCase'),
      taxCaseValue: risk.taxCaseExposure
        ? `${t('executive.risk.exposure')} ${formatCurrencyValue(risk.taxCaseExposure)} – ${t('executive.risk.monitor')}`
        : t('executive.risk.noActiveCase'),
      redFlags: redFlagSummaries,
      riskScores,
      metaTag: { label: t('executive.tag.redFlags'), color: 'red' },
      containerRef: riskCardRef,
    },
    actionsCard: {
      title: t('executive.card.actions.title'),
      subtitle: t('executive.card.actions.subtitle'),
      actionsCtaLabel: t('executive.actions.viewActionables'),
      noDeadlinesLabel: t('executive.noUpcomingDeadlines'),
      onViewActions,
      sectionLabels: actionsSectionLabels,
      sections: {
        upcomingDeadlines,
        criticalEvents,
        boardActionables,
        upcomingEvents,
      },
    },
  };
};
