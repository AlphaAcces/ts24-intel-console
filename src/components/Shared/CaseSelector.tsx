/**
 * CaseSelector Component
 *
 * Unified selector for switching between company and person cases.
 * Provides dropdown with all available companies and persons.
 */

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, User, ChevronDown } from 'lucide-react';
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

  const selectedCase = useMemo(() => CASE_OPTIONS.find(option => option.subject === activeSubject), [activeSubject]);
  const modeLabel = selectedCase?.type === 'business'
    ? t('nav.business')
    : t('nav.personal');
  const activeLabel = t('topbar.activeCase', { defaultValue: 'Active case' });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSubject = e.target.value as Subject;
    onSubjectChange(selectedSubject);
  };

  return (
    <div className="relative w-full min-w-0" aria-live="polite">
      <div className="rounded-xl border border-accent-green/30 bg-gradient-to-br from-component-dark/90 to-component-dark/60 px-3 py-2 pr-9 shadow-md hover:border-accent-green/50 hover:shadow-lg transition-all duration-200 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          {activeSubject === 'tsl' ? (
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-green/15 text-accent-green shrink-0">
              <Building2 className="h-4 w-4" />
            </div>
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-green/15 text-accent-green shrink-0">
              <User className="h-4 w-4" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-gray-50 truncate leading-tight tracking-wide" title={selectedCase?.name}>{selectedCase?.name ?? t('topbar.selectCase', { defaultValue: 'Vælg virksomhed' })}</p>
            <p className="text-[10px] text-accent-green font-semibold leading-tight uppercase tracking-wider">{modeLabel}</p>
          </div>
        </div>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-accent-green/60" aria-hidden="true" />
      </div>

      <select
        value={activeSubject}
        onChange={handleChange}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        aria-label={t('topbar.caseSelectorAria', { defaultValue: 'Select case - Switch between company and personal profiles' })}
        title={activeLabel}
      >
        <optgroup label={t('nav.business')}>
          {COMPANY_CASES.map((company) => (
            <option key={company.id} value={company.subject}>
              {company.name} • {t('nav.business')}
            </option>
          ))}
        </optgroup>
        <optgroup label={t('nav.personal')}>
          {PERSON_CASES.map((person) => (
            <option key={person.id} value={person.subject}>
              {person.name} • {t('nav.personal')}
            </option>
          ))}
        </optgroup>
      </select>
    </div>
  );
};
