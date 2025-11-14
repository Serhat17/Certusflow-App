'use client';

import {useTranslations} from 'next-intl';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {
  Search,
  BookOpen,
  Video,
  MessageCircle,
  Mail,
  FileText,
  Zap,
  HelpCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import {useState} from 'react';

export default function HelpPage() {
  const t = useTranslations('help');
  const tCommon = useTranslations('common');
  
  const [searchQuery, setSearchQuery] = useState('');

  const quickLinks = [
    {
      title: 'Erste Schritte',
      description: 'Lernen Sie die Grundlagen von CertusFlow kennen',
      icon: BookOpen,
      href: '#getting-started',
      color: 'text-primary'
    },
    {
      title: 'Video-Tutorials',
      description: 'Schritt-für-Schritt Anleitungen als Video',
      icon: Video,
      href: '#tutorials',
      color: 'text-success'
    },
    {
      title: 'API-Dokumentation',
      description: 'Entwickler-Ressourcen und API-Referenz',
      icon: FileText,
      href: '#api-docs',
      color: 'text-info'
    },
    {
      title: 'Community Forum',
      description: 'Austausch mit anderen Nutzern',
      icon: MessageCircle,
      href: '#community',
      color: 'text-warning'
    }
  ];

  const faqs = [
    {
      category: 'Allgemein',
      questions: [
        {
          q: 'Was ist CertusFlow?',
          a: 'CertusFlow ist eine KI-gestützte Automatisierungsplattform für KMUs. Sie können Workflows in natürlicher Sprache (Deutsch oder Englisch) erstellen und Dokumente automatisch verarbeiten lassen.'
        },
        {
          q: 'Wie viel kostet CertusFlow?',
          a: 'Wir bieten verschiedene Pläne an: Starter (kostenlos), Professional (€29/Monat) und Enterprise (individuelle Preise). Der Starter-Plan enthält 100 Automatisierungs-Runs pro Monat.'
        },
        {
          q: 'In welchen Sprachen funktioniert CertusFlow?',
          a: 'CertusFlow unterstützt aktuell Deutsch und Englisch vollständig. Die KI-Dokumentenverarbeitung erkennt beide Sprachen automatisch.'
        }
      ]
    },
    {
      category: 'Automatisierungen',
      questions: [
        {
          q: 'Wie erstelle ich eine Automatisierung?',
          a: 'Gehen Sie zu "Automatisierungen" und beschreiben Sie einfach in natürlicher Sprache, was automatisiert werden soll. Beispiel: "Wenn eine E-Mail mit Rechnung kommt, extrahiere die Daten und speichere sie in Google Sheets".'
        },
        {
          q: 'Welche Integrationen werden unterstützt?',
          a: 'Wir unterstützen Gmail, Outlook, Google Sheets, Slack, Microsoft Teams, Dropbox, OneDrive und viele weitere. Neue Integrationen werden regelmäßig hinzugefügt.'
        },
        {
          q: 'Kann ich Automatisierungen bearbeiten?',
          a: 'Ja, Sie können jede Automatisierung jederzeit bearbeiten, pausieren oder löschen. Änderungen werden sofort übernommen.'
        }
      ]
    },
    {
      category: 'Dokumente',
      questions: [
        {
          q: 'Welche Dokumenttypen werden unterstützt?',
          a: 'Wir unterstützen PDFs, PNG und JPG-Dateien bis zu 10MB. Die KI erkennt automatisch Rechnungen, Lieferscheine, Angebote und andere Geschäftsdokumente.'
        },
        {
          q: 'Wie genau ist die KI-Extraktion?',
          a: 'Unsere KI hat eine Genauigkeit von über 98% bei strukturierten Dokumenten wie Rechnungen. Bei unleserlichen oder beschädigten Dokumenten kann die Genauigkeit variieren.'
        },
        {
          q: 'Werden meine Dokumente gespeichert?',
          a: 'Ja, alle hochgeladenen Dokumente werden verschlüsselt in der EU gespeichert. Sie können Ihre Daten jederzeit gemäß GDPR/DSGVO exportieren oder löschen.'
        }
      ]
    },
    {
      category: 'Sicherheit & Datenschutz',
      questions: [
        {
          q: 'Wo werden meine Daten gespeichert?',
          a: 'Alle Daten werden in der EU (Deutschland) gespeichert und entsprechen den GDPR/DSGVO-Richtlinien. Wir nutzen Supabase mit PostgreSQL.'
        },
        {
          q: 'Wer hat Zugriff auf meine Daten?',
          a: 'Nur Sie haben Zugriff auf Ihre Daten. Unsere Mitarbeiter können ohne Ihre explizite Genehmigung nicht auf Ihre Dokumente oder Automatisierungen zugreifen.'
        },
        {
          q: 'Kann ich meine Daten löschen?',
          a: 'Ja, Sie können jederzeit in den Einstellungen alle Ihre Daten mit einem Klick löschen. Dies umfasst alle Dokumente, Automatisierungen und persönlichen Informationen.'
        }
      ]
    }
  ];

  const contactOptions = [
    {
      title: 'E-Mail Support',
      description: 'support@certusflow.com',
      icon: Mail,
      href: 'mailto:support@certusflow.com'
    },
    {
      title: 'Live Chat',
      description: 'Mo-Fr, 9-18 Uhr',
      icon: MessageCircle,
      href: '#chat'
    },
    {
      title: 'Dokumentation',
      description: 'docs.certusflow.com',
      icon: BookOpen,
      href: 'https://docs.certusflow.com'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="px-8 py-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-semibold mb-4">Hilfe & Support</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Durchsuchen Sie unsere Hilfeartikel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <div className="p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Quick Links */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Schnellzugriff</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Card key={link.title} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 ${link.color}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{link.title}</h3>
                          <p className="text-sm text-muted-foreground">{link.description}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* FAQs */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Häufig gestellte Fragen</h2>
            <div className="space-y-6">
              {faqs.map((category) => (
                <div key={category.category}>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-primary" />
                    {category.category}
                  </h3>
                  <div className="space-y-4">
                    {category.questions.map((faq, idx) => (
                      <Card key={idx}>
                        <CardHeader>
                          <CardTitle className="text-base">{faq.q}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{faq.a}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Contact Options */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Kontaktieren Sie uns</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {contactOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Card key={option.title} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6 text-center">
                      <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-1">{option.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{option.description}</p>
                      <Button variant="outline" size="sm">
                        Kontakt
                        <ExternalLink className="ml-2 h-3 w-3" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Additional Resources */}
          <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
            <CardContent className="p-8 text-center">
              <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Noch Fragen?</h3>
              <p className="text-muted-foreground mb-6">
                Unser Support-Team hilft Ihnen gerne weiter
              </p>
              <Button>
                <Mail className="mr-2 h-4 w-4" />
                Nachricht senden
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
