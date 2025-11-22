import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell } from 'lucide-react';
import { TslLogo } from '../Shared/TslLogo';
import { CaseSelector } from '../Shared/CaseSelector';
import { PreferencesPanel } from '../Shared/PreferencesPanel';
import { NotificationBadge } from '../../domains/notifications/components/NotificationBadge';
import { NotificationDrawer } from '../../domains/notifications/components/NotificationDrawer';
import { LocaleSwitcher } from '../../domains/settings/components/LocaleSwitcher';
import { CurrencySwitcher } from '../../domains/settings/components/CurrencySwitcher';
import { CountrySelector } from '../../domains/settings/components/CountrySelector';
import { useNotifications } from '../../domains/notifications/hooks';
import { Subject, View } from '../../types';

interface TopBarProps {
  onToggleNav: () => void;
  activeSubject: Subject;
  onSubjectChange: (subject: Subject) => void;
  currentViewId?: View;
  currentBreadcrumbs?: string[];
  navigateTo?: (view: View, options?: { fromDashboard?: boolean; breadcrumbs?: string[] }) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleNav, activeSubject, onSubjectChange, currentViewId, currentBreadcrumbs, navigateTo }) => {
  const { t } = useTranslation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications();

  return (
    <header className="fixed top-0 left-0 right-0 z-30 border-b border-border-dark bg-component-dark/95 backdrop-blur-xl shadow-lg">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-3 py-2 sm:px-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <button
              onClick={onToggleNav}
              className="lg:hidden rounded-lg border border-border-dark/70 p-1.5 text-gray-400 hover:text-white shrink-0"
              aria-label={t('topbar.openNavigation', { defaultValue: 'Open navigation' })}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
            </button>
            <TslLogo variant="header" className="h-8 w-auto shrink-0" />
            <div className="hidden md:block min-w-0 flex-1">
              <CaseSelector activeSubject={activeSubject} onSubjectChange={onSubjectChange} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-2">
              <NotificationBadge count={unreadCount} onClick={() => setIsDrawerOpen(true)} />
              <PreferencesPanel
                currentViewId={currentViewId ?? 'dashboard'}
                currentBreadcrumbs={currentBreadcrumbs}
                navigateTo={navigateTo}
              />
            </div>
            <div className="flex items-center gap-2 lg:hidden">
              <button
                type="button"
                className="rounded-lg border border-border-dark/60 p-1.5 text-gray-300 hover:text-white"
                onClick={() => setIsDrawerOpen(true)}
                aria-label={t('notifications.open', { defaultValue: 'Open notifications' })}
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="ml-1 text-xs font-semibold text-accent-green">{unreadCount}</span>
                )}
              </button>
              <PreferencesPanel
                currentViewId={currentViewId ?? 'dashboard'}
                currentBreadcrumbs={currentBreadcrumbs}
                navigateTo={navigateTo}
                variant="compact"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-border-dark/40 pt-2">
          <div className="md:hidden w-full">
            <CaseSelector activeSubject={activeSubject} onSubjectChange={onSubjectChange} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-500/70 hidden sm:inline">
              {t('topbar.settingsSection', { defaultValue: 'View settings' })}
            </span>
            <LocaleSwitcher variant="condensed" />
            <CountrySelector variant="condensed" />
            <CurrencySwitcher variant="condensed" />
          </div>
        </div>
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
