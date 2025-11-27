import React from 'react';
import type { View } from '../../types';
import { useExecutiveSummaryController } from '../../domains/executive/hooks';
import { ExecutiveSummaryHeader } from './ExecutiveSummaryHeader';
import { ExecutiveActiveAlertsPanel } from './ExecutiveActiveAlertsPanel';
import { FinancialOverviewCard } from './FinancialOverviewCard';
import { RiskOverviewCard } from './RiskOverviewCard';
import { ActionsTimelineCard } from './ActionsTimelineCard';

interface ExecutiveSummaryViewProps {
  onNavigate?: (view: View) => void;
}

export const ExecutiveSummaryView: React.FC<ExecutiveSummaryViewProps> = ({ onNavigate }) => {
  const controller = useExecutiveSummaryController(onNavigate);

  return (
    <div className="space-y-8">
      <ExecutiveSummaryHeader {...controller.header} />
      <ExecutiveActiveAlertsPanel title={controller.alertsTitle} alerts={controller.alerts} />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <FinancialOverviewCard data={controller.financialCard} />
        <RiskOverviewCard data={controller.riskCard} />
        <ActionsTimelineCard data={controller.actionsCard} />
      </div>
    </div>
  );
};
