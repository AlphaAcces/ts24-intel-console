/**
 * Tenant API Service
 *
 * Provides API endpoints for tenant configuration, switching, and management.
 * Supports dynamic loading of tenant data and multi-tenant user scenarios.
 */

import type {
  TenantConfig,
  TenantUser,
  TenantId,
  TenantBranding,
  TenantFeatures,
  TenantSettings,
  TenantAuditEntry,
} from './types';

// ============================================================================
// API Configuration
// ============================================================================

/** Base URL for tenant API endpoints (configurable via env) */
export const TENANT_API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const TENANT_STORAGE_KEY = 'tsl_current_tenant';

// ============================================================================
// Types
// ============================================================================

export interface TenantApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface TenantListItem {
  id: TenantId;
  name: string;
  slug: string;
  role: string;
  logoUrl?: string;
}

export interface TenantSwitchResult {
  tenant: TenantConfig;
  user: TenantUser;
  token?: string;
}

export interface AccessRequestSubmissionPayload {
  name: string;
  email: string;
  organization?: string;
  role?: string;
  justification: string;
  tenantId?: TenantId;
  locale?: string;
}

export interface AccessRequestSubmissionResult {
  requestId: string;
}

// ============================================================================
// Mock Data (Development)
// ============================================================================

const MOCK_TENANTS: TenantConfig[] = [
  {
    id: 'tenant-001',
    name: 'TSL Intelligence',
    slug: 'tsl-intelligence',
    status: 'active',
    tier: 'enterprise',
    createdAt: '2024-01-01T00:00:00Z',
    settings: {
      defaultLanguage: 'da',
      defaultCurrency: 'DKK',
      timezone: 'Europe/Copenhagen',
      dateFormat: 'DD-MM-YYYY',
      allowExternalIntegrations: true,
      dataRetentionDays: 365,
      requireMfa: false,
      sessionTimeoutMinutes: 480,
    },
    branding: {
      companyName: 'TSL Intelligence',
      logoUrl: '/assets/logo/tsl-logo.svg',
      colors: {
        primary: '#1E3A5F',
        primaryHover: '#2A4A73',
        secondary: '#B87333',
        accent: '#E3B23C',
        accentHover: '#CCA030',
        accentMuted: '#B8942E',
        danger: '#F87171',
        dangerSoft: 'rgba(248, 113, 113, 0.2)',
        warning: '#F59E0B',
        warningSoft: 'rgba(245, 158, 11, 0.18)',
        success: '#34D399',
        successSoft: 'rgba(52, 211, 153, 0.18)',
        info: '#4F8CC9',
        infoSoft: 'rgba(79, 140, 201, 0.24)',
        background: '#0C0E1A',
        backgroundDark: '#080A12',
        surface: '#141824',
        surfaceHover: '#1C2230',
        surfaceElevated: '#1F2535',
        border: '#2A2E3D',
        borderStrong: '#383D4F',
        borderSubtle: 'rgba(255, 255, 255, 0.08)',
        text: '#E8E6E3',
        textMuted: '#9CA3AF',
        textGold: '#E3B23C',
        copper: '#B87333',
        copperHover: '#A66429',
        copperMuted: 'rgba(184, 115, 51, 0.4)',
        gold: '#E3B23C',
        goldHover: '#CCA030',
        goldMuted: '#B8942E',
        deepBlue: '#1E3A5F',
        deepBlueLight: '#2A4A73',
        overlay: 'rgba(8, 10, 18, 0.9)',
        shadow: '0 0 20px rgba(227, 178, 60, 0.15)',
        shadowStrong: '0 0 30px rgba(227, 178, 60, 0.25)',
      },
      supportEmail: 'support@tsl-intelligence.com',
    },
    features: {
      enabledModules: [
        'dashboard', 'executive', 'person', 'companies', 'financials',
        'risk', 'timeline', 'actions', 'hypotheses', 'scenarios',
        'cashflow', 'sector', 'counterparties', 'network', 'settings', 'ai',
      ],
      aiAssistant: true,
      pdfExport: true,
      apiAccess: true,
      advancedAnalytics: true,
      customReports: true,
      bulkOperations: true,
      auditLog: true,
      ssoIntegration: true,
      webhooks: true,
      dataImport: true,
      dataExport: true,
      multiLanguage: true,
      darkMode: true,
    },
    limits: {
      maxUsers: 100,
      maxCases: 1000,
      maxStorageMb: 50000,
      maxApiRequestsPerDay: 100000,
      maxExportsPerMonth: 500,
    },
  },
  {
    id: 'tenant-002',
    name: 'Acme Corporation',
    slug: 'acme-corp',
    status: 'active',
    tier: 'professional',
    createdAt: '2024-03-15T00:00:00Z',
    settings: {
      defaultLanguage: 'en',
      defaultCurrency: 'USD',
      timezone: 'America/New_York',
      dateFormat: 'MM/DD/YYYY',
      allowExternalIntegrations: false,
      dataRetentionDays: 180,
      requireMfa: true,
      sessionTimeoutMinutes: 240,
    },
    branding: {
      companyName: 'Acme Corporation',
      logoUrl: '/assets/logo/acme-logo.svg',
      colors: {
        primary: '#3b82f6',
        primaryHover: '#2563eb',
        secondary: '#64748b',
        accent: '#8b5cf6',
        danger: '#ef4444',
        warning: '#f59e0b',
        success: '#22c55e',
        info: '#06b6d4',
        background: '#0f172a',
        backgroundDark: '#020617',
        surface: '#1e293b',
        surfaceHover: '#334155',
        border: '#334155',
        text: '#f1f5f9',
        textMuted: '#94a3b8',
      },
      supportEmail: 'support@acme.com',
    },
    features: {
      enabledModules: [
        'dashboard', 'executive', 'person', 'companies', 'financials',
        'risk', 'timeline', 'actions', 'settings',
      ],
      aiAssistant: true,
      pdfExport: true,
      apiAccess: false,
      advancedAnalytics: true,
      customReports: false,
      bulkOperations: false,
      auditLog: true,
      ssoIntegration: false,
      webhooks: false,
      dataImport: true,
      dataExport: true,
      multiLanguage: true,
      darkMode: true,
    },
    limits: {
      maxUsers: 25,
      maxCases: 250,
      maxStorageMb: 10000,
      maxApiRequestsPerDay: 10000,
      maxExportsPerMonth: 100,
    },
  },
  {
    id: 'tenant-003',
    name: 'Nordic Finance Group',
    slug: 'nordic-finance',
    status: 'trial',
    tier: 'basic',
    createdAt: '2024-11-01T00:00:00Z',
    expiresAt: '2024-12-01T00:00:00Z',
    settings: {
      defaultLanguage: 'da',
      defaultCurrency: 'DKK',
      timezone: 'Europe/Copenhagen',
      dateFormat: 'DD-MM-YYYY',
      allowExternalIntegrations: false,
      dataRetentionDays: 90,
      requireMfa: false,
      sessionTimeoutMinutes: 120,
    },
    branding: {
      companyName: 'Nordic Finance Group',
      colors: {
        primary: '#059669',
        primaryHover: '#047857',
        secondary: '#6b7280',
        accent: '#7c3aed',
        danger: '#dc2626',
        warning: '#d97706',
        success: '#16a34a',
        info: '#0891b2',
        background: '#111827',
        backgroundDark: '#030712',
        surface: '#1f2937',
        surfaceHover: '#374151',
        border: '#374151',
        text: '#f3f4f6',
        textMuted: '#9ca3af',
      },
      supportEmail: 'support@nordicfinance.dk',
    },
    features: {
      enabledModules: [
        'dashboard', 'person', 'companies', 'financials', 'risk', 'settings',
      ],
      aiAssistant: false,
      pdfExport: true,
      apiAccess: false,
      advancedAnalytics: false,
      customReports: false,
      bulkOperations: false,
      auditLog: false,
      ssoIntegration: false,
      webhooks: false,
      dataImport: true,
      dataExport: true,
      multiLanguage: true,
      darkMode: true,
    },
    limits: {
      maxUsers: 5,
      maxCases: 50,
      maxStorageMb: 1000,
      maxApiRequestsPerDay: 1000,
      maxExportsPerMonth: 20,
    },
  },
];

