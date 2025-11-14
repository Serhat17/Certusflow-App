'use client';

import {useTranslations} from 'next-intl';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Plus, Zap, FileText, Clock, TrendingUp} from 'lucide-react';

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');

  // Mock data
  const stats = [
    {
      label: t('stats.totalRuns'),
      value: '1,234',
      icon: Zap,
      trend: '+12%'
    },
    {
      label: t('stats.activeAutomations'),
      value: '8',
      icon: TrendingUp,
      trend: '+2'
    },
    {
      label: t('stats.documentsProcessed'),
      value: '456',
      icon: FileText,
      trend: '+34%'
    },
    {
      label: t('stats.timeSaved'),
      value: '24h',
      icon: Clock,
      trend: '+8h'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between px-8 py-6">
          <div>
            <h1 className="text-2xl font-semibold">{t('title')}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t('welcome', {name: 'Max Mustermann'})}
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Neue Automatisierung
          </Button>
        </div>
      </header>

      {/* Page Content */}
      <div className="p-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-semibold mt-1">{stat.value}</p>
                      <p className="text-xs text-success mt-1">{stat.trend}</p>
                    </div>
                    <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Letzte Aktivitäten</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="h-10 w-10 bg-success/10 rounded-lg flex items-center justify-center">
                      ✓
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Rechnungsverarbeitung</p>
                      <p className="text-xs text-muted-foreground">Erfolgreich ausgeführt • Vor 2 Stunden</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      📧
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">E-Mail zu Tabelle</p>
                      <p className="text-xs text-muted-foreground">Erfolgreich ausgeführt • Vor 5 Stunden</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="h-10 w-10 bg-warning/10 rounded-lg flex items-center justify-center">
                      ⚠
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Backup Automatisierung</p>
                      <p className="text-xs text-muted-foreground">Warnung • Vor 1 Tag</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Neue Automatisierung
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Dokument hochladen
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Zap className="h-4 w-4 mr-2" />
                  Integration hinzufügen
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
