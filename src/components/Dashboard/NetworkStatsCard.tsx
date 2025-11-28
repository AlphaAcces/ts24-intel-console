/**
 * Network Stats Card Component
 *
 * Displays real-time network statistics with bandwidth visualization.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Activity,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  Zap,
  Users,
  AlertCircle,
} from 'lucide-react';
import type { NetworkStats } from '../../domains/monitoring';

interface NetworkStatsCardProps {
  stats: NetworkStats | null;
  isLoading?: boolean;
  onRefresh?: () => void;
}

const TrendIcon: React.FC<{ trend?: 'up' | 'down' | 'stable' }> = ({ trend }) => {
  switch (trend) {
    case 'up':
      return <TrendingUp className="w-3 h-3 text-green-400" />;
    case 'down':
      return <TrendingDown className="w-3 h-3 text-red-400" />;
    default:
      return <Minus className="w-3 h-3 text-gray-500" />;
  }
};

export const NetworkStatsCard: React.FC<NetworkStatsCardProps> = ({
  stats,
  isLoading,
  onRefresh,
}) => {
  const { t } = useTranslation();

  if (isLoading && !stats) {
    return (
      <div className="bg-component-dark p-4 rounded-lg border border-border-dark">
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  const bandwidthPercent = stats
    ? Math.round((stats.bandwidth.current / stats.bandwidth.max) * 100)
    : 0;

  const bandwidthColor =
    bandwidthPercent > 90
      ? 'bg-red-500'
      : bandwidthPercent > 70
        ? 'bg-yellow-500'
        : 'bg-green-500';

  return (
    <div className="bg-component-dark p-4 rounded-lg border border-border-dark">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-gray-400" />
          <h3 className="text-md font-semibold text-gray-200">{t('monitoring.network.title')}</h3>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-1.5 rounded hover:bg-surface-hover transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {stats && (
        <>
          {/* Bandwidth Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">{t('monitoring.network.bandwidth')}</span>
              <span className="text-xs text-gray-400">
                {stats.bandwidth.current} / {stats.bandwidth.max} {stats.bandwidth.unit}
              </span>
            </div>
            <div className="h-2 bg-base-dark rounded-full overflow-hidden">
              <div
                className={`h-full ${bandwidthColor} transition-all duration-500`}
                style={{ width: `${bandwidthPercent}%` }}
              />
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-base-dark/50 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs text-gray-500">{t('monitoring.network.connections')}</span>
              </div>
              <span className="text-lg font-bold text-gray-200">
                {stats.activeConnections}
              </span>
            </div>
            <div className="bg-base-dark/50 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-xs text-gray-500">{t('monitoring.network.requests')}</span>
              </div>
              <span className="text-lg font-bold text-gray-200">
                {stats.requestsPerMinute}
                <span className="text-xs text-gray-500 font-normal">/min</span>
              </span>
            </div>
            <div className="bg-base-dark/50 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Activity className="w-3.5 h-3.5 text-green-400" />
                <span className="text-xs text-gray-500">{t('monitoring.network.latency')}</span>
              </div>
              <span className="text-lg font-bold text-gray-200">
                {stats.latency.avg}
                <span className="text-xs text-gray-500 font-normal">ms</span>
              </span>
            </div>
            <div className="bg-base-dark/50 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                <span className="text-xs text-gray-500">{t('monitoring.network.errorRate')}</span>
              </div>
              <span className="text-lg font-bold text-gray-200">
                {stats.errorRate}
                <span className="text-xs text-gray-500 font-normal">%</span>
              </span>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="space-y-2">
            {stats.stats.map((stat) => (
              <div
                key={stat.id}
                className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-surface-hover/30"
              >
                <span className="text-sm text-gray-400">{stat.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-200">
                    {stat.value}
                    {stat.unit && <span className="text-gray-500 ml-0.5">{stat.unit}</span>}
                  </span>
                  <TrendIcon trend={stat.trend} />
                  {stat.change !== undefined && stat.change !== 0 && (
                    <span
                      className={`text-xs ${stat.change > 0 ? 'text-green-400' : 'text-red-400'}`}
                    >
                      {stat.change > 0 ? '+' : ''}
                      {stat.change}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default NetworkStatsCard;
