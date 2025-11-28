/**
 * TopBar Component - Intel24 Redesign
 *
 * Streamlined header with:
 * - TS24 branded logo (replacing TSL)
 * - Harmonized height (56px desktop, responsive mobile)
 * - Intuitive grouped controls: Left (logo, case), Center (tenant), Right (actions, user)
 * - Settings dropdown with language, market, theme
 * - Dark/light theme support
 */

import React, { useState, useLayoutEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  UserCircle2,
  Settings,
  Globe,
  MapPin,
  ChevronDown,
  Menu,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import { Ts24Logo } from '../Shared/Ts24Logo';
import { CaseSelector } from '../Shared/CaseSelector';
import { NotificationDrawer } from '../../domains/notifications/components/NotificationDrawer';
import { LocaleSwitcher } from '../../domains/settings/components/LocaleSwitcher';
import { CountrySelector } from '../../domains/settings/components/CountrySelector';
import { useNotifications } from '../../domains/notifications/hooks';
import { PreferencesPanel } from '../Shared/PreferencesPanel';
import { Subject, View } from '../../types';
import { TenantSwitcher } from '../../domains/tenant/TenantSwitcher';
import { useTheme } from '../../domains/tenant/ThemeContext';

interface TopBarProps {
  onToggleNav: () => void;
  activeSubject: Subject;
  onSubjectChange: (subject: Subject) => void;
  currentView: View;
  currentBreadcrumbs?: string[];
  onNavigate?: (view: View, options?: { fromDashboard?: boolean; breadcrumbs?: string[] }) => void;
  onHeightChange?: (height: number) => void;
  user?: { id: string; role: 'admin' | 'user' } | null;
  onTenantChange?: (tenantId: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onToggleNav,
  activeSubject,
  onSubjectChange,
  currentView,
  currentBreadcrumbs,
  onNavigate,
  onHeightChange,
  user,
  onTenantChange,
}) => {
  const { t } = useTranslation();
  const { mode, setMode } = useTheme();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const settingsRef = useRef<HTMLDivElement | null>(null);

  // Close settings dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Measure header height dynamically
  useLayoutEffect(() => {
    if (!onHeightChange) return;
    const node = headerRef.current;
    if (!node) return;

    const updateHeight = () => {
      onHeightChange(node.getBoundingClientRect().height);
    };

    updateHeight();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => updateHeight());
      observer.observe(node);
      return () => observer.disconnect();
    }

    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [onHeightChange]);

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications();

  const roleLabel = user?.role === 'admin'
    ? t('auth.roles.admin', { defaultValue: 'Admin' })
    : user?.role === 'user'
      ? t('auth.roles.user', { defaultValue: 'Bruger' })
      : null;

  const userInitials = (user?.id ?? '?').slice(0, 2).toUpperCase();

  const ThemeIcon = mode === 'dark' ? Moon : mode === 'light' ? Sun : Monitor;

  return (
    <header
      ref={headerRef}
      className="topbar fixed top-0 left-0 right-0 z-30"
    >
      <div className="topbar__container">
        {/* Left Section: Menu toggle, Logo, Case Selector */}
        <div className="topbar__left">
          <button
            onClick={onToggleNav}
            className="topbar__menu-btn lg:hidden"
            aria-label={t('topbar.openNavigation', { defaultValue: 'Open navigation' })}
          >
            <Menu className="h-5 w-5" />
          </button>

          <Ts24Logo variant="header" />

          <div className="topbar__divider hidden lg:block" />

          <div className="hidden sm:block">
            <CaseSelector activeSubject={activeSubject} onSubjectChange={onSubjectChange} />
          </div>
        </div>

        {/* Center Section: Tenant Switcher (Desktop only) */}
        <div className="topbar__center hidden lg:flex">
          <TenantSwitcher variant="compact" onTenantChange={onTenantChange} />
        </div>

        {/* Right Section: Actions */}
        <div className="topbar__right">
          {/* Save View Button */}
          <PreferencesPanel
            currentViewId={currentView}
            currentBreadcrumbs={currentBreadcrumbs}
            navigateTo={onNavigate}
            variant="compact"
          />

          {/* Settings Dropdown */}
          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="topbar__icon-btn"
              aria-label={t('topbar.settings', { defaultValue: 'Settings' })}
              aria-expanded={isSettingsOpen}
            >
              <Settings className="h-4 w-4" />
              <ChevronDown className={`h-3 w-3 transition-transform ${isSettingsOpen ? 'rotate-180' : ''}`} />
            </button>

            {isSettingsOpen && (
              <div className="topbar__dropdown">
                <div className="topbar__dropdown-header">
                  {t('topbar.configuration', { defaultValue: 'Configuration' })}
                </div>

                {/* Language Setting */}
                <div className="topbar__dropdown-item">
                  <div className="topbar__dropdown-label">
                    <Globe className="h-4 w-4" />
                    <span>{t('settings.language.label', { defaultValue: 'Language' })}</span>
                  </div>
                  <LocaleSwitcher variant="condensed" />
                </div>

                {/* Market Setting */}
                <div className="topbar__dropdown-item">
                  <div className="topbar__dropdown-label">
                    <MapPin className="h-4 w-4" />
                    <span>{t('settings.market.label', { defaultValue: 'Market' })}</span>
                  </div>
                  <CountrySelector variant="condensed" />
                </div>

                {/* Theme Setting */}
                <div className="topbar__dropdown-item">
                  <div className="topbar__dropdown-label">
                    <ThemeIcon className="h-4 w-4" />
                    <span>{t('theme.title', { defaultValue: 'Theme' })}</span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setMode('light')}
                      className={`topbar__theme-btn ${mode === 'light' ? 'topbar__theme-btn--active' : ''}`}
                      title={t('theme.light')}
                    >
                      <Sun className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setMode('dark')}
                      className={`topbar__theme-btn ${mode === 'dark' ? 'topbar__theme-btn--active' : ''}`}
                      title={t('theme.dark')}
                    >
                      <Moon className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setMode('system')}
                      className={`topbar__theme-btn ${mode === 'system' ? 'topbar__theme-btn--active' : ''}`}
                      title={t('theme.system')}
                    >
                      <Monitor className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notifications */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="topbar__icon-btn"
            aria-label={t('notifications.open', { defaultValue: 'Notifications' })}
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="topbar__badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>

          {/* User Profile */}
          <div className="topbar__user">
            <div className="topbar__user-avatar">
              {user ? userInitials : <UserCircle2 className="h-5 w-5" />}
            </div>
            <div className="topbar__user-info hidden lg:block">
              <span className="topbar__user-name">{user?.id ?? t('auth.guest', { defaultValue: 'Guest' })}</span>
              {roleLabel && <span className="topbar__user-role">{roleLabel}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Controls Row */}
      <div className="topbar__mobile lg:hidden">
        <CaseSelector activeSubject={activeSubject} onSubjectChange={onSubjectChange} />
        <TenantSwitcher variant="compact" onTenantChange={onTenantChange} />
      </div>

      <NotificationDrawer
        isOpen={isDrawerOpen}
        notifications={notifications}
        unreadCount={unreadCount}
        onClose={() => setIsDrawerOpen(false)}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onDelete={deleteNotification}
        onClearAll={clearAll}
      />
    </header>
  );
};
