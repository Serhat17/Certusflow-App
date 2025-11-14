'use client';

import {useTranslations} from 'next-intl';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Link from 'next/link';
import {ArrowRight, Zap, Shield, Globe2, TrendingUp, CheckCircle2, Brain, Workflow, FileText, Mail, Calendar, Users, Award, Clock} from 'lucide-react';

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
      <section className="py-24 px-6 bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block mb-4 px-4 py-2 bg-primary/10 rounded-full text-sm font-medium text-primary">
              🚀 AI-Powered Business Automation
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Automatisieren Sie Ihr Business mit KI
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-4">
              Die intelligente Automatisierungsplattform für moderne Unternehmen
            </p>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              CertusFlow nutzt künstliche Intelligenz, um Ihre Geschäftsprozesse zu automatisieren. 
              DSGVO-konform, mehrsprachig und so einfach wie eine Unterhaltung.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href="/de/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Kostenlos starten <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/de/demo">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Live Demo ansehen
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span>100% DSGVO-konform</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe2 className="h-4 w-4 text-blue-500" />
                <span>Made in Europe</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-yellow-500" />
                <span>No-Code AI</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Unsere Vision</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Wir glauben, dass jedes Unternehmen – unabhängig von seiner Größe – Zugang zu leistungsstarker 
              Automatisierung haben sollte. CertusFlow macht KI-gestützte Workflows für jeden zugänglich.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Brain className="h-12 w-12 text-primary mb-4" />
                <CardTitle>KI, die versteht</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Keine komplizierten Workflows mehr. Beschreiben Sie einfach in natürlicher Sprache, 
                  was Sie automatisieren möchten – unsere KI erledigt den Rest.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Für KMUs entwickelt</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Speziell für kleine und mittelständische Unternehmen konzipiert. 
                  Keine riesigen IT-Teams erforderlich – jeder kann es nutzen.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Privacy by Design</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Datenschutz ist kein Nachgedanke. Alle Daten bleiben in der EU, 
                  vollständige DSGVO-Konformität und transparente Datenverarbeitung.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Alles, was Sie brauchen</h2>
            <p className="text-xl text-muted-foreground">
              Eine Plattform. Unendliche Möglichkeiten.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card p-6 rounded-lg border border-border hover:shadow-lg transition-shadow">
              <FileText className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Intelligente Dokumentenverarbeitung
              </h3>
              <p className="text-sm text-muted-foreground">
                Rechnungen, Belege, Verträge automatisch erkennen, extrahieren und verarbeiten. 
                Mehrsprachig und hochpräzise.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border border-border hover:shadow-lg transition-shadow">
              <Mail className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                E-Mail-Automatisierung
              </h3>
              <p className="text-sm text-muted-foreground">
                Gmail, Outlook und mehr. Automatische Antworten, intelligentes Routing, 
                und KI-gestützte Triage.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border border-border hover:shadow-lg transition-shadow">
              <Workflow className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Workflow-Automation
              </h3>
              <p className="text-sm text-muted-foreground">
                Verbinden Sie Ihre Tools. Dropbox, Slack, Kalender und hunderte weitere Integrationen.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border border-border hover:shadow-lg transition-shadow">
              <Globe2 className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Native Mehrsprachigkeit
              </h3>
              <p className="text-sm text-muted-foreground">
                Vollständig auf Deutsch & Englisch. KI versteht beide Sprachen perfekt, 
                ohne Kompromisse.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Anwendungsfälle</h2>
            <p className="text-xl text-muted-foreground">
              Sehen Sie, wie CertusFlow Ihr Business transformiert
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-6 w-6 text-primary" />
                  Rechnungsverarbeitung
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Rechnungen automatisch aus E-Mails extrahieren</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Daten in Ihr Buchhaltungssystem übertragen</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Automatische Plausibilitätsprüfung und Freigabe</p>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-medium">Spart bis zu 15 Stunden pro Woche</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-6 w-6 text-primary" />
                  Kundensupport-Automatisierung
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">KI-gestützte E-Mail-Kategorisierung</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Automatische Antworten für häufige Fragen</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Ticket-Erstellung und Prioritäts-Routing</p>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-medium">Reduziert Antwortzeit um 80%</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-primary" />
                  Meeting-Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Automatische Terminplanung und Einladungen</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Meeting-Notizen und Action Items extrahieren</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Follow-up E-Mails automatisch versenden</p>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-medium">5 Stunden pro Woche eingespart</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  Daten-Synchronisation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Daten zwischen Systemen synchronisieren</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Automatische Backup und Archivierung</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Echtzeit-Benachrichtigungen bei Änderungen</p>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-medium">Keine manuellen Fehler mehr</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 px-6 bg-muted/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Warum CertusFlow?</h2>
            <p className="text-xl text-muted-foreground">
              Der Unterschied zu anderen Automation-Tools
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-background p-6 rounded-lg border-2 border-muted">
              <h3 className="font-semibold mb-4 text-center">Andere Tools</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-red-500">✗</span>
                  <span>Komplizierte Node-basierte Workflows</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-red-500">✗</span>
                  <span>Nur auf Englisch verfügbar</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-red-500">✗</span>
                  <span>DSGVO-Compliance unklar</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-red-500">✗</span>
                  <span>Hohe Lernkurve erforderlich</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-red-500">✗</span>
                  <span>Begrenzte KI-Integration</span>
                </li>
              </ul>
            </div>

            <div className="bg-primary/5 p-6 rounded-lg border-2 border-primary relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                CertusFlow
              </div>
              <h3 className="font-semibold mb-4 text-center text-primary">CertusFlow</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>Natürliche Sprache – einfach beschreiben</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>Vollständig auf Deutsch & Englisch</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>100% DSGVO-konform, EU-hosted</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>Sofort einsatzbereit, keine Schulung</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>KI-First: Built for intelligent automation</span>
                </li>
              </ul>
            </div>

            <div className="bg-background p-6 rounded-lg border-2 border-muted">
              <h3 className="font-semibold mb-4 text-center">Manuelle Arbeit</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-red-500">✗</span>
                  <span>Zeitaufwendig und fehleranfällig</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-red-500">✗</span>
                  <span>Keine Skalierbarkeit</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-red-500">✗</span>
                  <span>Hohe Personalkosten</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-red-500">✗</span>
                  <span>Monotone, repetitive Aufgaben</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-red-500">✗</span>
                  <span>Keine Prozess-Insights</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Was unsere Kunden sagen</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-500">★</span>
                  ))}
                </div>
                <p className="text-sm mb-4">
                  "CertusFlow hat unseren Rechnungsprozess revolutioniert. Was früher Stunden dauerte, 
                  erledigt die KI jetzt in Minuten. Und das alles DSGVO-konform!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold">
                    MS
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Maria Schmidt</p>
                    <p className="text-xs text-muted-foreground">CFO, TechStart GmbH</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-500">★</span>
                  ))}
                </div>
                <p className="text-sm mb-4">
                  "Endlich ein Automation-Tool, das auf Deutsch funktioniert! Die KI versteht unsere 
                  Anfragen perfekt. Keine komplizierten Workflows mehr."
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold">
                    TM
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Thomas Müller</p>
                    <p className="text-xs text-muted-foreground">Geschäftsführer, Müller Consulting</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-500">★</span>
                  ))}
                </div>
                <p className="text-sm mb-4">
                  "Wir haben in der ersten Woche bereits 20 Stunden eingespart. Der ROI war nach 
                  einem Monat erreicht. Absolut empfehlenswert!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold">
                    LK
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Laura Klein</p>
                    <p className="text-xs text-muted-foreground">Operations Manager, E-Commerce Plus</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Bereit für intelligente Automation?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Starten Sie heute kostenlos. Keine Kreditkarte erforderlich. Jederzeit kündbar.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link href="/de/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Jetzt kostenlos starten <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/de/demo">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Live Demo buchen
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            ✓ 14 Tage kostenlos testen  ✓ Keine Einrichtungsgebühr  ✓ Deutscher Support
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-6 w-6 text-primary" />
                <span className="text-xl font-semibold">{t('appName')}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                KI-gestützte Automatisierung für moderne Unternehmen. GDPR-konform und mehrsprachig.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produkt</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/de/features" className="hover:text-foreground">Features</Link></li>
                <li><Link href="/de/pricing" className="hover:text-foreground">Preise</Link></li>
                <li><Link href="/de/integrations" className="hover:text-foreground">Integrationen</Link></li>
                <li><Link href="/de/demo" className="hover:text-foreground">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Unternehmen</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/de/about" className="hover:text-foreground">Über uns</Link></li>
                <li><Link href="/de/blog" className="hover:text-foreground">Blog</Link></li>
                <li><Link href="/de/careers" className="hover:text-foreground">Karriere</Link></li>
                <li><Link href="/de/contact" className="hover:text-foreground">Kontakt</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/de/privacy" className="hover:text-foreground">Datenschutz</Link></li>
                <li><Link href="/de/terms" className="hover:text-foreground">AGB</Link></li>
                <li><Link href="/de/imprint" className="hover:text-foreground">Impressum</Link></li>
                <li><Link href="/de/gdpr" className="hover:text-foreground">GDPR</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 {t('appName')}. Made with ❤️ in Europe. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
