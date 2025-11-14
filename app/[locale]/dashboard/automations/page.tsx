'use client';

import {useTranslations} from 'next-intl';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Plus, Play, Pause, Trash2, Edit} from 'lucide-react';

export default function AutomationsPage() {
  const t = useTranslations('automations');

  // Mock data
  const automations = [
    {
      id: '1',
      name: 'Rechnungsverarbeitung',
      description: 'Rechnungen in E-Mails erkennen, Daten extrahieren und in Tabelle einfügen',
      status: 'active',
      lastRun: 'Vor 2 Stunden',
      runs: 245,
      icon: '📧'
    },
    {
      id: '2',
      name: 'E-Mail zu Tabelle',
      description: 'E-Mails automatisch in Google Sheets übertragen',
      status: 'active',
      lastRun: 'Vor 5 Stunden',
      runs: 89,
      icon: '📊'
    },
    {
      id: '3',
      name: 'Backup Automatisierung',
      description: 'Tägliches Backup wichtiger Dokumente',
      status: 'paused',
      lastRun: 'Vor 1 Tag',
      runs: 30,
      icon: '💾'
    }
  ];

  const getStatusBadge = (status: string) => {
    const variants: any = {
      active: 'default',
      paused: 'secondary',
      error: 'destructive',
      draft: 'outline'
    };
    
    return (
      <Badge variant={variants[status] || 'default'}>
        {t(`status.${status}`)}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between px-8 py-6">
          <div>
            <h1 className="text-2xl font-semibold">{t('title')}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {automations.filter(a => a.status === 'active').length} aktive Automatisierungen
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t('createNew')}
          </Button>
        </div>
      </header>

      {/* Page Content */}
      <div className="p-8">
        {automations.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Play className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {t('noAutomations')}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              {t('noAutomationsDescription')}
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('createNew')}
            </Button>
          </div>
        ) : (
          // Automations List
          <div className="space-y-4">
            {automations.map((automation) => (
              <Card key={automation.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-2xl">
                      {automation.icon}
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold">
                        {automation.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {automation.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {getStatusBadge(automation.status)}
                  </div>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <span>{t('list.lastRun')}: {automation.lastRun}</span>
                    <span>{automation.runs} {t('list.runs')}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      {automation.status === 'active' ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
