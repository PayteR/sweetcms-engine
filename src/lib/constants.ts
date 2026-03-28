/** Milliseconds in one day */
export const DAY_MS = 24 * 60 * 60 * 1000;

/** Default locale */
export const DEFAULT_LOCALE = 'en';

/** Supported locales */
export const LOCALES = ['en', 'es', 'de'] as const;
export type Locale = (typeof LOCALES)[number];