const MOCK_USERS: Record<TenantId, TenantUser> = {
  'tenant-001': {
    id: 'user-001',
    tenantId: 'tenant-001',
    email: 'admin@tsl-intelligence.com',
    name: 'TSL Admin',
    role: 'owner',
    permissions: [],
    isActive: true,
    lastLoginAt: new Date().toISOString(),
    createdAt: '2024-01-01T00:00:00Z',
    mfaEnabled: false,
  },
  'tenant-002': {
    id: 'user-001',
    tenantId: 'tenant-002',
    email: 'admin@acme.com',
    name: 'John Doe',
    role: 'admin',
    permissions: [],
    isActive: true,
    lastLoginAt: new Date().toISOString(),
    createdAt: '2024-03-15T00:00:00Z',
    mfaEnabled: true,
  },
  'tenant-003': {
    id: 'user-001',
    tenantId: 'tenant-003',
    email: 'trial@nordicfinance.dk',
    name: 'Trial User',
    role: 'analyst',
    permissions: [],
    isActive: true,
    lastLoginAt: new Date().toISOString(),
    createdAt: '2024-11-01T00:00:00Z',
    mfaEnabled: false,
  },
};

// ============================================================================
// API Helper Functions
// ============================================================================

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const createResponse = <T>(data: T): TenantApiResponse<T> => ({
  success: true,
  data,
  timestamp: new Date().toISOString(),
});

