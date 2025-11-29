/**
 * CaseSelector Component
 *
 * Unified selector for switching between company and person cases.
 * Provides dropdown with all available companies and persons.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, User, ChevronDown, Check } from 'lucide-react';
import { Subject } from '../../types';

interface CaseSelectorProps {
  activeSubject: Subject;
  onSubjectChange: (subject: Subject) => void;
}

type CaseOption = {
  id: string;
  name: string;
  subject: Subject;
  type: 'business' | 'personal';
};

const CASE_OPTIONS: CaseOption[] = [
  { id: 'tsl', name: 'TS Logistik ApS', subject: 'tsl', type: 'business' },
  { id: 'umit', name: 'Ümit Cetin', subject: 'umit', type: 'personal' },
];

const COMPANY_CASES = CASE_OPTIONS.filter(option => option.type === 'business');
const PERSON_CASES = CASE_OPTIONS.filter(option => option.type === 'personal');

export const CaseSelector: React.FC<CaseSelectorProps> = ({
  activeSubject,
  onSubjectChange,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const selectedCase = useMemo(() => CASE_OPTIONS.find(option => option.subject === activeSubject), [activeSubject]);
  const modeLabel = selectedCase?.type === 'business'
    ? t('nav.business')
    : t('nav.personal');
  const sections = useMemo(() => ([
    {
      key: 'business',
      label: t('nav.business', { defaultValue: 'Erhverv' }),
      items: COMPANY_CASES,
    },
    {
      key: 'personal',
      label: t('nav.personal', { defaultValue: 'Privat' }),
      items: PERSON_CASES,
    },
  ]), [t]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (subject: Subject) => {
    onSubjectChange(subject);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full min-w-0" ref={dropdownRef} aria-live="polite">
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="w-full rounded-full border border-[var(--color-border-gold)]/70 bg-[var(--color-surface)]/70 px-4 py-2 pr-10 shadow-md hover:border-[var(--color-gold)]/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] transition-all duration-200"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-gold)]/15 text-[var(--color-gold)] shrink-0">
            {selectedCase?.type === 'business' ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />}
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-sm font-semibold text-[var(--color-text)] truncate" title={selectedCase?.name}>
              {selectedCase?.name ?? t('topbar.selectCase', { defaultValue: 'Vælg virksomhed' })}
            </p>
            <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--color-text-muted)]">{modeLabel}</p>
          </div>
        </div>
        <ChevronDown className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute top-full left-0 right-0 mt-2 z-40 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl overflow-hidden"
        >
          {sections.map(section => (
            <div key={section.key} className="p-3 border-b border-[var(--color-border)] last:border-b-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[var(--color-text-muted)] mb-2">
                {section.label}
              </p>
              <div className="space-y-2">
                {section.items.map((item) => {
                  const isActive = item.subject === activeSubject;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      onClick={() => handleSelect(item.subject)}
                      className={`w-full flex items-center justify-between rounded-xl border px-3 py-2 text-left transition-all focus:outline-none focus-visible:ring-2 ${
                        isActive
                          ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/10 text-[var(--color-text)]'
                          : 'border-[var(--color-border)] hover:border-[var(--color-gold)]/50 hover:bg-[var(--color-surface-hover)]'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-[var(--color-text)]">{item.name}</span>
                        <span className="text-xs text-[var(--color-text-muted)]">{section.label}</span>
                      </div>
                      {isActive && <Check className="w-4 h-4 text-[var(--color-gold)]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
