'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Badge} from '@/components/ui/badge';
import Link from 'next/link';
import {
  Sparkles,
  FileText,
  Mail,
  Database,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Upload,
  Zap
} from 'lucide-react';

export default function DemoPage() {
  const t = useTranslations('demo');
  const tCommon = useTranslations('common');

  const [automationInput, setAutomationInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [selectedDemo, setSelectedDemo] = useState<'automation' | 'document' | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const demoExamples = [
    'Wenn eine Rechnung per E-Mail ankommt, extrahiere die Daten und speichere sie in Google Sheets',
    'Every Monday at 9 AM, send a summary email of all new customer orders',
    'Bei neuen Einträgen in der Datenbank, sende eine Benachrichtigung an Slack'
  ];

  const handleAutomationDemo = async () => {
    if (!automationInput.trim()) return;
    
    setIsProcessing(true);
    setResult(null);
    
    // Simulate AI processing
    setTimeout(() => {
      setResult({
        trigger: {
          type: 'email',
          condition: 'Neue E-Mail mit Anhang',
          icon: Mail
        },
        actions: [
          {
            type: 'extract',
            description: 'Rechnungsdaten extrahieren (KI)',
            icon: Sparkles
          },
          {
            type: 'database',
            description: 'In Google Sheets speichern',
            icon: Database
          }
        ],
        language: automationInput.includes('Monday') || automationInput.includes('email') ? 'en' : 'de'
      });
      setIsProcessing(false);
    }, 2000);
  };

  const handleDocumentDemo = async () => {
    setIsProcessing(true);
    setResult(null);
    
    // Simulate document processing
    setTimeout(() => {
      const fileName = uploadedFile ? uploadedFile.name : 'Rechnung_Acme_GmbH.pdf';
      setResult({
        document: fileName,
        extractedData: {
          'Rechnungsnummer': 'RE-2024-1234',
          'Datum': '15.01.2024',
          'Betrag': '1.234,56 EUR',
          'Lieferant': 'Acme GmbH',
          'MwSt': '234,56 EUR',
          'Zahlungsziel': '30 Tage'
        }
      });
      setIsProcessing(false);
    }, 2500);
  };

  const handleFileUpload = (file: File) => {
    // Check file type
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      alert('Bitte nur PDF, PNG oder JPG Dateien hochladen');
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Datei zu groß. Maximal 10MB erlaubt.');
      return;
    }

    setUploadedFile(file);
    setResult(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg">CertusFlow</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost">Anmelden</Button>
              </Link>
              <Link href="/signup">
                <Button>Kostenlos starten</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <Badge className="mb-4" variant="secondary">
          <Sparkles className="h-3 w-3 mr-1" />
          Live Demo
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Probieren Sie CertusFlow aus
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Erstellen Sie Automatisierungen in natürlicher Sprache oder verarbeiten Sie Dokumente mit KI. 
          Kein Login erforderlich.
        </p>
      </section>

      {/* Demo Selection */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedDemo === 'automation' ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedDemo('automation')}
          >
            <CardHeader>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>KI-Automatisierung erstellen</CardTitle>
              <CardDescription>
                Beschreiben Sie Ihre Automatisierung in natürlicher Sprache – auf Deutsch oder Englisch
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>Keine Programmierkenntnisse erforderlich</span>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedDemo === 'document' ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedDemo('document')}
          >
            <CardHeader>
              <div className="h-12 w-12 bg-success/10 rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-success" />
              </div>
              <CardTitle>Dokument verarbeiten</CardTitle>
              <CardDescription>
                Laden Sie eine Rechnung hoch und sehen Sie, wie KI automatisch Daten extrahiert
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>Mehrsprachige Erkennung</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Automation Demo */}
        {selectedDemo === 'automation' && (
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader>
              <CardTitle>Automatisierung in natürlicher Sprache</CardTitle>
              <CardDescription>
                Beschreiben Sie, was automatisiert werden soll. Die KI erstellt daraus eine fertige Automatisierung.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Input Area */}
              <div>
                <Label htmlFor="automation-input">Ihre Automatisierung</Label>
                <div className="mt-2 space-y-2">
                  <Input
                    id="automation-input"
                    placeholder="z.B. Wenn eine E-Mail mit Rechnung kommt, extrahiere die Daten..."
                    value={automationInput}
                    onChange={(e) => setAutomationInput(e.target.value)}
                    className="min-h-[80px] resize-y"
                    disabled={isProcessing}
                  />
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs text-muted-foreground">Beispiele:</span>
                    {demoExamples.map((example, idx) => (
                      <Button
                        key={idx}
                        variant="ghost"
                        size="sm"
                        className="h-auto py-1 px-2 text-xs"
                        onClick={() => setAutomationInput(example)}
                        disabled={isProcessing}
                      >
                        {example.slice(0, 50)}...
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <Button 
                className="w-full" 
                size="lg"
                onClick={handleAutomationDemo}
                disabled={!automationInput.trim() || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    KI verarbeitet...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Automatisierung erstellen
                  </>
                )}
              </Button>

              {/* Result */}
              {result && result.trigger && (
                <div className="space-y-4 p-6 bg-muted/50 rounded-lg border border-border animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <span className="font-semibold">Automatisierung erstellt!</span>
                    <Badge variant="secondary" className="ml-auto">
                      {result.language === 'de' ? '🇩🇪 Deutsch' : '🇬🇧 English'}
                    </Badge>
                  </div>

                  {/* Workflow Visualization */}
                  <div className="space-y-4">
                    {/* Trigger */}
                    <div className="flex items-start gap-4 p-4 bg-background rounded-lg border border-border">
                      <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <result.trigger.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Trigger</p>
                        <p className="text-sm text-muted-foreground">{result.trigger.condition}</p>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex justify-center">
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>

                    {/* Actions */}
                    {result.actions.map((action: any, idx: number) => (
                      <div key={idx}>
                        <div className="flex items-start gap-4 p-4 bg-background rounded-lg border border-border">
                          <div className="h-10 w-10 bg-success/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <action.icon className="h-5 w-5 text-success" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Aktion {idx + 1}</p>
                            <p className="text-sm text-muted-foreground">{action.description}</p>
                          </div>
                        </div>
                        {idx < result.actions.length - 1 && (
                          <div className="flex justify-center my-2">
                            <ArrowRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-border">
                    <Link href="/signup">
                      <Button className="w-full">
                        Jetzt kostenlos anmelden und Automatisierung speichern
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Document Demo */}
        {selectedDemo === 'document' && (
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader>
              <CardTitle>KI-Dokumentenverarbeitung</CardTitle>
              <CardDescription>
                Sehen Sie, wie unsere KI automatisch Daten aus Dokumenten extrahiert – in jeder Sprache.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Upload Area */}
              <div 
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer ${
                  isDragging 
                    ? 'border-primary bg-primary/5' 
                    : uploadedFile 
                      ? 'border-success bg-success/5' 
                      : 'border-border hover:border-primary/50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                
                {uploadedFile ? (
                  <>
                    <FileText className="h-12 w-12 text-success mx-auto mb-4" />
                    <p className="font-medium mb-1 text-success">✓ Datei ausgewählt</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDocumentDemo();
                        }} 
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verarbeite...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Jetzt verarbeiten
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadedFile(null);
                          setResult(null);
                        }}
                        disabled={isProcessing}
                      >
                        Andere Datei
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="font-medium mb-1">Dokument hochladen</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Ziehen Sie eine Datei hierher oder klicken Sie zum Durchsuchen
                    </p>
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>PDF, PNG, JPG bis zu 10MB</span>
                    </div>
                  </>
                )}
              </div>

              {/* Demo Button (wenn keine Datei hochgeladen) */}
              {!uploadedFile && (
                <div className="text-center">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Oder</span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={handleDocumentDemo} 
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verarbeite...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Demo-Rechnung verwenden
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Result */}
              {result && result.document && (
                <div className="space-y-4 p-6 bg-muted/50 rounded-lg border border-border animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <span className="font-semibold">Daten extrahiert!</span>
                    <Badge variant="secondary" className="ml-auto">
                      🇩🇪 Deutsch erkannt
                    </Badge>
                  </div>

                  <div className="p-4 bg-background rounded-lg border border-border">
                    <p className="text-sm font-medium mb-3">📄 {result.document}</p>
                    <div className="grid gap-3">
                      {Object.entries(result.extractedData).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                          <span className="text-sm text-muted-foreground">{key}</span>
                          <span className="text-sm font-medium">{value as string}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <Link href="/signup">
                      <Button className="w-full">
                        Kostenlos anmelden und unbegrenzt Dokumente verarbeiten
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Bereit loszulegen?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Erstellen Sie Ihr kostenloses Konto und automatisieren Sie Ihre Prozesse in wenigen Minuten.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg">
                  Kostenlos starten
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/">
                <Button size="lg" variant="outline">
                  Mehr erfahren
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
