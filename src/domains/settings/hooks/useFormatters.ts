/**
 * Dynamic Formatting Hook
 * 
 * Provides formatters that automatically use user's selected currency and locale.
 */

import { useUserSettings } from './useUserSettings';
import { formatCurrency as baseFormatCurrency, formatNumber as baseFormatNumber, formatDate as baseFormatDate, formatPercent as baseFormatPercent, formatDSO as baseFormatDSO, FormatCurrencyOptions, FormatNumberOptions, FormatDateOptions, FormatDSOOptions } from '../../../lib/format';

export const useFormatters = () => {
  const { currency, locale } = useUserSettings();

  const formatCurrency = (value: number | null | undefined, options: Omit<FormatCurrencyOptions, 'currency' | 'locale'> = {}) => {
    return baseFormatCurrency(value, { ...options, currency, locale });
  };

  const formatNumber = (value: number | null | undefined, options: Omit<FormatNumberOptions, 'locale'> = {}) => {
    return baseFormatNumber(value, { ...options, locale });
  };

  const formatPercent = (value: number | null | undefined, options: Omit<FormatNumberOptions, 'locale'> = {}) => {
    return baseFormatPercent(value, { ...options, locale });
  };

  const formatDate = (value: string | Date | null | undefined, options: Omit<FormatDateOptions, 'locale'> = {}) => {
    return baseFormatDate(value, { ...options, locale });
  };

  const formatDSO = (value: number | null | undefined, options: Omit<FormatDSOOptions, 'locale'> = {}) => {
    return baseFormatDSO(value, { ...options, locale });
  };

  return {
    formatCurrency,
    formatNumber,
    formatPercent,
    formatDate,
    formatDSO,
    currency,
    locale,
  };
};
