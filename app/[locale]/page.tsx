'use client';

import {useTranslations} from 'next-intl';
import {Button} from '@/components/ui/button';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Link from 'next/link';
import {ArrowRight, Zap, Shield, Globe2, TrendingUp} from 'lucide-react';

export default function HomePage() {
  const t = useTranslations('common');

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 h-16 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between h-full max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold">{t('appName')}</span>
          </div>
          
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link href="/de/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/de/signup">
              <Button>Get Started <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            {t('appName')}
          </h1>
          <p className="text-2xl text-muted-foreground mb-4">
            {t('tagline')}
          </p>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Die einfachste AI-gestützte Automatisierungsplattform für KMUs.
            GDPR-konform, mehrsprachig und einfacher als N8N.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Link href="/de/signup">
              <Button size="lg">
                Kostenlos starten <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/de/demo">
              <Button size="lg" variant="outline">
                Live Demo ansehen
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-semibold text-center mb-12">
            Warum CertusFlow?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card p-6 rounded-lg border border-border">
              <Globe2 className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Native Mehrsprachigkeit
              </h3>
              <p className="text-sm text-muted-foreground">
                Vollständig auf Deutsch & Englisch. KI versteht beide Sprachen perfekt.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border border-border">
              <Shield className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                GDPR-First
              </h3>
              <p className="text-sm text-muted-foreground">
                100% GDPR-konform. Alle Daten bleiben in der EU. Volle Kontrolle über Ihre Daten.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border border-border">
              <Zap className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Einfacher als N8N
              </h3>
              <p className="text-sm text-muted-foreground">
                Beschreiben Sie in natürlicher Sprache, was automatisiert werden soll.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border border-border">
              <TrendingUp className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                KI-Dokumentenverarbeitung
              </h3>
              <p className="text-sm text-muted-foreground">
                Rechnungen, Belege & Verträge automatisch erkennen und verarbeiten.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-4">
            Bereit, Ihre Workflows zu automatisieren?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Starten Sie heute kostenlos. Keine Kreditkarte erforderlich.
          </p>
          <Link href="/de/signup">
            <Button size="lg">
              Jetzt kostenlos starten <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          <p>© 2025 {t('appName')}. Made with ❤️ in Europe.</p>
          <p className="mt-2">
            <Link href="/de/privacy" className="hover:text-foreground">
              Datenschutz
            </Link>
            {' • '}
            <Link href="/de/terms" className="hover:text-foreground">
              AGB
            </Link>
            {' • '}
            <Link href="/de/imprint" className="hover:text-foreground">
              Impressum
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