const createErrorResponse = <T>(error: string): TenantApiResponse<T> => ({
  success: false,
  error,
  timestamp: new Date().toISOString(),
});

// ============================================================================
// Tenant API Service
// ============================================================================

export const tenantApi = {
  /**
   * Get list of tenants available to the current user
   */
  async getUserTenants(): Promise<TenantApiResponse<TenantListItem[]>> {
    await delay(150); // Simulate network latency

    // In production, this would call: GET /api/user/tenants
    const tenantList: TenantListItem[] = MOCK_TENANTS.map(t => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      role: MOCK_USERS[t.id]?.role || 'viewer',
      logoUrl: t.branding.logoUrl,
    }));

    return createResponse(tenantList);
  },

  /**
   * Get full tenant configuration by ID
   */
  async getTenantConfig(tenantId: TenantId): Promise<TenantApiResponse<TenantConfig>> {
    await delay(100);

    // In production: GET /api/tenants/:tenantId
    const tenant = MOCK_TENANTS.find(t => t.id === tenantId);

    if (!tenant) {
      return createErrorResponse('Tenant not found');
    }

    return createResponse(tenant);
  },

  /**
   * Get tenant user for current session
   */
  async getTenantUser(tenantId: TenantId): Promise<TenantApiResponse<TenantUser>> {
    await delay(50);

    // In production: GET /api/tenants/:tenantId/user
    const user = MOCK_USERS[tenantId];

    if (!user) {
      return createErrorResponse('User not found for tenant');
    }

    return createResponse(user);
  },

  /**
   * Submit a pre-auth access request from the login screen
   */
  async submitAccessRequest(
    payload: AccessRequestSubmissionPayload
  ): Promise<TenantApiResponse<AccessRequestSubmissionResult>> {
    try {
      const response = await fetch(`${TENANT_API_BASE_URL}/access-requests/public`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const message = errorBody?.message || `HTTP ${response.status}`;
        return createErrorResponse(message);
      }

      const data = await response.json();
      return createResponse({ requestId: data.requestId as string });
    } catch (err) {
      return createErrorResponse(
        err instanceof Error ? err.message : 'Failed to submit access request'
      );
    }
  },

  /**
   * Switch to a different tenant
   */
  async switchTenant(tenantId: TenantId): Promise<TenantApiResponse<TenantSwitchResult>> {
    await delay(200);

    // In production: POST /api/tenants/:tenantId/switch
    const tenant = MOCK_TENANTS.find(t => t.id === tenantId);
    const user = MOCK_USERS[tenantId];

    if (!tenant || !user) {
      return createErrorResponse('Unable to switch tenant');
    }

    // Persist selection
    localStorage.setItem(TENANT_STORAGE_KEY, tenantId);

    return createResponse({
      tenant,
      user,
      token: `mock-jwt-token-${tenantId}`,
    });
  },

  /**
   * Update tenant branding
   */
  async updateBranding(
    tenantId: TenantId,
    branding: Partial<TenantBranding>
  ): Promise<TenantApiResponse<TenantBranding>> {
    await delay(150);

    // In production: PATCH /api/tenants/:tenantId/branding
    const tenant = MOCK_TENANTS.find(t => t.id === tenantId);

    if (!tenant) {
      return createErrorResponse('Tenant not found');
    }

    const updatedBranding = { ...tenant.branding, ...branding };
    tenant.branding = updatedBranding;

    return createResponse(updatedBranding);
  },

  /**
   * Update tenant features
   */
  async updateFeatures(
    tenantId: TenantId,
    features: Partial<TenantFeatures>
  ): Promise<TenantApiResponse<TenantFeatures>> {
    await delay(150);

    // In production: PATCH /api/tenants/:tenantId/features
    const tenant = MOCK_TENANTS.find(t => t.id === tenantId);

    if (!tenant) {
      return createErrorResponse('Tenant not found');
    }

    const updatedFeatures = { ...tenant.features, ...features };
    tenant.features = updatedFeatures;

    return createResponse(updatedFeatures);
  },

  /**
   * Update tenant settings
   */
  async updateSettings(
    tenantId: TenantId,
    settings: Partial<TenantSettings>
  ): Promise<TenantApiResponse<TenantSettings>> {
    await delay(150);

    // In production: PATCH /api/tenants/:tenantId/settings
    const tenant = MOCK_TENANTS.find(t => t.id === tenantId);

    if (!tenant) {
      return createErrorResponse('Tenant not found');
    }

    const updatedSettings = { ...tenant.settings, ...settings };
    tenant.settings = updatedSettings;

    return createResponse(updatedSettings);
  },

  /**
   * Get audit log for tenant
   */
  async getAuditLog(
    tenantId: TenantId,
    options?: { limit?: number; offset?: number }
  ): Promise<TenantApiResponse<TenantAuditEntry[]>> {
    await delay(100);

    // In production: GET /api/tenants/:tenantId/audit
    // This would return actual audit entries from the backend
    const mockAuditEntries: TenantAuditEntry[] = [
      {
        id: 'audit-001',
        tenantId,
        userId: 'user-001',
        action: 'LOGIN',
        resource: 'session',
        timestamp: new Date().toISOString(),
      },
      {
        id: 'audit-002',
        tenantId,
        userId: 'user-001',
        action: 'VIEW',
        resource: 'dashboard',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
    ];

    const limit = options?.limit || 50;
    const offset = options?.offset || 0;

    return createResponse(mockAuditEntries.slice(offset, offset + limit));
  },

  /**
   * Get current tenant from storage
   */
  getCurrentTenantId(): TenantId | null {
    return localStorage.getItem(TENANT_STORAGE_KEY);
  },

  /**
   * Clear current tenant selection
   */
  clearCurrentTenant(): void {
    localStorage.removeItem(TENANT_STORAGE_KEY);
  },

  /**
   * Initialize tenant context on app load
   */
  async initializeTenant(): Promise<TenantApiResponse<TenantSwitchResult | null>> {
    const savedTenantId = this.getCurrentTenantId();

    if (savedTenantId) {
      return this.switchTenant(savedTenantId);
    }

    // Return first available tenant as default
    const tenantsResponse = await this.getUserTenants();

    if (tenantsResponse.success && tenantsResponse.data && tenantsResponse.data.length > 0) {
      return this.switchTenant(tenantsResponse.data[0].id);
    }

    return createResponse(null);
  },
};

// ============================================================================
// Exports
// ============================================================================

export default tenantApi;
