import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShieldAlert,
  Activity,
  Wifi,
  Bot,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import type { SystemStatus, SystemComponentStatus, NetworkStats } from '../../domains/monitoring';

interface ThreatOverviewCardProps {
  score: number;
  activeAlerts?: number;
  systemStatus?: SystemStatus | null;
  networkStats?: NetworkStats | null;
  aiStats: {
    total: number;
    pending: number;
    failed: number;
    lastTimestamp?: string | null;
  };
}

const STATUS_STYLES: Record<SystemComponentStatus, { text: string; bg: string }> = {
  operational: {
    text: 'text-[var(--color-success)]',
    bg: 'bg-[var(--color-success)]/15',
  },
  degraded: {
    text: 'text-[var(--color-warning)]',
    bg: 'bg-[var(--color-warning)]/15',
  },
  outage: {
    text: 'text-[var(--color-danger)]',
    bg: 'bg-[var(--color-danger)]/15',
  },
  unknown: {
    text: 'text-[var(--color-text-muted)]',
    bg: 'bg-[var(--color-border)]/30',
  },
};

const formatTimestamp = (value?: string | null): string | null => {
  if (!value) return null;
  try {
    const date = new Date(value);
    return new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: undefined,
    }).format(date);
  } catch {
    return null;
  }
};

export const ThreatOverviewCard: React.FC<ThreatOverviewCardProps> = ({
  score,
  activeAlerts = 0,
  systemStatus,
  networkStats,
  aiStats,
}) => {
  const { t } = useTranslation();

  const status = systemStatus?.overall ?? 'unknown';
  const statusStyle = STATUS_STYLES[status];
  const networkUtilisation = networkStats
    ? Math.round((networkStats.bandwidth.current / networkStats.bandwidth.max) * 100)
    : null;
  const lastUpdated = formatTimestamp(systemStatus?.lastUpdated);
  const lastAiRun = formatTimestamp(aiStats.lastTimestamp ?? null);

  return (
    <section className="bg-component-dark border border-border-dark rounded-2xl p-5 shadow-glow-gold/20">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-[var(--color-text-muted)]">
            {t('dashboard.threatOverview.title')}
          </p>
          <div className="flex items-baseline gap-4 mt-2">
            <span className="text-4xl font-semibold text-[var(--color-text)]">{score}</span>
            <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
              <ShieldAlert className="w-4 h-4 text-[var(--color-danger)]" />
              {t('dashboard.threatOverview.alertsLabel', { count: activeAlerts })}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
          <Clock className="w-3.5 h-3.5" />
          {lastUpdated
            ? t('dashboard.threatOverview.updated', { time: lastUpdated })
            : t('dashboard.threatOverview.unknown')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
        {/* System health */}
        <div className="rounded-xl border border-border-dark/60 bg-base-dark/40 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[var(--color-info)]" />
              <p className="text-sm font-medium text-[var(--color-text)]">
                {t('dashboard.threatOverview.systemTitle')}
              </p>
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
              {t(`dashboard.threatOverview.systemStatuses.${status}`)}
            </span>
          </div>
          <p className="text-2xl font-bold text-[var(--color-text)]">{systemStatus?.uptime ? `${systemStatus.uptime.toFixed(2)}%` : '—'}</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            {t('dashboard.threatOverview.systemSubtitle', { count: systemStatus?.activeAlerts ?? 0 })}
          </p>
        </div>

        {/* Network load */}
        <div className="rounded-xl border border-border-dark/60 bg-base-dark/40 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-[var(--color-warning)]" />
              <p className="text-sm font-medium text-[var(--color-text)]">
                {t('dashboard.threatOverview.networkTitle')}
              </p>
            </div>
            <span className="text-xs text-[var(--color-text-muted)]">
              {networkStats?.bandwidth.unit ?? 'Mbps'}
            </span>
          </div>
          {networkUtilisation !== null ? (
            <>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-[var(--color-text)]">{networkStats?.bandwidth.current}</p>
                <span className="text-sm text-[var(--color-text-muted)]">/ {networkStats?.bandwidth.max}</span>
              </div>
              <div className="mt-3">
                <div className="h-2 rounded-full bg-base-dark">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[var(--color-warning)] to-[var(--color-danger)] transition-all"
                    style={{ width: `${networkUtilisation}%` }}
                  />
                </div>
                <p className="text-xs text-[var(--color-text-muted)] mt-2">
                  {t('dashboard.threatOverview.networkSubtitle', { value: networkStats?.latency.avg ?? '—' })}
                </p>
              </div>
            </>
          ) : (
            <p className="text-sm text-[var(--color-text-muted)] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[var(--color-warning)]" />
              {t('dashboard.threatOverview.unknown')}
            </p>
          )}
        </div>

        {/* AI log */}
        <div className="rounded-xl border border-border-dark/60 bg-base-dark/40 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-[var(--color-accent)]" />
              <p className="text-sm font-medium text-[var(--color-text)]">
                {t('dashboard.threatOverview.aiTitle')}
              </p>
            </div>
            <span className="text-xs text-[var(--color-text-muted)]">
              {aiStats.total}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">{t('dashboard.threatOverview.aiPending')}</p>
              <p className="text-lg font-semibold text-[var(--color-text)]">{aiStats.pending}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">{t('dashboard.threatOverview.aiFailed')}</p>
              <p className="text-lg font-semibold text-[var(--color-text)]">{aiStats.failed}</p>
            </div>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-3">
            {lastAiRun
              ? t('dashboard.threatOverview.aiUpdated', { time: lastAiRun })
              : t('dashboard.threatOverview.aiEmpty')}
          </p>
        </div>
      </div>
    </section>
  );
};

export default ThreatOverviewCard;
