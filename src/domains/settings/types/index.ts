/**
 * Multi-Jurisdiction Settings Types
 *
 * Supports dynamic currency, locale, and market context switching.
 */

export enum Currency {
  DKK = 'DKK',
  EUR = 'EUR',
  USD = 'USD',
  GBP = 'GBP',
  SEK = 'SEK',
  NOK = 'NOK',
}

export enum AppLocale {
  DA_DK = 'da-DK',
  EN_US = 'en-US',
  EN_GB = 'en-GB',
  SV_SE = 'sv-SE',
  NB_NO = 'nb-NO',
  DE_DE = 'de-DE',
}

export enum Country {
  DENMARK = 'DK',
  SWEDEN = 'SE',
  NORWAY = 'NO',
  GERMANY = 'DE',
  UNITED_KINGDOM = 'GB',
  UNITED_STATES = 'US',
}

export interface CurrencyConfig {
  code: Currency;
  symbol: string;
  name: string;
  decimalPlaces: number;
  thousandsSeparator: string;
  decimalSeparator: string;
}

export interface LocaleConfig {
  code: AppLocale;
  name: string;
  flag: string; // Emoji or ISO code for flag display
  dateFormat: string; // Display format (e.g., "DD/MM/YYYY")
  timeFormat: '12h' | '24h';
}

export interface CountryConfig {
  code: Country;
  name: string;
  flag: string;
  defaultCurrency: Currency;
  defaultLocale: AppLocale;
  timezone: string; // IANA timezone (e.g., "Europe/Copenhagen")
}

export interface UserSettings {
  currency: Currency;
  locale: AppLocale;
  country: Country;
  timezone: string;
  dateFormat: 'short' | 'medium' | 'long';
  compactMode: boolean; // From existing Redux
}

export const CURRENCY_CONFIGS: Record<Currency, CurrencyConfig> = {
  [Currency.DKK]: {
    code: Currency.DKK,
    symbol: 'kr',
    name: 'Danish Krone',
    decimalPlaces: 2,
    thousandsSeparator: '.',
    decimalSeparator: ',',
  },
  [Currency.EUR]: {
    code: Currency.EUR,
    symbol: '€',
    name: 'Euro',
    decimalPlaces: 2,
    thousandsSeparator: '.',
    decimalSeparator: ',',
  },
  [Currency.USD]: {
    code: Currency.USD,
    symbol: '$',
    name: 'US Dollar',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  [Currency.GBP]: {
    code: Currency.GBP,
    symbol: '£',
    name: 'British Pound',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  [Currency.SEK]: {
    code: Currency.SEK,
    symbol: 'kr',
    name: 'Swedish Krona',
    decimalPlaces: 2,
    thousandsSeparator: ' ',
    decimalSeparator: ',',
  },
  [Currency.NOK]: {
    code: Currency.NOK,
    symbol: 'kr',
    name: 'Norwegian Krone',
    decimalPlaces: 2,
    thousandsSeparator: ' ',
    decimalSeparator: ',',
  },
};

export const LOCALE_CONFIGS: Record<AppLocale, LocaleConfig> = {
  [AppLocale.DA_DK]: {
    code: AppLocale.DA_DK,
    name: 'Dansk',
    flag: '🇩🇰',
    dateFormat: 'DD-MM-YYYY',
    timeFormat: '24h',
  },
  [AppLocale.EN_US]: {
    code: AppLocale.EN_US,
    name: 'English (US)',
    flag: '🇺🇸',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
  },
  [AppLocale.EN_GB]: {
    code: AppLocale.EN_GB,
    name: 'English (UK)',
    flag: '🇬🇧',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
  },
  [AppLocale.SV_SE]: {
    code: AppLocale.SV_SE,
    name: 'Svenska',
    flag: '🇸🇪',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
  },
  [AppLocale.NB_NO]: {
    code: AppLocale.NB_NO,
    name: 'Norsk',
    flag: '🇳🇴',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: '24h',
  },
  [AppLocale.DE_DE]: {
    code: AppLocale.DE_DE,
    name: 'Deutsch',
    flag: '🇩🇪',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: '24h',
  },
};

export const COUNTRY_CONFIGS: Record<Country, CountryConfig> = {
  [Country.DENMARK]: {
    code: Country.DENMARK,
    name: 'Denmark',
    flag: '🇩🇰',
    defaultCurrency: Currency.DKK,
    defaultLocale: AppLocale.DA_DK,
    timezone: 'Europe/Copenhagen',
  },
  [Country.SWEDEN]: {
    code: Country.SWEDEN,
    name: 'Sweden',
    flag: '🇸🇪',
    defaultCurrency: Currency.SEK,
    defaultLocale: AppLocale.SV_SE,
    timezone: 'Europe/Stockholm',
  },
  [Country.NORWAY]: {
    code: Country.NORWAY,
    name: 'Norway',
    flag: '🇳🇴',
    defaultCurrency: Currency.NOK,
    defaultLocale: AppLocale.NB_NO,
    timezone: 'Europe/Oslo',
  },
  [Country.GERMANY]: {
    code: Country.GERMANY,
    name: 'Germany',
    flag: '🇩🇪',
    defaultCurrency: Currency.EUR,
    defaultLocale: AppLocale.DE_DE,
    timezone: 'Europe/Berlin',
  },
  [Country.UNITED_KINGDOM]: {
    code: Country.UNITED_KINGDOM,
    name: 'United Kingdom',
    flag: '🇬🇧',
    defaultCurrency: Currency.GBP,
    defaultLocale: AppLocale.EN_GB,
    timezone: 'Europe/London',
  },
  [Country.UNITED_STATES]: {
    code: Country.UNITED_STATES,
    name: 'United States',
    flag: '🇺🇸',
    defaultCurrency: Currency.USD,
    defaultLocale: AppLocale.EN_US,
    timezone: 'America/New_York',
  },
};

export const DEFAULT_USER_SETTINGS: UserSettings = {
  currency: Currency.DKK,
  locale: AppLocale.DA_DK,
  country: Country.DENMARK,
  timezone: 'Europe/Copenhagen',
  dateFormat: 'medium',
  compactMode: false,
};
