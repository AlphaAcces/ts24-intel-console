/**
 * System Status Card Component
 *
 * Displays real-time system health status with component breakdown.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Server,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Database,
  Shield,
  Cpu,
  HardDrive,
  Wifi,
  Loader2,
} from 'lucide-react';
import type { SystemStatus, SystemComponentStatus } from '../../domains/monitoring';

interface SystemStatusCardProps {
  status: SystemStatus | null;
  isLoading?: boolean;
  onRefresh?: () => void;
}

const statusConfig: Record<
  SystemComponentStatus,
  { color: string; bgColor: string; icon: React.ReactNode; label: string }
> = {
  operational: {
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    icon: <CheckCircle2 className="w-4 h-4" />,
    label: 'Operationel',
  },
  degraded: {
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    icon: <AlertTriangle className="w-4 h-4" />,
    label: 'Forringet',
  },
  outage: {
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    icon: <XCircle className="w-4 h-4" />,
    label: 'Udfald',
  },
  unknown: {
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/20',
    icon: <Loader2 className="w-4 h-4" />,
    label: 'Ukendt',
  },
};

const componentIcons: Record<string, React.ReactNode> = {
  database: <Database className="w-4 h-4" />,
  'api-gateway': <Wifi className="w-4 h-4" />,
  'ai-engine': <Cpu className="w-4 h-4" />,
  firewall: <Shield className="w-4 h-4" />,
  cache: <Server className="w-4 h-4" />,
  storage: <HardDrive className="w-4 h-4" />,
};

export const SystemStatusCard: React.FC<SystemStatusCardProps> = ({
  status,
  isLoading,
  onRefresh,
}) => {
  const { t } = useTranslation();

  if (isLoading && !status) {
    return (
      <div className="bg-component-dark p-4 rounded-lg border border-border-dark">
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  const overallConfig = status ? statusConfig[status.overall] : statusConfig.unknown;

  return (
    <div className="bg-component-dark p-4 rounded-lg border border-border-dark">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-gray-400" />
          <h3 className="text-md font-semibold text-gray-200">{t('monitoring.system.title')}</h3>
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

      {/* Overall Status */}
      <div className={`flex items-center gap-2 p-3 rounded-lg mb-4 ${overallConfig.bgColor}`}>
        <span className={overallConfig.color}>{overallConfig.icon}</span>
        <div>
          <span className={`text-sm font-medium ${overallConfig.color}`}>
            {overallConfig.label}
          </span>
          {status && (
            <p className="text-xs text-gray-500">
              {t('monitoring.system.uptime', { value: status.uptime.toFixed(2) })}
            </p>
          )}
        </div>
        {status && status.activeAlerts > 0 && (
          <span className="ml-auto text-xs bg-red-500/30 text-red-400 px-2 py-0.5 rounded-full">
            {status.activeAlerts} {t('monitoring.system.alerts')}
          </span>
        )}
      </div>

      {/* Component List */}
      {status && (
        <div className="space-y-2">
          {status.components.map((component) => {
            const config = statusConfig[component.status];
            return (
              <div
                key={component.id}
                className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-surface-hover/30"
              >
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">
                    {componentIcons[component.id] || <Server className="w-4 h-4" />}
                  </span>
                  <span className="text-sm text-gray-300">{component.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {component.latency && (
                    <span className="text-xs text-gray-500">{component.latency}ms</span>
                  )}
                  <span className={config.color}>{config.icon}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SystemStatusCard;
