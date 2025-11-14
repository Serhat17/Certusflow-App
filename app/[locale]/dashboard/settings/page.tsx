'use client';

import {useTranslations} from 'next-intl';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {Download, Trash2, Shield} from 'lucide-react';

export default function SettingsPage() {
  const t = useTranslations('settings');
  const tGdpr = useTranslations('gdpr');
  const tCommon = useTranslations('common');

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="px-8 py-6">
          <h1 className="text-2xl font-semibold">{t('title')}</h1>
        </div>
      </header>

      {/* Page Content */}
      <div className="p-8 max-w-4xl">
        <div className="space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle>{t('profile.title')}</CardTitle>
              <CardDescription>{t('profile.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" defaultValue="Max Mustermann" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input id="email" type="email" defaultValue="max@example.com" />
              </div>
              <Button>{tCommon('save')}</Button>
            </CardContent>
          </Card>

          {/* Language & Region */}
          <Card>
            <CardHeader>
              <CardTitle>{t('language.title')}</CardTitle>
              <CardDescription>{t('language.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('language.preferredLanguage')}</Label>
                <Select defaultValue="de">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                    <SelectItem value="en">🇬🇧 English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>{t('language.timezone')}</Label>
                <Select defaultValue="europe_berlin">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="europe_berlin">Europe/Berlin (CET)</SelectItem>
                    <SelectItem value="europe_london">Europe/London (GMT)</SelectItem>
                    <SelectItem value="america_new_york">America/New York (EST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>{t('language.currency')}</Label>
                <Select defaultValue="eur">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eur">EUR (€)</SelectItem>
                    <SelectItem value="usd">USD ($)</SelectItem>
                    <SelectItem value="gbp">GBP (£)</SelectItem>
                    <SelectItem value="chf">CHF (Fr.)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button>{tCommon('save')}</Button>
            </CardContent>
          </Card>

          {/* Privacy & GDPR */}
          <Card className="border-warning">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-warning" />
                <CardTitle>{t('privacy.title')}</CardTitle>
              </div>
              <CardDescription>{t('privacy.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* GDPR Info */}
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <h4 className="font-semibold mb-1">{tGdpr('dataAccess')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {tGdpr('dataAccessDescription')}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-1">{tGdpr('dataExport')}</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    {tGdpr('dataExportDescription')}
                  </p>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    {tGdpr('dataExportButton')}
                  </Button>
                </div>
              </div>
              
              {/* Danger Zone */}
              <div className="space-y-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div>
                  <h4 className="font-semibold mb-1 text-destructive">{tGdpr('dataDeletion')}</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    {tGdpr('dataDeletionDescription')}
                  </p>
                  <p className="text-sm font-medium mb-3">
                    {tGdpr('confirmation')}
                  </p>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    {tGdpr('dataDeletionButton')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
