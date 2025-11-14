'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Input} from '@/components/ui/input';
import {
  Mail,
  Database,
  Cloud,
  FileText,
  MessageSquare,
  Calendar,
  ShoppingCart,
  DollarSign,
  Search,
  Plus,
  Settings,
  CheckCircle2,
  Link as LinkIcon
} from 'lucide-react';

export default function IntegrationsPage() {
  const t = useTranslations('integrations');
  const tCommon = useTranslations('common');
  
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data
  const connectedIntegrations = [
    {
      id: '1',
      name: 'Gmail',
      description: 'E-Mail-Integration für automatische Verarbeitung',
      icon: Mail,
      status: 'connected',
      color: 'bg-red-500',
      lastSync: '2024-01-15T10:30:00Z',
      automations: 3
    },
    {
      id: '2',
      name: 'Google Sheets',
      description: 'Speichern Sie extrahierte Daten in Tabellen',
      icon: FileText,
      status: 'connected',
      color: 'bg-green-500',
      lastSync: '2024-01-15T09:15:00Z',
      automations: 5
    },
    {
      id: '3',
      name: 'Slack',
      description: 'Benachrichtigungen und Alerts',
      icon: MessageSquare,
      status: 'connected',
      color: 'bg-purple-500',
      lastSync: '2024-01-14T18:20:00Z',
      automations: 2
    }
  ];

  const availableIntegrations = [
    {
      id: '4',
      name: 'Microsoft Outlook',
      description: 'E-Mail-Integration für Office 365',
      icon: Mail,
      category: 'E-Mail',
      color: 'bg-blue-500',
      popular: true
    },
    {
      id: '5',
      name: 'Dropbox',
      description: 'Cloud-Speicher für Dokumente',
      icon: Cloud,
      category: 'Speicher',
      color: 'bg-blue-400',
      popular: false
    },
    {
      id: '6',
      name: 'Microsoft Teams',
      description: 'Team-Kommunikation und Benachrichtigungen',
      icon: MessageSquare,
      category: 'Kommunikation',
      color: 'bg-indigo-500',
      popular: true
    },
    {
      id: '7',
      name: 'Google Calendar',
      description: 'Termine und Erinnerungen automatisieren',
      icon: Calendar,
      category: 'Produktivität',
      color: 'bg-blue-600',
      popular: false
    },
    {
      id: '8',
      name: 'Shopify',
      description: 'E-Commerce Integration',
      icon: ShoppingCart,
      category: 'E-Commerce',
      color: 'bg-green-600',
      popular: true
    },
    {
      id: '9',
      name: 'Stripe',
      description: 'Zahlungsverarbeitung',
      icon: DollarSign,
      category: 'Finanzen',
      color: 'bg-purple-600',
      popular: false
    },
    {
      id: '10',
      name: 'PostgreSQL',
      description: 'Datenbank-Integration',
      icon: Database,
      category: 'Datenbank',
      color: 'bg-blue-700',
      popular: false
    },
    {
      id: '11',
      name: 'OneDrive',
      description: 'Cloud-Speicher von Microsoft',
      icon: Cloud,
      category: 'Speicher',
      color: 'bg-blue-500',
      popular: false
    }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Integrationen</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Verbinden Sie Ihre Tools und automatisieren Sie Workflows
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Integrationen suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-[300px]"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <div className="p-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Verbundene Integrationen</p>
                  <p className="text-2xl font-semibold mt-1">{connectedIntegrations.length}</p>
                </div>
                <div className="h-12 w-12 bg-success/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Verfügbare Integrationen</p>
                  <p className="text-2xl font-semibold mt-1">{availableIntegrations.length}</p>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <LinkIcon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Aktive Automatisierungen</p>
                  <p className="text-2xl font-semibold mt-1">
                    {connectedIntegrations.reduce((sum, int) => sum + int.automations, 0)}
                  </p>
                </div>
                <div className="h-12 w-12 bg-info/10 rounded-full flex items-center justify-center">
                  <Settings className="h-6 w-6 text-info" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Connected Integrations */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Verbundene Integrationen</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connectedIntegrations.map((integration) => {
              const Icon = integration.icon;
              return (
                <Card key={integration.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 ${integration.color} rounded-lg flex items-center justify-center`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{integration.name}</CardTitle>
                          <Badge variant="default" className="mt-1 bg-success/10 text-success border-success/20">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Verbunden
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {integration.description}
                    </p>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span>Letzter Sync:</span>
                        <span>{formatDate(integration.lastSync)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Automatisierungen:</span>
                        <span>{integration.automations}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Settings className="h-3 w-3 mr-1" />
                        Einstellungen
                      </Button>
                      <Button variant="ghost" size="sm">
                        Trennen
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Available Integrations */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Verfügbare Integrationen</h2>
            <div className="flex gap-2">
              <Badge variant="secondary">Alle</Badge>
              <Badge variant="outline">E-Mail</Badge>
              <Badge variant="outline">Speicher</Badge>
              <Badge variant="outline">Kommunikation</Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {availableIntegrations
              .filter(integration => 
                integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                integration.category.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((integration) => {
                const Icon = integration.icon;
                return (
                  <Card key={integration.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className={`h-10 w-10 ${integration.color} rounded-lg flex items-center justify-center`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        {integration.popular && (
                          <Badge variant="secondary" className="text-xs">
                            Beliebt
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-base">{integration.name}</CardTitle>
                      <CardDescription className="text-xs">{integration.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full" size="sm">
                        <Plus className="h-3 w-3 mr-1" />
                        Verbinden
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>

        {/* Request Integration */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="font-medium mb-2">Integration fehlt?</p>
              <p className="text-sm text-muted-foreground mb-4">
                Schlagen Sie eine neue Integration vor und wir prüfen die Umsetzung
              </p>
              <Button variant="outline">
                Integration vorschlagen
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
