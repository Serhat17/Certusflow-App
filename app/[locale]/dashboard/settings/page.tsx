'use client';

import {useTranslations} from 'next-intl';
import {useState, useEffect} from 'react';
import {useRouter, useParams} from 'next/navigation';
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
import {Download, Trash2, Shield, Loader2} from 'lucide-react';
import {createClient} from '@/lib/supabase/client';
import {toast} from 'sonner';
import {Checkbox} from '@/components/ui/checkbox';
import TwoFactorSetup from '@/components/TwoFactorSetup';

export default function SettingsPage() {
  const t = useTranslations('settings');
  const tGdpr = useTranslations('gdpr');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const params = useParams();
  const currentLocale = (params.locale as string) || 'de';
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingScanner, setIsUpdatingScanner] = useState(false);
  const [isUpdatingSecurity, setIsUpdatingSecurity] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    preferred_language: 'de',
    preferred_timezone: 'Europe/Berlin',
    preferred_currency: 'EUR'
  });
  const [scannerSettings, setScannerSettings] = useState({
    retentionPeriod: 'd30',
    defaultDeletion: 'days30',
    anonymizeDocuments: true
  });
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    sessionTimeout: 'h24'
  });
  const [activeSessions, setActiveSessions] = useState(() => {
    const isEnglish = currentLocale?.startsWith('en');
    return [
      {
        id: 'current',
        device: isEnglish ? 'MacBook Pro · Safari' : 'MacBook Pro · Safari',
        location: isEnglish ? 'Berlin, Germany' : 'Berlin, Deutschland',
        lastActive: isEnglish ? 'just now' : 'gerade eben',
        current: true
      },
      {
        id: 'ios',
        device: isEnglish ? 'iPhone 15 · CertusFlow App' : 'iPhone 15 · CertusFlow App',
        location: isEnglish ? 'Hamburg, Germany' : 'Hamburg, Deutschland',
        lastActive: isEnglish ? '1 day ago' : 'vor 1 Tag',
        current: false
      },
      {
        id: 'office',
        device: isEnglish ? 'Windows · Edge' : 'Windows · Edge',
        location: isEnglish ? 'Munich, Germany' : 'München, Deutschland',
        lastActive: isEnglish ? '7 days ago' : 'vor 7 Tagen',
        current: false
      }
    ];
  });

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Try to get profile from profiles table
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile({
          full_name: profileData.full_name || '',
          email: profileData.email || user.email || '',
          preferred_language: profileData.preferred_language || 'de',
          preferred_timezone: profileData.preferred_timezone || 'Europe/Berlin',
          preferred_currency: profileData.preferred_currency || 'EUR'
        });
      } else {
        // If no profile exists, use auth user data
        setProfile({
          full_name: user.user_metadata?.full_name || '',
          email: user.email || '',
          preferred_language: user.user_metadata?.preferred_language || 'de',
          preferred_timezone: 'Europe/Berlin',
          preferred_currency: 'EUR'
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveScannerSettings() {
    setIsUpdatingScanner(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      toast.success(t('contractScanner.saveSuccess'));
    } catch (error) {
      console.error('Failed to save scanner settings:', error);
      toast.error(tCommon('error'));
    } finally {
      setIsUpdatingScanner(false);
    }
  }

  async function handleSaveSecuritySettings() {
    setIsUpdatingSecurity(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      toast.success(t('security.toastSecuritySaved'));
    } catch (error) {
      console.error('Failed to save security settings:', error);
      toast.error(tCommon('error'));
    } finally {
      setIsUpdatingSecurity(false);
    }
  }

  const handleToggleTwoFactor = () => {
    setSecuritySettings((prev) => {
      const nextValue = !prev.twoFactorEnabled;
      toast.success(nextValue ? t('security.toast2faOn') : t('security.toast2faOff'));
      return {...prev, twoFactorEnabled: nextValue};
    });
  };

  const handleRevokeSession = (sessionId: string) => {
    setActiveSessions((sessions) => sessions.filter((session) => session.id !== sessionId));
    toast.success(t('security.toastSessionsRevoked'));
  };

  const handleRevokeOtherSessions = () => {
    setActiveSessions((sessions) => sessions.filter((session) => session.current));
    toast.success(t('security.sessions.revokeAllSuccess'));
  };

  async function handleSaveProfile() {
    setIsSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const oldLanguage = currentLocale;
      const newLanguage = profile.preferred_language;

      // Update or insert profile
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: profile.email,
          full_name: profile.full_name,
          preferred_language: profile.preferred_language,
          preferred_timezone: profile.preferred_timezone,
          preferred_currency: profile.preferred_currency,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (!error) {
        toast.success('Profil erfolgreich gespeichert!');
        
        // If language changed, redirect to new locale
        if (oldLanguage !== newLanguage) {
          setTimeout(() => {
            router.push(`/${newLanguage}/dashboard/settings`);
            router.refresh();
          }, 500);
        }
      } else {
        toast.error('Fehler beim Speichern des Profils');
        console.error(error);
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast.error('Fehler beim Speichern des Profils');
    } finally {
      setIsSaving(false);
    }
  }

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
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input 
                      id="name" 
                      value={profile.full_name}
                      onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                      placeholder="Ihr Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-Mail</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                      placeholder="ihre.email@example.com"
                    />
                  </div>
                  <Button onClick={handleSaveProfile} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Wird gespeichert...
                      </>
                    ) : (
                      tCommon('save')
                    )}
                  </Button>
                </>
              )}
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
                <Select 
                  value={profile.preferred_language}
                  onValueChange={(value) => setProfile({...profile, preferred_language: value})}
                >
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
                <Select 
                  value={profile.preferred_timezone}
                  onValueChange={(value) => setProfile({...profile, preferred_timezone: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Europe/Berlin">Europe/Berlin (CET)</SelectItem>
                    <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                    <SelectItem value="America/New_York">America/New York (EST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>{t('language.currency')}</Label>
                <Select 
                  value={profile.preferred_currency}
                  onValueChange={(value) => setProfile({...profile, preferred_currency: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="CHF">CHF (Fr.)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Wird gespeichert...
                  </>
                ) : (
                  tCommon('save')
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Contract Scanner Controls */}
          <Card>
            <CardHeader>
              <CardTitle>{t('contractScanner.title')}</CardTitle>
              <CardDescription>{t('contractScanner.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>{t('contractScanner.retentionLabel')}</Label>
                <Select
                  value={scannerSettings.retentionPeriod}
                  onValueChange={(value) => setScannerSettings((prev) => ({...prev, retentionPeriod: value}))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="h24">{t('contractScanner.retentionOptions.h24')}</SelectItem>
                    <SelectItem value="d7">{t('contractScanner.retentionOptions.d7')}</SelectItem>
                    <SelectItem value="d30">{t('contractScanner.retentionOptions.d30')}</SelectItem>
                    <SelectItem value="d90">{t('contractScanner.retentionOptions.d90')}</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">{t('contractScanner.retentionHint')}</p>
              </div>

              <div className="space-y-2">
                <Label>{t('contractScanner.deletionLabel')}</Label>
                <Select
                  value={scannerSettings.defaultDeletion}
                  onValueChange={(value) => setScannerSettings((prev) => ({...prev, defaultDeletion: value}))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">{t('contractScanner.deletionOptions.immediate')}</SelectItem>
                    <SelectItem value="days30">{t('contractScanner.deletionOptions.days30')}</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">{t('contractScanner.deletionHint')}</p>
              </div>

              <div className="flex items-start gap-3 rounded-md border border-border/70 p-4">
                <Checkbox
                  id="scanner-anonymize"
                  checked={scannerSettings.anonymizeDocuments}
                  onCheckedChange={(checked) =>
                    setScannerSettings((prev) => ({...prev, anonymizeDocuments: checked === true}))
                  }
                  className="mt-1"
                />
                <div className="space-y-1">
                  <Label htmlFor="scanner-anonymize">{t('contractScanner.anonymizationLabel')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('contractScanner.anonymizationDescription')}
                  </p>
                </div>
              </div>

              <Button onClick={handleSaveScannerSettings} disabled={isUpdatingScanner}>
                {isUpdatingScanner ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {tCommon('loading')}
                  </>
                ) : (
                  tCommon('save')
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Security & Privacy */}
          <Card>
            <CardHeader>
              <CardTitle>{t('security.title')}</CardTitle>
              <CardDescription>{t('security.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 2FA Component replaces the old toggle */}
              <TwoFactorSetup 
                onStatusChange={(enabled) => {
                  setSecuritySettings((prev) => ({...prev, twoFactorEnabled: enabled}));
                }}
              />

              <div className="space-y-2">
                <Label>{t('security.sessionTimeoutLabel')}</Label>
                <Select
                  value={securitySettings.sessionTimeout}
                  onValueChange={(value) => setSecuritySettings((prev) => ({...prev, sessionTimeout: value}))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="h8">{t('security.sessionTimeoutOptions.h8')}</SelectItem>
                    <SelectItem value="h24">{t('security.sessionTimeoutOptions.h24')}</SelectItem>
                    <SelectItem value="d7">{t('security.sessionTimeoutOptions.d7')}</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">{t('security.sessionTimeoutHint')}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{t('security.sessions.title')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t('security.sessions.description')}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleRevokeOtherSessions}>
                    {t('security.sessions.revokeAll')}
                  </Button>
                </div>

                <div className="space-y-3">
                  {activeSessions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t('security.sessions.empty')}</p>
                  ) : (
                    activeSessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex flex-col gap-2 rounded-md border border-border/60 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="font-medium">
                            {session.device}
                            {session.current && (
                              <span className="ml-2 text-xs font-semibold uppercase text-primary">
                                {t('security.sessions.current')}
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {session.location}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t('security.sessions.lastActive')}: {session.lastActive}
                          </p>
                        </div>
                        {!session.current && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevokeSession(session.id)}
                          >
                            {t('security.sessions.revoke')}
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <Button onClick={handleSaveSecuritySettings} disabled={isUpdatingSecurity}>
                {isUpdatingSecurity ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {tCommon('loading')}
                  </>
                ) : (
                  tCommon('save')
                )}
              </Button>
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
