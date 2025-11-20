import React from 'react';
import { SectionHeading } from '../Shared/SectionHeading';
import { useTranslation } from 'react-i18next';

export const BusinessView: React.FC = () => {
  const { t } = useTranslation('business');

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow={t('heading.eyebrow')}
        title={t('heading.title')}
        subtitle={t('heading.subtitle')}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 bg-gray-900/40 border border-border-dark/50 rounded-lg p-6 h-64">
          {t('placeholder.kpiCards')}
        </div>
        <div className="bg-gray-900/40 border border-border-dark/50 rounded-lg p-6 h-64">
          {t('placeholder.filters')}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900/40 border border-border-dark/50 rounded-lg p-6 h-64">
          {t('placeholder.trendChart')}
        </div>
        <div className="bg-gray-900/40 border border-border-dark/50 rounded-lg p-6 h-64">
          {t('placeholder.tables')}
        </div>
      </div>
    </div>
  );
};
