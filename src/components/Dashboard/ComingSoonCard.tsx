/**
 * ComingSoonCard Component
 *
 * Placeholder card for features in development
 * Intel24 design with gold accent and subtle animation
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, ArrowRight } from 'lucide-react';

interface ComingSoonCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const ComingSoonCard: React.FC<ComingSoonCardProps> = ({
  title,
  description,
  icon,
  className = '',
}) => {
  const { t } = useTranslation();

  return (
    <div
      className={`coming-soon-card group relative overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition-all duration-300 hover:border-[var(--color-gold)]/40 hover:shadow-lg ${className}`}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-gold)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {icon && (
                <span className="text-[var(--color-gold)] opacity-60">
                  {icon}
                </span>
              )}
              <h3 className="text-sm font-semibold text-[var(--color-text)]">{title}</h3>
            </div>
            {description && (
              <p className="text-xs text-[var(--color-text-muted)] line-clamp-2">{description}</p>
            )}
          </div>

          {/* Coming Soon Badge */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/20">
            <Sparkles className="h-3 w-3 text-[var(--color-gold)]" />
            <span className="text-[10px] font-semibold text-[var(--color-gold)] uppercase tracking-wider">
              {t('dashboard.comingSoon', { defaultValue: 'Coming Soon' })}
            </span>
          </div>
        </div>

        {/* Learn More Link */}
        <div className="mt-4 pt-3 border-t border-[var(--color-border)]/50">
          <button className="flex items-center gap-1 text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-gold)] transition-colors">
            <span>{t('dashboard.learnMore', { defaultValue: 'Learn more' })}</span>
            <ArrowRight className="h-3 w-3 transform group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComingSoonCard;
