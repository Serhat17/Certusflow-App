'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {supabase} from '@/lib/supabase/client';
import {Zap, ArrowRight, Loader2, Check} from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function SignupPage({params}: {params: Promise<{locale: string}>}) {
  const t = useTranslations('auth.signup');
  const tCommon = useTranslations('common');
  const tErrors = useTranslations('errors');
  const router = useRouter();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwörter stimmen nicht überein');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(tErrors('auth.weakPassword'));
      setLoading(false);
      return;
    }

    if (!agreeToTerms) {
      setError('Bitte akzeptieren Sie die Nutzungsbedingungen');
      setLoading(false);
      return;
    }

    try {
      const {locale} = await params;
      const {data, error: signUpError} = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/${locale}/dashboard`,
          data: {
            full_name: fullName,
            preferred_language: 'de',
          }
        }
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        // Create profile in profiles table
        const {error: profileError} = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: email,
            full_name: fullName,
            preferred_language: 'de',
            preferred_currency: 'EUR',
            preferred_timezone: 'Europe/Berlin',
            preferred_date_format: 'DD.MM.YYYY'
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Don't fail signup if profile creation fails
        }

        setSuccess(true);
        // Don't redirect - wait for email confirmation
      }
    } catch (err: any) {
      if (err.message.includes('already registered')) {
        setError(tErrors('auth.emailInUse'));
      } else {
        setError(err.message || tErrors('generic'));
      }
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-12 w-12 bg-success/10 rounded-full flex items-center justify-center">
                <Check className="h-6 w-6 text-success" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{t('confirmEmailTitle')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('confirmEmailMessage')}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>{email}</strong>
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={async () => {
                  const {locale} = await params;
                  router.push(`/${locale}/login`);
                }}
                className="mt-4"
              >
                {t('backToLogin')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Header */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="absolute top-4 left-4">
        <Link href="/" className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          <span className="text-xl font-semibold">{tCommon('appName')}</span>
        </Link>
      </div>

      {/* Signup Card */}
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">{t('title')}</CardTitle>
          <CardDescription>{t('subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName">{t('name')}</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Max Mustermann"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="max@beispiel.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
              <p className="text-xs text-muted-foreground">
                Mindestens 6 Zeichen
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="mt-1"
                disabled={loading}
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground">
                Ich akzeptiere die{' '}
                <Link href="/terms" className="text-primary hover:underline">
                  Nutzungsbedingungen
                </Link>
                {' '}und die{' '}
                <Link href="/privacy" className="text-primary hover:underline">
                  Datenschutzerklärung
                </Link>
              </label>
            </div>

            <Button type="submit" className="w-full" disabled={loading || !agreeToTerms}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {tCommon('loading')}
                </>
              ) : (
                <>
                  {t('submitButton')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">{t('hasAccount')} </span>
            <Link href="/login" className="text-primary hover:underline font-medium">
              {t('login')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
