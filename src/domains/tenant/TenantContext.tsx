/**
 * Tenant Context
 *
 * Provides tenant isolation, RBAC, and white-labeling support.
 */

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, ReactNode } from 'react';
import type {
  TenantConfig,
  TenantUser,
  TenantBranding,
  TenantFeatures,
  TenantModule,
  TenantContextType,
  Permission,
  TenantRole,
} from './types';

// ============================================================================
// Default Configurations
// ============================================================================

const DEFAULT_ROLE_PERMISSIONS: Record<TenantRole, Permission[]> = {
  owner: [
    'case:create', 'case:read', 'case:update', 'case:delete', 'case:export', 'case:share',
    'user:create', 'user:read', 'user:update', 'user:delete', 'user:invite',
    'settings:read', 'settings:update', 'branding:update', 'features:update',
    'data:import', 'data:export', 'data:delete',
    'ai:use', 'ai:configure',
    'admin:audit', 'admin:billing', 'admin:api',
  ],
  admin: [
    'case:create', 'case:read', 'case:update', 'case:delete', 'case:export', 'case:share',
    'user:create', 'user:read', 'user:update', 'user:invite',
    'settings:read', 'settings:update', 'branding:update',
    'data:import', 'data:export',
    'ai:use', 'ai:configure',
    'admin:audit',
  ],
  analyst: [
    'case:create', 'case:read', 'case:update', 'case:export',
    'user:read',
    'settings:read',
    'data:import', 'data:export',
    'ai:use',
  ],
  viewer: [
    'case:read',
    'user:read',
    'settings:read',
  ],
  guest: [
    'case:read',
  ],
};

const DEFAULT_BRANDING: TenantBranding = {
  companyName: 'TSL Intelligence',
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
};

