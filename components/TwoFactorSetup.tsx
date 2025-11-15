'use client';

import { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Shield, Check, Copy, Download, AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';

type Step = 'check' | 'initial' | 'qr' | 'verify' | 'backup' | 'disable';

interface TwoFactorSetupProps {
  onStatusChange?: (enabled: boolean) => void;
}

export default function TwoFactorSetup({ onStatusChange }: TwoFactorSetupProps) {
  const t = useTranslations('settings.twoFactorSetup');
  const tCommon = useTranslations('common');
  
  const [step, setStep] = useState<Step>('check');
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [disableToken, setDisableToken] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedCodes, setCopiedCodes] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  async function checkStatus() {
    try {
      const res = await fetch('/api/auth/2fa/status', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Status check failed:', res.status, errorData);
        
        // If unauthorized, user is not logged in - show the component but disabled
        if (res.status === 401) {
          toast.error('Bitte melden Sie sich an, um 2FA zu aktivieren');
        }
        
        setStep('initial');
        return;
      }
      
      const data = await res.json();
      setIsEnabled(data.enabled);
      setStep(data.enabled ? 'initial' : 'initial');
    } catch (error) {
      console.error('Failed to check 2FA status:', error);
      setStep('initial');
    }
  }

  async function handleSetup() {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/2fa/setup', { 
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Setup failed');
      }
      
      setQrCodeUrl(data.qrCodeUrl);
      setSecret(data.secret);
      setStep('qr');
      toast.success(t('setupStarted'));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('setupFailed'));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerify() {
    if (token.length !== 6) {
      toast.error(t('invalidCode'));
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      setBackupCodes(data.backupCodes);
      setStep('backup');
      setIsEnabled(true);
      onStatusChange?.(true);
      toast.success(t('enabled'));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('verifyFailed'));
    } finally {
      setIsLoading(false);
      setToken('');
    }
  }

  async function handleDisable() {
    if (disableToken.length !== 6) {
      toast.error(t('invalidCode'));
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: disableToken })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Disable failed');
      }

      setIsEnabled(false);
      setStep('initial');
      onStatusChange?.(false);
      toast.success(t('disabled'));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('disableFailed'));
    } finally {
      setIsLoading(false);
      setDisableToken('');
    }
  }

  function copyBackupCodes() {
    const codesText = backupCodes.map((code, i) => `${i + 1}. ${formatCode(code)}`).join('\n');
    navigator.clipboard.writeText(codesText);
    setCopiedCodes(true);
    toast.success(t('codesCopied'));
    setTimeout(() => setCopiedCodes(false), 2000);
  }

  function downloadBackupCodes() {
    const codesText = backupCodes.map((code, i) => `${i + 1}. ${formatCode(code)}`).join('\n');
    const blob = new Blob([`CertusFlow 2FA Backup Codes\n\n${codesText}\n\nStore these codes securely!`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'certusflow-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(t('codesDownloaded'));
  }

  function formatCode(code: string): string {
    return code.match(/.{1,4}/g)?.join('-') || code;
  }

  // Initial state - show enable/disable button
  if (step === 'initial') {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>{t('title')}</CardTitle>
          </div>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-border/70 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {isEnabled ? t('statusEnabled') : t('statusDisabled')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isEnabled ? t('statusEnabledDesc') : t('statusDisabledDesc')}
                </p>
              </div>
              {isEnabled ? (
                <Button 
                  variant="outline" 
                  onClick={() => setStep('disable')}
                  disabled={isLoading}
                >
                  {t('disableButton')}
                </Button>
              ) : (
                <Button 
                  onClick={handleSetup}
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {t('enableButton')}
                </Button>
              )}
            </div>
          </div>

          {isEnabled && (
            <div className="bg-muted/50 rounded-lg p-4 text-sm">
              <p className="font-medium mb-1">{t('activeInfo')}</p>
              <p className="text-muted-foreground">{t('activeInfoDesc')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // QR Code step
  if (step === 'qr') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('scanQR')}</CardTitle>
          <CardDescription>{t('scanQRDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-6">
            <div className="bg-white p-4 rounded-lg">
              <QRCodeCanvas value={qrCodeUrl} size={200} />
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                {t('scanInstructions')}
              </p>
              <div className="text-xs font-mono bg-muted p-3 rounded max-w-xs break-all">
                {secret}
              </div>
              <p className="text-xs text-muted-foreground">
                {t('manualEntry')}
              </p>
            </div>

            <div className="w-full max-w-sm space-y-3">
              <Button 
                onClick={() => setStep('verify')} 
                className="w-full"
              >
                {t('continue')}
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setStep('initial')}
                className="w-full"
              >
                {tCommon('cancel')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Verify step
  if (step === 'verify') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('verifyCode')}</CardTitle>
          <CardDescription>{t('verifyCodeDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Input
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                maxLength={6}
                className="text-center text-2xl tracking-[0.5em] font-mono"
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground text-center">
                {t('enterCode')}
              </p>
            </div>

            <div className="space-y-2">
              <Button 
                onClick={handleVerify} 
                className="w-full"
                disabled={isLoading || token.length !== 6}
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {t('verifyButton')}
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setStep('qr')}
                className="w-full"
              >
                {tCommon('back')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Backup codes step
  if (step === 'backup') {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <CardTitle>{t('backupCodes')}</CardTitle>
          </div>
          <CardDescription>{t('backupCodesDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-muted/50 border border-border rounded-lg p-4">
              <div className="grid grid-cols-2 gap-3">
                {backupCodes.map((code, i) => (
                  <div 
                    key={i} 
                    className="font-mono text-sm bg-background p-2 rounded text-center border border-border/50"
                  >
                    {formatCode(code)}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={copyBackupCodes}
                className="flex-1"
              >
                {copiedCodes ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    {t('copied')}
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    {t('copyButton')}
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={downloadBackupCodes}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                {t('downloadButton')}
              </Button>
            </div>

            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-sm">
              <p className="font-medium text-destructive mb-1">{t('warning')}</p>
              <p className="text-muted-foreground">{t('warningDesc')}</p>
            </div>

            <Button 
              onClick={() => {
                setStep('initial');
                setBackupCodes([]);
              }}
              className="w-full"
            >
              {t('finish')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Disable step
  if (step === 'disable') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('disableTitle')}</CardTitle>
          <CardDescription>{t('disableDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-sm text-destructive font-medium">
                {t('disableWarning')}
              </p>
            </div>

            <div className="space-y-2">
              <Input
                value={disableToken}
                onChange={(e) => setDisableToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                maxLength={6}
                className="text-center text-2xl tracking-[0.5em] font-mono"
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground text-center">
                {t('enterCodeToDisable')}
              </p>
            </div>

            <div className="space-y-2">
              <Button 
                onClick={handleDisable} 
                variant="destructive"
                className="w-full"
                disabled={isLoading || disableToken.length !== 6}
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {t('confirmDisable')}
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setStep('initial')}
                className="w-full"
              >
                {tCommon('cancel')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
