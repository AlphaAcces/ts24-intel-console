/**
 * useMonitoring Hook
 *
 * React hook for fetching and subscribing to system and network monitoring data.
 */

import { useState, useEffect, useCallback } from 'react';
import type { SystemStatus, NetworkStats } from '../types';
import {
  fetchSystemStatus,
  fetchNetworkStats,
  invalidateMonitoringCache,
} from '../services/monitoringApi';

export interface UseMonitoringOptions {
  /** Auto-refresh interval in milliseconds (0 to disable) */
  refreshInterval?: number;
  /** Whether to fetch system status */
  includeSystem?: boolean;
  /** Whether to fetch network stats */
  includeNetwork?: boolean;
}

export interface UseMonitoringReturn {
  /** System status data */
  systemStatus: SystemStatus | null;
  /** Network statistics data */
  networkStats: NetworkStats | null;
  /** Whether data is currently loading */
  isLoading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Manually trigger a refresh */
  refresh: () => Promise<void>;
  /** Last successful update timestamp */
  lastUpdated: Date | null;
}

const DEFAULT_OPTIONS: UseMonitoringOptions = {
  refreshInterval: 30000, // 30 seconds
  includeSystem: true,
  includeNetwork: true,
};

export function useMonitoring(options?: UseMonitoringOptions): UseMonitoringReturn {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const promises: Promise<void>[] = [];

      if (opts.includeSystem) {
        promises.push(
          fetchSystemStatus().then((data) => {
            setSystemStatus(data);
          })
        );
      }

      if (opts.includeNetwork) {
        promises.push(
          fetchNetworkStats().then((data) => {
            setNetworkStats(data);
          })
        );
      }

      await Promise.all(promises);
      setLastUpdated(new Date());
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch monitoring data';
      setError(message);
      console.error('Monitoring fetch error:', e);
    } finally {
      setIsLoading(false);
    }
  }, [opts.includeSystem, opts.includeNetwork]);

  const refresh = useCallback(async () => {
    invalidateMonitoringCache();
    await fetchData();
  }, [fetchData]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh
  useEffect(() => {
    if (opts.refreshInterval && opts.refreshInterval > 0) {
      const intervalId = setInterval(fetchData, opts.refreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [opts.refreshInterval, fetchData]);

  return {
    systemStatus,
    networkStats,
    isLoading,
    error,
    refresh,
    lastUpdated,
  };
}

export default useMonitoring;
