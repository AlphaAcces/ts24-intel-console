import React, { Suspense, lazy } from 'react';
import { Activity, TrendingDown, TrendingUp, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { ExecutiveCard } from './ExecutiveCard';
import { Tag } from '../Shared/Tag';
import type { FinancialCardViewModel } from '../../domains/executive/types';

const ExecutiveTrendChart = lazy(() =>
  import('./ExecutiveTrendChart').then(module => ({ default: module.ExecutiveTrendChart }))
);

const ChartSkeleton: React.FC = () => (
  <div className="h-full w-full rounded bg-gray-900/30 animate-pulse" />
);

interface FinancialOverviewCardProps {
  data: FinancialCardViewModel;
}

export const FinancialOverviewCard: React.FC<FinancialOverviewCardProps> = ({ data }) => (
  <ExecutiveCard
    icon={<Activity className="w-5 h-5" />}
    title={data.title}
    subtitle={data.subtitle}
    tone={data.tone}
    meta={data.metaTag ? <Tag label={data.metaTag.label} color={data.metaTag.color} /> : undefined}
    delay={0}
  >
    <div className="space-y-4">
      {data.metrics.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.metrics.map(metric => (
            <div key={metric.label} className="bg-gray-900/40 border border-border-dark/50 rounded-lg p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-gray-500">{metric.label}</p>
              <p className="text-2xl font-semibold text-gray-100 mt-1">{metric.value}</p>
              {metric.delta && (
                <span
                  className={`inline-flex items-center text-xs font-medium mt-2 ${
                    metric.delta.tone === 'positive' ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {metric.delta.direction === 'up' ? (
                    <TrendingUp className="w-4 h-4 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1" />
                  )}
                  {metric.delta.label}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {data.charts.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {data.charts.map(chart => (
            <div
              key={chart.title}
              ref={chart.containerRef}
              className="h-32 bg-gray-900/40 border border-border-dark/50 rounded-lg p-3"
            >
              <p className="text-xs text-gray-500 uppercase tracking-[0.18em] mb-2">{chart.title}</p>
              <Suspense fallback={<ChartSkeleton />}>
                <ExecutiveTrendChart
                  data={chart.data}
                  lineColor={chart.lineColor}
                  highlightColor={chart.highlightColor}
                  valueFormatter={chart.valueFormatter}
                />
              </Suspense>
            </div>
          ))}
        </div>
      )}

      {data.alerts.length > 0 && (
        <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4 text-xs text-red-100">
          {data.alertsTitle && (
            <div className="flex items-center gap-2 font-semibold text-red-200 mb-2">
              <AlertTriangle className="w-4 h-4" />
              {data.alertsTitle}
            </div>
          )}
          <ul className="space-y-2">
            {data.alerts.map(alert => (
              <li key={alert.id} className="flex items-start gap-2 leading-relaxed text-red-100">
                <ArrowUpRight className="w-3 h-3 mt-0.5" />
                <span>
                  {alert.label}: {alert.value}
                  {alert.description ? ` – ${alert.description}` : ''}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  </ExecutiveCard>
);
