'use client';

import {FormEvent, useMemo, useState} from 'react';
import {useTranslations} from 'next-intl';
import {useParams} from 'next/navigation';
import {toast} from 'sonner';

import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {cn} from '@/lib/utils';
import {Plus, Play, Pause, Trash2, Edit, Sparkles} from 'lucide-react';

export default function AutomationsPage() {
  const t = useTranslations('automations');
  const params = useParams();
  const locale = (params?.locale as string) || 'de';
  const language: 'de' | 'en' = locale.startsWith('en') ? 'en' : 'de';
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState<null | {
    workflow_config: any;
    suggested_name: string;
    confidence: number;
  }>(null);
  const [isGenerating, setIsGenerating] = useState(false);

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

  const templateOptions = useMemo(
    () => [
      {
        id: 'invoice_to_sheet',
        icon: '📄',
        title: t('createDialog.templates.invoiceToSheet.title'),
        description: t('createDialog.templates.invoiceToSheet.description'),
        category: t('createDialog.templates.categories.finance'),
        gdpr: t('createDialog.templates.invoiceToSheet.gdpr'),
        integrations: ['Gmail', 'Google Sheets'],
        time: '5 min'
      },
      {
        id: 'contract_alerts',
        icon: '📁',
        title: t('createDialog.templates.contractAlerts.title'),
        description: t('createDialog.templates.contractAlerts.description'),
        category: t('createDialog.templates.categories.legal'),
        gdpr: t('createDialog.templates.contractAlerts.gdpr'),
        integrations: ['Dropbox', 'Slack'],
        time: '8 min'
      },
      {
        id: 'support_escalation',
        icon: '🆘',
        title: t('createDialog.templates.supportEscalation.title'),
        description: t('createDialog.templates.supportEscalation.description'),
        category: t('createDialog.templates.categories.communication'),
        gdpr: t('createDialog.templates.supportEscalation.gdpr'),
        integrations: ['Slack', 'Teams'],
        time: '6 min'
      },
      {
        id: 'daily_digest',
        icon: '📊',
        title: t('createDialog.templates.dailyDigest.title'),
        description: t('createDialog.templates.dailyDigest.description'),
        category: t('createDialog.templates.categories.operations'),
        gdpr: t('createDialog.templates.dailyDigest.gdpr'),
        integrations: ['Google Sheets', 'Email'],
        time: '4 min'
      }
    ],
    [t]
  );

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setIsCreateDialogOpen(false);
    toast.success(t('createDialog.toast.templateReady'));
  };

  const handleAiSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);
    setAiResult(null);

    try {
      const response = await fetch('/api/automations/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: aiPrompt.trim(),
          locale: language
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'AI request failed');
      }

      setAiResult(data.automation);
      toast.success(t('createDialog.toast.aiReady'));
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'AI request failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyAiSuggestion = () => {
    if (!aiResult) return;
    setIsCreateDialogOpen(false);
    toast.success(t('createDialog.toast.aiReady'));
  };

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
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t('createNew')}
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[min(1150px,calc(100vw-1rem))] max-h-[92vh] overflow-hidden p-0 origin-top-right data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-top-4 data-[state=open]:slide-in-from-right-2 data-[state=open]:duration-250 data-[state=open]:ease-out data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-90 data-[state=closed]:slide-out-to-top-2 data-[state=closed]:slide-out-to-right-2">
              <div className="flex max-h-[92vh] flex-col">
                <DialogHeader className="space-y-2 px-6 pt-6">
                <DialogTitle>{t('createDialog.title')}</DialogTitle>
                <DialogDescription>
                  {t('createDialog.description')}
                </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-6 pb-6">
                  <div className="grid gap-6 lg:grid-cols-[2fr,1.1fr]">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {t('createDialog.templates.title')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t('createDialog.templates.subtitle')}
                        </p>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {templateOptions.map((template) => (
                          <Card
                            key={template.id}
                            className={cn(
                              'p-4 cursor-pointer border transition-shadow hover:shadow-md min-h-[260px]',
                              selectedTemplateId === template.id && 'border-primary shadow-lg'
                            )}
                            onClick={() => handleTemplateSelect(template.id)}
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <div className="text-2xl" aria-hidden>
                                {template.icon}
                              </div>
                              <div>
                                <p className="text-sm font-semibold leading-tight">
                                  {template.title}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {template.category} · {template.time}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {template.description}
                            </p>
                            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-2">
                              {template.integrations.map((integration) => (
                                <Badge key={integration} variant="secondary">
                                  {integration}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Sparkles className="h-3 w-3" />
                              {template.gdpr}
                            </p>
                            <Button
                              className="mt-4 w-full"
                              variant={selectedTemplateId === template.id ? 'default' : 'secondary'}
                            >
                              {selectedTemplateId === template.id
                                ? t('createDialog.buttons.selected')
                                : t('createDialog.buttons.useTemplate')}
                            </Button>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Card className="p-4">
                        <div className="space-y-2 mb-4">
                          <p className="text-sm font-semibold">
                            {t('createDialog.ai.title')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t('createDialog.ai.subtitle')}
                          </p>
                        </div>
                        <form className="space-y-3" onSubmit={handleAiSubmit}>
                          <textarea
                            value={aiPrompt}
                            onChange={(event) => setAiPrompt(event.target.value)}
                            className="w-full rounded-md border border-border bg-background p-3 text-sm min-h-[140px] resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder={t('createDialog.ai.placeholder')}
                          />
                          <p className="text-xs text-muted-foreground">
                            {t('createDialog.ai.helper')}
                          </p>
                          <Button
                            type="submit"
                            className="w-full"
                            disabled={!aiPrompt.trim() || isGenerating}
                          >
                            {isGenerating
                              ? t('createDialog.buttons.aiGenerating')
                              : t('createDialog.buttons.aiGenerate')}
                          </Button>
                        </form>
                      </Card>

                      {aiResult && (
                        <Card className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold">
                                {t('createDialog.ai.resultTitle')}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {aiResult.suggested_name}
                              </p>
                            </div>
                            <Badge variant="secondary">
                              {t('createDialog.ai.confidence', {
                                value: Math.round((aiResult.confidence ?? 0) * 100)
                              })}
                            </Badge>
                          </div>
                          <pre className="bg-muted rounded-md p-3 text-xs overflow-x-auto max-h-48">
                            {JSON.stringify(aiResult.workflow_config, null, 2)}
                          </pre>
                          <Button className="w-full" onClick={handleApplyAiSuggestion}>
                            {t('createDialog.buttons.acceptSuggestion')}
                          </Button>
                          <p className="text-[11px] text-muted-foreground">
                            {t('createDialog.ai.gdpr')}
                          </p>
                        </Card>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
