import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {locales} from '@/i18n';
import {Toaster} from 'sonner';
import type {Metadata} from 'next';
import '../globals.css';

export const metadata: Metadata = {
  title: 'CertusFlow - AI-Powered Business Automation | GDPR-Compliant Workflow Platform',
  description: 'CertusFlow is the easiest AI-powered automation platform for SMEs. GDPR-compliant, multilingual, and simpler than N8N. Automate invoices, emails, and workflows with natural language.',
  keywords: ['business automation', 'workflow automation', 'AI automation', 'GDPR compliant', 'invoice processing', 'document automation', 'SME automation', 'N8N alternative', 'Zapier alternative', 'deutsche automation', 'KI Automatisierung'],
  authors: [{name: 'CertusFlow Team'}],
  creator: 'CertusFlow',
  publisher: 'CertusFlow',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    alternateLocale: ['en_US'],
    url: 'https://certusflow.com',
    title: 'CertusFlow - AI-Powered Business Automation',
    description: 'Automate your business workflows with AI. GDPR-compliant, multilingual, and easy to use.',
    siteName: 'CertusFlow',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CertusFlow - AI-Powered Business Automation',
    description: 'Automate your business workflows with AI. GDPR-compliant, multilingual, and easy to use.',
  },
  alternates: {
    canonical: 'https://certusflow.com',
    languages: {
      'de': 'https://certusflow.com/de',
      'en': 'https://certusflow.com/en',
    },
  },
};

export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  
  // Ensure that the incoming `locale` is valid
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
          <Toaster position="top-right" richColors />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
