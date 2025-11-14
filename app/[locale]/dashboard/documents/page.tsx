'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Input} from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  FileText,
  Upload,
  Search,
  Download,
  Eye,
  Trash2,
  Calendar,
  FileCheck,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function DocumentsPage() {
  const t = useTranslations('documents');
  const tCommon = useTranslations('common');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Mock data
  const documents = [
    {
      id: '1',
      filename: 'Rechnung_Acme_GmbH_2024.pdf',
      type: 'invoice',
      status: 'processed',
      uploadedAt: '2024-01-15T10:30:00Z',
      language: 'de',
      extractedFields: 6,
      invoiceNumber: 'RE-2024-1234',
      amount: '1.234,56 EUR'
    },
    {
      id: '2',
      filename: 'Invoice_TechCorp_Jan.pdf',
      type: 'invoice',
      status: 'processed',
      uploadedAt: '2024-01-14T14:20:00Z',
      language: 'en',
      extractedFields: 6,
      invoiceNumber: 'INV-2024-5678',
      amount: '$2,450.00'
    },
    {
      id: '3',
      filename: 'Lieferschein_2024_001.pdf',
      type: 'delivery_note',
      status: 'processing',
      uploadedAt: '2024-01-15T16:45:00Z',
      language: 'de',
      extractedFields: 0
    },
    {
      id: '4',
      filename: 'Bestellung_Büromaterial.pdf',
      type: 'invoice',
      status: 'error',
      uploadedAt: '2024-01-13T09:15:00Z',
      language: 'de',
      extractedFields: 0,
      error: 'Dokument unleserlich'
    },
    {
      id: '5',
      filename: 'Quote_Software_License.pdf',
      type: 'quote',
      status: 'processed',
      uploadedAt: '2024-01-12T11:00:00Z',
      language: 'en',
      extractedFields: 5,
      invoiceNumber: 'QT-2024-9012',
      amount: '€4,999.00'
    }
  ];

  const stats = [
    {
      label: 'Dokumente gesamt',
      value: '89',
      icon: FileText,
      color: 'text-primary'
    },
    {
      label: 'Verarbeitet',
      value: '84',
      icon: FileCheck,
      color: 'text-success'
    },
    {
      label: 'In Bearbeitung',
      value: '3',
      icon: Loader2,
      color: 'text-warning'
    },
    {
      label: 'Fehler',
      value: '2',
      icon: AlertCircle,
      color: 'text-destructive'
    }
  ];

  const handleUpload = async () => {
    setIsUploading(true);
    // Simulate upload
    setTimeout(() => {
      setIsUploading(false);
      alert('Demo: Dokument würde jetzt hochgeladen und verarbeitet');
    }, 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processed':
        return (
          <Badge variant="default" className="bg-success/10 text-success border-success/20">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Verarbeitet
          </Badge>
        );
      case 'processing':
        return (
          <Badge variant="secondary">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            In Bearbeitung
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Fehler
          </Badge>
        );
      default:
        return null;
    }
  };

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
              <h1 className="text-2xl font-semibold">Dokumente</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Laden Sie Dokumente hoch und lassen Sie sie automatisch verarbeiten
              </p>
            </div>
            <Button onClick={handleUpload} disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Lädt hoch...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Hochladen
                </>
              )}
            </Button>
          </div>
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
                    </div>
                    <div className={`h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center ${stat.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Upload Area */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="font-medium mb-1">Dokumente hierher ziehen</p>
              <p className="text-sm text-muted-foreground mb-4">
                oder klicken zum Durchsuchen
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>PDF, PNG, JPG bis zu 10MB</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Alle Dokumente</CardTitle>
                <CardDescription>Übersicht über alle hochgeladenen und verarbeiteten Dokumente</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Dokumente suchen..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-[300px]"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dateiname</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sprache</TableHead>
                  <TableHead>Felder</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents
                  .filter(doc => 
                    doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    doc.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{doc.filename}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(doc.status)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {doc.language === 'de' ? '🇩🇪 DE' : '🇬🇧 EN'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {doc.extractedFields > 0 ? (
                          <span className="text-sm text-muted-foreground">
                            {doc.extractedFields} Felder
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {doc.invoiceNumber && (
                          <div className="text-sm">
                            <p className="font-medium">{doc.invoiceNumber}</p>
                            <p className="text-muted-foreground">{doc.amount}</p>
                          </div>
                        )}
                        {doc.error && (
                          <p className="text-sm text-destructive">{doc.error}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(doc.uploadedAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
