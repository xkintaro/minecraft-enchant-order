import { defineRouting } from 'next-intl/routing';
import localeNames from './locales.json';

export { localeNames };

export const routing = defineRouting({
  locales: Object.keys(localeNames) as Array<keyof typeof localeNames>,
  defaultLocale: 'en',
  localePrefix: 'always',
  localeDetection: false,
});
