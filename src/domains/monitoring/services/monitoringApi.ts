/**
 * Monitoring API Service
 *
 * Connects to real API endpoints for system status and network statistics.
 * Falls back to simulated data in development or when API is unavailable.
 */

import type {
  SystemStatus,
  SystemComponent,
  SystemComponentStatus,
  NetworkStats,
  NetworkStat,
} from '../types';

// ============================================================================
// Configuration
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
// Default to real API calls unless VITE_USE_MOCK_MONITORING=true is provided for offline previews.
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_MONITORING === 'true';

// ============================================================================
// Mock Data Generators (Fallback)
// ============================================================================

function randomStatus(): SystemComponentStatus {
  const rand = Math.random();
  if (rand > 0.95) return 'outage';
  if (rand > 0.85) return 'degraded';
  return 'operational';
}

function randomLatency(base: number, variance: number): number {
  return Math.round(base + (Math.random() - 0.5) * variance);
}

function generateSystemComponents(): SystemComponent[] {
  const components: SystemComponent[] = [
    {
      id: 'database',
      name: 'Database',
      status: randomStatus(),
      latency: randomLatency(25, 20),
      lastCheck: new Date().toISOString(),
    },
    {
      id: 'api-gateway',
      name: 'API Gateway',
      status: randomStatus(),
      latency: randomLatency(15, 10),
      lastCheck: new Date().toISOString(),
    },
    {
      id: 'ai-engine',
      name: 'AI Engine',
      status: randomStatus(),
      latency: randomLatency(150, 100),
      lastCheck: new Date().toISOString(),
    },
    {
      id: 'firewall',
      name: 'Firewall',
      status: 'operational', // Always operational for security
      latency: randomLatency(5, 3),
      lastCheck: new Date().toISOString(),
    },
    {
      id: 'cache',
      name: 'Cache Layer',
      status: randomStatus(),
      latency: randomLatency(3, 2),
      lastCheck: new Date().toISOString(),
    },
    {
      id: 'storage',
      name: 'Object Storage',
      status: randomStatus(),
      latency: randomLatency(50, 30),
      lastCheck: new Date().toISOString(),
    },
  ];

  // Add messages for non-operational components
  return components.map((c) => ({
    ...c,
    message:
      c.status === 'degraded'
        ? 'Oplever forhøjet latens'
        : c.status === 'outage'
          ? 'Tjeneste utilgængelig'
          : undefined,
  }));
}

function calculateOverallStatus(components: SystemComponent[]): SystemComponentStatus {
  const hasOutage = components.some((c) => c.status === 'outage');
  const hasDegraded = components.some((c) => c.status === 'degraded');

  if (hasOutage) return 'outage';
  if (hasDegraded) return 'degraded';
  return 'operational';
}

function generateNetworkStats(): NetworkStat[] {
  return [
    {
      id: 'api-calls',
      label: 'API Kald',
      value: Math.round(1200 + Math.random() * 500),
      unit: '/min',
      trend: Math.random() > 0.5 ? 'up' : 'stable',
      change: Math.round((Math.random() - 0.3) * 20),
    },
    {
      id: 'data-transfer',
      label: 'Data Overført',
      value: Math.round(45 + Math.random() * 30),
      unit: 'MB/s',
      trend: 'stable',
    },
    {
      id: 'cache-hit',
      label: 'Cache Hit Rate',
      value: Math.round(92 + Math.random() * 6),
      unit: '%',
      trend: 'up',
      change: 2,
    },
    {
      id: 'active-users',
      label: 'Aktive Brugere',
      value: Math.round(25 + Math.random() * 15),
      unit: '',
      trend: Math.random() > 0.5 ? 'up' : 'down',
      change: Math.round((Math.random() - 0.5) * 10),
    },
  ];
}

// ============================================================================
// API Functions
// ============================================================================

let cachedSystemStatus: SystemStatus | null = null;
let cachedNetworkStats: NetworkStats | null = null;
let lastSystemUpdate = 0;
let lastNetworkUpdate = 0;

const CACHE_TTL = 5000; // 5 seconds

/**
 * Fetch system status from API with fallback to mock data
 */
export async function fetchSystemStatus(): Promise<SystemStatus> {
  const now = Date.now();

  // Use cached data if still valid
  if (cachedSystemStatus && now - lastSystemUpdate < CACHE_TTL) {
    return cachedSystemStatus;
  }

  // Try real API first (unless explicitly using mock)
  if (!USE_MOCK_DATA) {
    try {
      const response = await fetch(`${API_BASE_URL}/system-status`, {
        headers: { 'Accept': 'application/json' },
      });
      if (response.ok) {
        cachedSystemStatus = await response.json();
        lastSystemUpdate = now;
        return cachedSystemStatus!;
      }
    } catch {
      // Fall through to mock data
    }
  }

  // Fallback: generate mock data
  await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 200));

  const components = generateSystemComponents();
  const overall = calculateOverallStatus(components);
  const activeAlerts = components.filter(
    (c) => c.status === 'degraded' || c.status === 'outage'
  ).length;

  cachedSystemStatus = {
    overall,
    components,
    lastUpdated: new Date().toISOString(),
    uptime: 99.5 + Math.random() * 0.49, // 99.5% - 99.99%
    activeAlerts,
  };

  lastSystemUpdate = now;
  return cachedSystemStatus;
}

/**
 * Fetch network stats from API with fallback to mock data
 */
export async function fetchNetworkStats(): Promise<NetworkStats> {
  const now = Date.now();

  // Use cached data if still valid
  if (cachedNetworkStats && now - lastNetworkUpdate < CACHE_TTL) {
    return cachedNetworkStats;
  }

  // Try real API first (unless explicitly using mock)
  if (!USE_MOCK_DATA) {
    try {
      const response = await fetch(`${API_BASE_URL}/network-stats`, {
        headers: { 'Accept': 'application/json' },
      });
      if (response.ok) {
        cachedNetworkStats = await response.json();
        lastNetworkUpdate = now;
        return cachedNetworkStats!;
      }
    } catch {
      // Fall through to mock data
    }
  }

  // Fallback: generate mock data
  await new Promise((resolve) => setTimeout(resolve, 80 + Math.random() * 150));

  const bandwidthCurrent = Math.round(65 + Math.random() * 25);

  cachedNetworkStats = {
    bandwidth: {
      current: bandwidthCurrent,
      max: 100,
      unit: 'Mbps',
    },
    activeConnections: Math.round(150 + Math.random() * 100),
    requestsPerMinute: Math.round(1200 + Math.random() * 500),
    errorRate: Math.round((0.1 + Math.random() * 0.5) * 100) / 100,
    latency: {
      avg: randomLatency(45, 20),
      p95: randomLatency(120, 40),
      p99: randomLatency(250, 80),
    },
    stats: generateNetworkStats(),
    lastUpdated: new Date().toISOString(),
  };

  lastNetworkUpdate = now;
  return cachedNetworkStats;
}

// Force refresh (bypass cache)
export function invalidateMonitoringCache(): void {
  cachedSystemStatus = null;
  cachedNetworkStats = null;
  lastSystemUpdate = 0;
  lastNetworkUpdate = 0;
}
