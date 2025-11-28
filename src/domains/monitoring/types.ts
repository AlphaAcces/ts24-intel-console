/**
 * System Status Types
 *
 * Types for system status monitoring, health checks, and alerts.
 */

export type SystemComponentStatus = 'operational' | 'degraded' | 'outage' | 'unknown';

export interface SystemComponent {
  id: string;
  name: string;
  status: SystemComponentStatus;
  latency?: number; // ms
  lastCheck: string;
  message?: string;
}

export interface SystemStatus {
  overall: SystemComponentStatus;
  components: SystemComponent[];
  lastUpdated: string;
  uptime: number; // percentage
  activeAlerts: number;
}

export interface NetworkStat {
  id: string;
  label: string;
  value: number;
  unit: string;
  trend?: 'up' | 'down' | 'stable';
  change?: number; // percentage
}

export interface NetworkStats {
  bandwidth: {
    current: number;
    max: number;
    unit: string;
  };
  activeConnections: number;
  requestsPerMinute: number;
  errorRate: number;
  latency: {
    avg: number;
    p95: number;
    p99: number;
  };
  stats: NetworkStat[];
  lastUpdated: string;
}

export interface DashboardMetrics {
  system: SystemStatus;
  network: NetworkStats;
}
