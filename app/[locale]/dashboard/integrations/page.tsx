'use client';

import {useState, useEffect} from 'react';
import {useTranslations} from 'next-intl';
import {useSearchParams, useRouter} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Input} from '@/components/ui/input';
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import PermissionSelector from '@/components/PermissionSelector';
import {createClient} from '@/lib/supabase/client';
import {toast} from 'sonner';
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
  ExternalLink,
  Shield
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
  const [disconnectDialog, setDisconnectDialog] = useState<{open: boolean, integration: any | null}>({
    open: false,
    integration: null
  });
  const [permissionDialog, setPermissionDialog] = useState<{
    open: boolean,
    provider: string | null,
    providerName: string,
    existingPermissions?: string[]
  }>({
    open: false,
    provider: null,
    providerName: '',
    existingPermissions: undefined
  });

  useEffect(() => {
    loadConnectedIntegrations();

    // Handle OAuth callback notifications
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success) {
      toast.success(`${success} wurde erfolgreich verbunden!`);
      loadConnectedIntegrations();
      // Clear URL params
      router.replace('/dashboard/integrations');
    }

    if (error) {
      toast.error(`Verbindung fehlgeschlagen: ${error}`);
      // Clear URL params
      router.replace('/dashboard/integrations');
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
        .eq('is_connected', true);

      if (!error && data) {
        setConnectedIntegrations(data);
      }
    } catch (error) {
      console.error('Failed to load integrations:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleConnectClick(provider: string, providerName: string) {
    setPermissionDialog({
      open: true,
      provider,
      providerName,
      existingPermissions: undefined
    });
  }

  async function handleConnect(provider: string, selectedPermissions: string[]) {
    setConnectingProvider(provider);
    
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Bitte melden Sie sich zuerst an');
        setConnectingProvider(null);
        return;
      }
      
      // Pass permissions as query parameter
      const permissionsParam = encodeURIComponent(JSON.stringify(selectedPermissions));
      const connectUrl = `/api/oauth/connect/${provider}?access_token=${session.access_token}&permissions=${permissionsParam}`;
      window.location.href = connectUrl;
    } catch (error) {
      console.error('Failed to initiate OAuth:', error);
      toast.error('Fehler beim Starten der Verbindung');
      setConnectingProvider(null);
    }
  }

  async function handleDisconnect(integration: any) {
    setDisconnectDialog({ open: true, integration });
  }

  function handleEditPermissions(integration: any) {
    // Parse existing permissions from integration
    const existingPerms = integration.permissions ? JSON.parse(integration.permissions) : undefined;
    setPermissionDialog({
      open: true,
      provider: integration.service_name,
      providerName: integration.service_name,
      existingPermissions: existingPerms
    });
  }

  async function confirmDisconnect() {
    if (!disconnectDialog.integration) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('integrations')
        .update({ is_connected: false, connection_status: 'disconnected' })
        .eq('id', disconnectDialog.integration.id);

      if (!error) {
        toast.success(`${disconnectDialog.integration.service_name} wurde erfolgreich getrennt`);
        loadConnectedIntegrations();
      }
      setDisconnectDialog({ open: false, integration: null });
    } catch (error) {
      console.error('Failed to disconnect:', error);
      toast.error('Fehler beim Trennen der Integration');
      setDisconnectDialog({ open: false, integration: null });
    }
  }

  function handleRequestIntegration() {
    // Open email client or external form
    window.open('mailto:support@certusflow.com?subject=Integration%20Vorschlag&body=Ich%20möchte%20folgende%20Integration%20vorschlagen:%0A%0AName:%0ABeschreibung:%0AWarum%20diese%20Integration:%0A', '_blank');
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
    icon: integrationIcons[integration.service_name] || LinkIcon,
    color: integrationColors[integration.service_name] || 'bg-gray-500',
    lastSync: integration.last_connected_at
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
                            <CardTitle className="text-base">{integration.service_name}</CardTitle>
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
                        {integration.config_data?.email && (
                          <div className="flex items-center justify-between">
                            <span>Konto:</span>
                            <span className="font-medium">{integration.config_data.email}</span>
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
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleEditPermissions(integration)}
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          Berechtigungen
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDisconnect(integration)}
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
                  (conn: any) => conn.service_name === integration.id
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
                          onClick={() => handleConnectClick(integration.id, integration.name)}
                          disabled={isConnecting}
                        >
                          {isConnecting ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Verbinde...
                            </>
                          ) : (
                            <>
                              <Shield className="h-3 w-3 mr-1" />
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
        <div className="mt-8">
          <Card className="border-dashed border-2 bg-muted/30">
            <CardContent className="py-8">
              <div className="text-center">
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Integration fehlt?</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                  Schlagen Sie eine neue Integration vor und wir prüfen die Umsetzung
                </p>
                <Button variant="default" size="lg" onClick={handleRequestIntegration}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Integration vorschlagen
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Disconnect Confirmation Dialog */}
        <Dialog open={disconnectDialog.open} onOpenChange={(open) => setDisconnectDialog({ open, integration: null })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Integration trennen?</DialogTitle>
              <DialogDescription>
                Möchten Sie die Verbindung zu <strong>{disconnectDialog.integration?.service_name}</strong> wirklich trennen?
                {disconnectDialog.integration?.config_data?.email && (
                  <span className="block mt-2 text-sm">
                    Verbundenes Konto: {disconnectDialog.integration.config_data.email}
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDisconnectDialog({ open: false, integration: null })}
              >
                Abbrechen
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDisconnect}
              >
                Trennen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Permission Selector Dialog */}
        {permissionDialog.provider && (
          <PermissionSelector
            integrationType={permissionDialog.provider}
            integrationName={permissionDialog.providerName}
            open={permissionDialog.open}
            onOpenChange={(open) => setPermissionDialog({ ...permissionDialog, open })}
            onConfirm={(selectedPermissions) => handleConnect(permissionDialog.provider!, selectedPermissions)}
            existingPermissions={permissionDialog.existingPermissions}
          />
        )}
      </div>
    </div>
  );
}
