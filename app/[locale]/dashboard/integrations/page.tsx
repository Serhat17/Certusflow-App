'use client';

import {useState, useEffect} from 'react';
import {useTranslations} from 'next-intl';
import {useSearchParams, useRouter} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Input} from '@/components/ui/input';
import {createClient} from '@/lib/supabase/client';
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
  Link as LinkIcon,
  Loader2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

export default function IntegrationsPage() {
  const t = useTranslations('integrations');
  const tCommon = useTranslations('common');
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [connectedIntegrations, setConnectedIntegrations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  useEffect(() => {
    loadConnectedIntegrations();

    // Handle OAuth callback notifications
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success) {
      setNotification({
        type: 'success',
        message: `${success} wurde erfolgreich verbunden!`
      });
      loadConnectedIntegrations();
      // Clear URL params
      router.replace('/dashboard/integrations');
    }

    if (error) {
      setNotification({
        type: 'error',
        message: `Verbindung fehlgeschlagen: ${error}`
      });
      // Clear URL params
      router.replace('/dashboard/integrations');
    }

    // Auto-hide notification after 5 seconds
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  async function loadConnectedIntegrations() {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (!error && data) {
        setConnectedIntegrations(data);
      }
    } catch (error) {
      console.error('Failed to load integrations:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleConnect(provider: string) {
    setConnectingProvider(provider);
    // Redirect to OAuth flow
    window.location.href = `/api/oauth/connect/${provider}`;
  }

  async function handleDisconnect(integrationId: string) {
    if (!confirm('Möchten Sie diese Integration wirklich trennen?')) {
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('integrations')
        .update({ status: 'disconnected' })
        .eq('id', integrationId);

      if (!error) {
        setNotification({
          type: 'success',
          message: 'Integration wurde getrennt'
        });
        loadConnectedIntegrations();
      }
    } catch (error) {
      console.error('Failed to disconnect:', error);
      setNotification({
        type: 'error',
        message: 'Fehler beim Trennen der Integration'
      });
    }
  }

  // Map database integrations to display format
  const integrationIcons: Record<string, any> = {
    'gmail': Mail,
    'outlook': Mail,
    'slack': MessageSquare,
    'google-sheets': FileText,
    'google-calendar': Calendar,
    'microsoft-teams': MessageSquare,
    'dropbox': Cloud,
    'onedrive': Cloud
  };

  const integrationColors: Record<string, string> = {
    'gmail': 'bg-red-500',
    'outlook': 'bg-blue-500',
    'slack': 'bg-purple-500',
    'google-sheets': 'bg-green-500',
    'google-calendar': 'bg-blue-600',
    'microsoft-teams': 'bg-indigo-500',
    'dropbox': 'bg-blue-400',
    'onedrive': 'bg-blue-500'
  };

  const displayConnectedIntegrations = connectedIntegrations.map(integration => ({
    ...integration,
    icon: integrationIcons[integration.provider] || LinkIcon,
    color: integrationColors[integration.provider] || 'bg-gray-500',
    lastSync: integration.last_sync_at
  }));

  const availableIntegrations = [
    {
      id: 'gmail',
      name: 'Gmail',
      description: 'E-Mail-Integration für automatische Verarbeitung',
      icon: Mail,
      category: 'E-Mail',
      color: 'bg-red-500',
      popular: true
    },
    {
      id: 'outlook',
      name: 'Microsoft Outlook',
      description: 'E-Mail-Integration für Office 365',
      icon: Mail,
      category: 'E-Mail',
      color: 'bg-blue-500',
      popular: true
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Team-Kommunikation und Benachrichtigungen',
      icon: MessageSquare,
      category: 'Kommunikation',
      color: 'bg-purple-500',
      popular: true
    },
    {
      id: 'google-sheets',
      name: 'Google Sheets',
      description: 'Speichern Sie extrahierte Daten in Tabellen',
      icon: FileText,
      category: 'Produktivität',
      color: 'bg-green-500',
      popular: true
    },
    {
      id: 'dropbox',
      name: 'Dropbox',
      description: 'Cloud-Speicher für Dokumente',
      icon: Cloud,
      category: 'Speicher',
      color: 'bg-blue-400',
      popular: false
    },
    {
      id: 'microsoft-teams',
      name: 'Microsoft Teams',
      description: 'Team-Kommunikation und Benachrichtigungen',
      icon: MessageSquare,
      category: 'Kommunikation',
      color: 'bg-indigo-500',
      popular: true
    },
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      description: 'Termine und Erinnerungen automatisieren',
      icon: Calendar,
      category: 'Produktivität',
      color: 'bg-blue-600',
      popular: false
    },
    {
      id: 'onedrive',
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
        {/* Notification */}
        {notification && (
          <div className={`mb-6 p-4 rounded-lg border flex items-center gap-3 ${
            notification.type === 'success' 
              ? 'bg-success/10 border-success/20 text-success' 
              : 'bg-destructive/10 border-destructive/20 text-destructive'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <p className="font-medium">{notification.message}</p>
            <button 
              onClick={() => setNotification(null)}
              className="ml-auto hover:opacity-70"
            >
              ✕
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Verbundene Integrationen</p>
                  <p className="text-2xl font-semibold mt-1">{displayConnectedIntegrations.length}</p>
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
                    {displayConnectedIntegrations.reduce((sum: number, int: any) => sum + (int.automations || 0), 0)}
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
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : displayConnectedIntegrations.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <LinkIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Noch keine Integrationen verbunden</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Verbinden Sie Ihre Tools unten, um zu starten
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayConnectedIntegrations.map((integration) => {
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
                            <CardTitle className="text-base">{integration.provider}</CardTitle>
                            <Badge variant="default" className="mt-1 bg-success/10 text-success border-success/20">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Verbunden
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-xs text-muted-foreground">
                        {integration.connected_account && (
                          <div className="flex items-center justify-between">
                            <span>Konto:</span>
                            <span className="font-medium">{integration.connected_account}</span>
                          </div>
                        )}
                        {integration.lastSync && (
                          <div className="flex items-center justify-between">
                            <span>Letzter Sync:</span>
                            <span>{formatDate(integration.lastSync)}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Settings className="h-3 w-3 mr-1" />
                          Einstellungen
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDisconnect(integration.id)}
                        >
                          Trennen
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
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
                const isConnecting = connectingProvider === integration.id;
                const isConnected = displayConnectedIntegrations.some(
                  (conn: any) => conn.provider === integration.id
                );

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
                      {isConnected ? (
                        <Button className="w-full" size="sm" variant="outline" disabled>
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Verbunden
                        </Button>
                      ) : (
                        <Button 
                          className="w-full" 
                          size="sm"
                          onClick={() => handleConnect(integration.id)}
                          disabled={isConnecting}
                        >
                          {isConnecting ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Verbinde...
                            </>
                          ) : (
                            <>
                              <Plus className="h-3 w-3 mr-1" />
                              Verbinden
                            </>
                          )}
                        </Button>
                      )}
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
