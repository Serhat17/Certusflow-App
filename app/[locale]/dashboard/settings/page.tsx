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

export default function SettingsPage() {
  const t = useTranslations('settings');
  const tGdpr = useTranslations('gdpr');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const params = useParams();
  const currentLocale = params.locale as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    preferred_language: 'de',
    preferred_timezone: 'Europe/Berlin',
    preferred_currency: 'EUR'
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
