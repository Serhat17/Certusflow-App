import createMiddleware from 'next-intl/middleware';
import {locales, defaultLocale} from './i18n';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeDetection: true, // Auto-detect from browser headers
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