const DEFAULT_FEATURES: TenantFeatures = {
  enabledModules: [
    'dashboard', 'executive', 'person', 'companies', 'financials',
    'risk', 'timeline', 'actions', 'hypotheses', 'scenarios',
    'cashflow', 'sector', 'counterparties', 'network', 'settings',
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
};

// ============================================================================
// Context Creation
// ============================================================================

const TenantContext = createContext<TenantContextType | null>(null);

// ============================================================================
// Provider Component
// ============================================================================

interface TenantProviderProps {
  children: ReactNode;
  initialTenant?: TenantConfig;
  initialUser?: TenantUser;
}

export const TenantProvider: React.FC<TenantProviderProps> = ({
  children,
  initialTenant,
  initialUser,
}) => {
  const [tenant, setTenantState] = useState<TenantConfig | null>(initialTenant || null);
  const [user, setUserState] = useState<TenantUser | null>(initialUser || null);
  const [isLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Apply tenant branding as CSS variables
  useEffect(() => {
    if (tenant?.branding?.colors) {
      const root = document.documentElement;
      const colors = tenant.branding.colors;
      const setVar = (name: string, value?: string, fallback?: string) => {
        if (value) {
          root.style.setProperty(name, value);
        } else if (fallback) {
          root.style.setProperty(name, fallback);
        }
      };

      setVar('--color-primary', colors.primary);
      setVar('--color-primary-hover', colors.primaryHover);
      setVar('--color-secondary', colors.secondary);
      setVar('--color-accent', colors.accent);
      setVar('--color-accent-hover', colors.accentHover, colors.accent);
      setVar('--color-accent-muted', colors.accentMuted, colors.accent);
      setVar('--color-accent-blue', colors.deepBlue ?? colors.primary);
      setVar('--color-accent-copper', colors.copper ?? colors.secondary);
      setVar('--color-danger', colors.danger);
      setVar('--color-danger-soft', colors.dangerSoft, 'rgba(229, 62, 62, 0.15)');
      setVar('--color-warning', colors.warning);
      setVar('--color-warning-soft', colors.warningSoft, 'rgba(221, 107, 32, 0.15)');
      setVar('--color-success', colors.success);
      setVar('--color-success-soft', colors.successSoft, 'rgba(56, 161, 105, 0.15)');
      setVar('--color-info', colors.info);
      setVar('--color-info-soft', colors.infoSoft, 'rgba(49, 130, 206, 0.2)');
      setVar('--color-background', colors.background);
      setVar('--color-background-dark', colors.backgroundDark);
      setVar('--color-surface', colors.surface);
      setVar('--color-surface-hover', colors.surfaceHover);
      setVar('--color-surface-elevated', colors.surfaceElevated, colors.surface);
      setVar('--color-border', colors.border);
      setVar('--color-border-strong', colors.borderStrong, colors.border);
      setVar('--color-border-subtle', colors.borderSubtle, 'rgba(255, 255, 255, 0.08)');
      setVar('--color-text', colors.text);
      setVar('--color-text-muted', colors.textMuted);
      setVar('--color-text-gold', colors.textGold, colors.accent);
      setVar('--color-gold', colors.gold, colors.accent);
      setVar('--color-gold-hover', colors.goldHover, colors.accentHover ?? colors.accent);
      setVar('--color-gold-muted', colors.goldMuted, colors.accentMuted ?? colors.accent);
      setVar('--color-copper', colors.copper, colors.secondary);
      setVar('--color-copper-hover', colors.copperHover, colors.secondary);
      setVar('--color-copper-muted', colors.copperMuted, colors.secondary);
      setVar('--color-deep-blue', colors.deepBlue, colors.primary);
      setVar('--color-deep-blue-light', colors.deepBlueLight, colors.primaryHover);
      setVar('--color-overlay', colors.overlay, document.body.classList.contains('dark')
        ? 'rgba(8, 10, 18, 0.85)'
        : 'rgba(0, 0, 0, 0.45)');
      setVar('--shadow-gold', colors.shadow, '0 0 20px rgba(227, 178, 60, 0.15)');
      setVar('--shadow-gold-strong', colors.shadowStrong, '0 0 30px rgba(227, 178, 60, 0.25)');

      const isDark = document.body.classList.contains('dark');
      root.style.setProperty('--color-border-gold', isDark ? 'rgba(227, 178, 60, 0.3)' : 'rgba(184, 148, 46, 0.35)');
    }

    // Apply custom CSS if provided
    if (tenant?.branding?.customCss) {
      const styleId = 'tenant-custom-css';
      let styleEl = document.getElementById(styleId) as HTMLStyleElement;

      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
      }

      styleEl.textContent = tenant.branding.customCss;
    }
  }, [tenant?.branding]);

  // Actions
  const setTenant = useCallback((newTenant: TenantConfig) => {
    setTenantState(newTenant);
    setError(null);
  }, []);

  const setUser = useCallback((newUser: TenantUser) => {
    setUserState(newUser);
    setError(null);
  }, []);

  const clearTenant = useCallback(() => {
    setTenantState(null);
    setUserState(null);
    setError(null);
  }, []);

  const updateBranding = useCallback((brandingUpdate: Partial<TenantBranding>) => {
    if (tenant) {
      setTenantState({
        ...tenant,
        branding: { ...tenant.branding, ...brandingUpdate },
      });
    }
  }, [tenant]);

  const updateFeatures = useCallback((featuresUpdate: Partial<TenantFeatures>) => {
    if (tenant) {
      setTenantState({
        ...tenant,
        features: { ...tenant.features, ...featuresUpdate },
      });
    }
  }, [tenant]);

  const updateAiKey = useCallback((aiKey?: string | null) => {
    if (tenant) {
      setTenantState({
        ...tenant,
        aiKey: aiKey ?? null,
      });
    }
  }, [tenant]);

  const hasPermission = useCallback((permission: Permission): boolean => {
    if (!user) return false;

    // Check explicit permissions first
    if (user.permissions.includes(permission)) return true;

    // Fall back to role-based permissions
    const rolePermissions = DEFAULT_ROLE_PERMISSIONS[user.role] || [];
    return rolePermissions.includes(permission);
  }, [user]);

  const hasFeature = useCallback((feature: keyof TenantFeatures): boolean => {
    if (!tenant) return false;
    const featureValue = tenant.features[feature];
    return typeof featureValue === 'boolean' ? featureValue : false;
  }, [tenant]);

  const hasModule = useCallback((module: TenantModule): boolean => {
    if (!tenant) return false;
    return tenant.features.enabledModules.includes(module);
  }, [tenant]);

  const contextValue = useMemo<TenantContextType>(() => ({
    tenant,
    user,
    isLoading,
    error,
    setTenant,
    setUser,
    clearTenant,
    updateBranding,
    updateFeatures,
    updateAiKey,
    hasPermission,
    hasFeature,
    hasModule,
  }), [
    tenant, user, isLoading, error,
    setTenant, setUser, clearTenant,
    updateBranding, updateFeatures,
    updateAiKey,
    hasPermission, hasFeature, hasModule,
  ]);

  return (
    <TenantContext.Provider value={contextValue}>
      {children}
    </TenantContext.Provider>
  );
};

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to access tenant context
 */
export const useTenant = (): TenantContextType => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

/**
 * Optional tenant hook that returns null when no provider is present.
 * Useful for components rendered in tests without a TenantProvider.
 */
export const useOptionalTenant = (): TenantContextType | null => {
  return useContext(TenantContext);
};

/**
 * Hook to access current tenant config
 */
export const useTenantConfig = (): TenantConfig | null => {
  const { tenant } = useTenant();
  return tenant;
};

/**
 * Hook to access current tenant user
 */
export const useTenantUser = (): TenantUser | null => {
  const { user } = useTenant();
  return user;
};

/**
 * Hook to check permissions (RBAC)
 */
export const usePermission = (permission: Permission): boolean => {
  const { hasPermission } = useTenant();
  return hasPermission(permission);
};

/**
 * Hook to check multiple permissions
 */
export const usePermissions = (permissions: Permission[]): Record<Permission, boolean> => {
  const { hasPermission } = useTenant();
  return useMemo(() => {
    const result: Partial<Record<Permission, boolean>> = {};
    permissions.forEach(p => {
      result[p] = hasPermission(p);
    });
    return result as Record<Permission, boolean>;
  }, [permissions, hasPermission]);
};

/**
 * Hook to check feature availability
 */
export const useFeature = (feature: keyof TenantFeatures): boolean => {
  const { hasFeature } = useTenant();
  return hasFeature(feature);
};

/**
 * Hook to check module availability
 */
export const useModule = (module: TenantModule): boolean => {
  const { hasModule } = useTenant();
  return hasModule(module);
};

/**
 * Hook to get tenant branding
 */
export const useBranding = (): TenantBranding => {
  const { tenant } = useTenant();
  return tenant?.branding || DEFAULT_BRANDING;
};

/**
 * Hook to get tenant ID for data queries
 */
export const useTenantId = (): string | null => {
  const { tenant } = useTenant();
  return tenant?.id || null;
};

// ============================================================================
// HOC for Permission Gating
// ============================================================================

interface WithPermissionProps {
  permission: Permission;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const WithPermission: React.FC<WithPermissionProps> = ({
  permission,
  fallback = null,
  children,
}) => {
  const hasAccess = usePermission(permission);
  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

interface WithModuleProps {
  module: TenantModule;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const WithModule: React.FC<WithModuleProps> = ({
  module,
  fallback = null,
  children,
}) => {
  const hasAccess = useModule(module);
  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

// ============================================================================
// Exports
// ============================================================================

export { DEFAULT_BRANDING, DEFAULT_FEATURES, DEFAULT_ROLE_PERMISSIONS };
export default TenantProvider;
