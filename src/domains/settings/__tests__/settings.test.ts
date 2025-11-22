/**
 * Settings Redux Slice Tests
 */

import { describe, it, expect } from 'vitest';
import userPreferencesReducer, {
  setCurrency,
  setLocale,
  setCountry,
  setTimezone,
  setDateFormat,
} from '../../../store/userPreferencesSlice';
import { Currency, AppLocale, Country } from '../types';

describe('userPreferencesSlice - Multi-Jurisdiction', () => {
  const initialState = {
    compactMode: false,
    savedViews: [],
    currency: Currency.DKK,
    locale: AppLocale.DA_DK,
    country: Country.DENMARK,
    timezone: 'Europe/Copenhagen',
    dateFormat: 'medium' as const,
  };

  it('should set currency', () => {
    const newState = userPreferencesReducer(initialState, setCurrency(Currency.EUR));
    expect(newState.currency).toBe(Currency.EUR);
  });

  it('should set locale', () => {
    const newState = userPreferencesReducer(initialState, setLocale(AppLocale.EN_US));
    expect(newState.locale).toBe(AppLocale.EN_US);
  });

  it('should set country', () => {
    const newState = userPreferencesReducer(initialState, setCountry(Country.SWEDEN));
    expect(newState.country).toBe(Country.SWEDEN);
  });

  it('should set timezone', () => {
    const newState = userPreferencesReducer(initialState, setTimezone('Europe/Stockholm'));
    expect(newState.timezone).toBe('Europe/Stockholm');
  });

  it('should set date format', () => {
    const newState = userPreferencesReducer(initialState, setDateFormat('short'));
    expect(newState.dateFormat).toBe('short');
  });
});
