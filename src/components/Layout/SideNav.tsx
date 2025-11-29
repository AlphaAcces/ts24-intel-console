/**
 * SideNav Component - Intel24 Redesign
 *
 * Improved navigation sidebar with:
 * - Collapsible section groups (Analysis, Operations, Risk & Actions, Settings)
 * - Distinct icons with micro-animations
 * - Placeholder links for future tools
 * - Gold active states with Intel24 branding
 * - Mobile: slide-in overlay; Desktop: always visible
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { View, Subject } from '../../types';
import { NAV_ITEMS, NAV_SECTIONS, PLACEHOLDER_ITEMS, NavSection } from '../../config/navigation';

interface SideNavProps {
  currentView: View;
  activeSubject: Subject;
  onNavigate: (view: View) => void;
  isOpen: boolean;
  navigateToFull?: (view: View, options?: { fromDashboard?: boolean; breadcrumbs?: string[] }) => void;
  topOffset: number;
  onOpenCommandDeck?: () => void;
}

export const SideNav: React.FC<SideNavProps> = ({
  currentView,
  activeSubject,
  onNavigate,
  isOpen,
  navigateToFull,
  topOffset,
  onOpenCommandDeck,
}) => {
  const { t } = useTranslation();
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const visibleNavItems = NAV_ITEMS.filter(item => item.showFor.includes(activeSubject));
  const sections = NAV_SECTIONS[activeSubject] || NAV_SECTIONS.tsl;
  const placeholders = PLACEHOLDER_ITEMS.filter(item => item.showFor.includes(activeSubject));

  const toggleSection = (sectionKey: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionKey)) {
        next.delete(sectionKey);
      } else {
        next.add(sectionKey);
      }
      return next;
    });
  };

  const renderIcon = (icon: React.ReactElement) => {
    const className = `h-4 w-4 ${icon.props.className ?? ''}`.trim();
    return React.cloneElement(icon, { className, color: undefined, stroke: 'currentColor' });
  };

  const handleNavigate = (view: View, options?: { fromDashboard?: boolean; breadcrumbs?: string[] }) => {
    if (navigateToFull) {
      navigateToFull(view, options);
    } else {
      onNavigate(view);
    }
  };

  const renderSection = (section: NavSection) => {
    const sectionItems = visibleNavItems.filter(item => section.items.includes(item.id));
    const sectionPlaceholders = placeholders.filter(p => p.section === section.key);
    const isCollapsed = collapsedSections.has(section.key);
    const isCollapsible = section.collapsible && section.label;
    const hasActiveItem = sectionItems.some(item => currentView === item.id);

    if (sectionItems.length === 0 && sectionPlaceholders.length === 0) return null;

    return (
      <div key={section.key} className="sidenav-section">
        {section.label && (
          <button
            onClick={() => isCollapsible && toggleSection(section.key)}
            className={`sidenav-section__header ${isCollapsible ? 'sidenav-section__header--collapsible' : ''} ${hasActiveItem ? 'sidenav-section__header--has-active' : ''}`}
            disabled={!isCollapsible}
            aria-expanded={!isCollapsed}
          >
            <span className="sidenav-section__label">
              {t(`nav.sections.${section.key}`, { defaultValue: section.label })}
            </span>
            {isCollapsible && (
              <span className="sidenav-section__chevron">
                {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </span>
            )}
          </button>
        )}

        <ul className={`sidenav-section__list ${isCollapsed ? 'sidenav-section__list--collapsed' : ''}`}>
          {sectionItems.map(item => {
            const isActive = currentView === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigate(item.id)}
                  className={`sidenav-item group ${isActive ? 'sidenav-item--active' : ''}`}
                >
                  <span className={`sidenav-item__icon ${isActive ? 'sidenav-item__icon--active' : ''}`}>
                    {renderIcon(item.icon)}
                  </span>
                  <span className="truncate">{item.i18nKey ? t(item.i18nKey) : item.label}</span>
                </button>
              </li>
            );
          })}

          {/* Placeholder items for future features */}
          {sectionPlaceholders.map(placeholder => (
            <li key={placeholder.id}>
              <div className="sidenav-item sidenav-item--placeholder" title={t('nav.comingSoon', { defaultValue: 'Coming soon' })}>
                <span className="sidenav-item__icon sidenav-item__icon--placeholder">
                  {renderIcon(placeholder.icon)}
                </span>
                <span className="truncate">{placeholder.i18nKey ? t(placeholder.i18nKey) : placeholder.label}</span>
                <Plus className="h-3 w-3 ml-auto opacity-40" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <aside
      aria-label={t('nav.primaryMenu', { defaultValue: 'Primary navigation' })}
      className={`sidenav fixed top-0 left-0 z-20 h-full w-64 sm:w-72 max-w-[90vw] border-r border-[var(--color-border)] bg-[var(--color-surface)] backdrop-blur-sm shadow-2xl lg:shadow-none transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 overflow-hidden`}
      style={{ paddingTop: topOffset }}
    >
      <div className="flex h-full flex-col">
        <nav className="sidenav__nav flex-1 p-4 pb-6 overflow-y-auto scrollbar-hidden">
          {sections.map(renderSection)}
        </nav>

        {/* Settings Footer */}
        <div className="sidenav__footer border-t border-[var(--color-border)]/60 bg-[var(--color-surface)]/90 p-4 space-y-2">
          <p className="text-xs text-[var(--color-text-muted)] leading-snug">
            {t('commandDeck.sidebarHint', { defaultValue: 'Globale indstillinger findes i Command Deck.' })}
          </p>
          {onOpenCommandDeck && (
            <button
              onClick={onOpenCommandDeck}
              className="mt-1 w-full rounded-xl border border-[var(--color-gold)]/40 bg-[var(--color-gold)]/10 px-3 py-2 text-sm font-semibold text-[var(--color-gold)] hover:bg-[var(--color-gold)]/20 transition-colors"
            >
              {t('commandDeck.openCta', { defaultValue: 'Åbn Command Deck' })}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
