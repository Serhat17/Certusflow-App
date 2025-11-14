'use client';

/**
 * Contract Scanner - Upload & Analysis Page
 * ==========================================
 * DSGVO-konforme Vertragsanalyse mit KI
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Shield, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export default function ContractScanPage() {
  const router = useRouter();
  const t = useTranslations('contractScan');
  
  const [file, setFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [saveResult, setSaveResult] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  // Handle drag & drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  // Validate file
  const validateAndSetFile = (selectedFile: File) => {
    // Check file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    const allowedExtensions = ['.pdf', '.docx', '.txt'];
    const fileName = selectedFile.name.toLowerCase();
    const isValidType = allowedTypes.includes(selectedFile.type) || allowedExtensions.some(ext => fileName.endsWith(ext));

    if (!isValidType) {
      toast.error(t('errors.invalidFileType'));
      return;
    }

    // Check file size (10 MB max)
    const maxSize = 10 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      toast.error(t('errors.fileTooLarge'));
      return;
    }

    setFile(selectedFile);
    toast.success(t('fileSelected'));
  };

  // Handle analysis
  const handleAnalyze = async () => {
    if (!file || !consent) {
      toast.error(t('errors.consentRequired'));
      return;
    }

    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('consent', 'true');
      formData.append('save_result', saveResult ? 'true' : 'false');

      const response = await fetch('/api/contracts/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('errors.analysisFailed'));
      }

      toast.success(t('analysisComplete'));

      // Redirect to results page
      if (data.analysis_id) {
        router.push(`/de/dashboard/contracts/${data.analysis_id}`);
      } else {
        // Show results inline (temporary analysis)
        router.push(`/de/dashboard/contracts/temp?data=${encodeURIComponent(JSON.stringify(data.analysis))}`);
      }

    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error instanceof Error ? error.message : t('errors.analysisFailed'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-3 text-gray-900 dark:text-white">
            {t('title')}
          </h1>
          <p className="text-muted-foreground text-lg">{t('subtitle')}</p>
        </div>

        {/* Privacy Notice */}
        <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-6 mb-8 shadow-sm">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-gray-700 dark:text-gray-300 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                🔒 {t('privacy.title')}
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>✓ {t('privacy.encrypted')}</li>
                <li>✓ {t('privacy.euServers')}</li>
                <li>✓ {t('privacy.autoDeletion')}</li>
                <li>✓ {t('privacy.noAiTraining')}</li>
                <li>✓ {t('privacy.deletable')}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-all shadow-sm bg-white dark:bg-gray-950 ${
            dragActive 
              ? 'border-gray-400 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 scale-[1.01]' 
              : 'border-gray-300 dark:border-gray-700'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {file ? (
            <div>
              <FileText className="h-16 w-16 mx-auto mb-4 text-green-600" />
              <h3 className="text-xl font-semibold mb-2">{file.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <button
                onClick={() => setFile(null)}
                className="text-sm text-red-600 hover:text-red-700 hover:underline font-medium"
              >
                {t('removeFile')}
              </button>
            </div>
          ) : (
            <>
              <Upload className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">{t('upload.title')}</h3>
              <p className="text-sm text-muted-foreground mb-6">
                {t('upload.formats')}
              </p>
              <label>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <span className="inline-block px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg cursor-pointer hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-sm hover:shadow font-medium">
                  {t('upload.button')}
                </span>
              </label>
            </>
          )}
        </div>

        {/* Consent Checkboxes */}
        {file && (
          <div className="mt-8 space-y-4 bg-white dark:bg-gray-950 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-800">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
              />
              <span className="text-sm group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                {t('consent.processing')}
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={saveResult}
                onChange={(e) => setSaveResult(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
              />
              <span className="text-sm group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                <strong>{t('consent.optional')}</strong> {t('consent.save30Days')}
              </span>
            </label>

            <button
              onClick={handleAnalyze}
              disabled={!consent || isAnalyzing}
              className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium text-lg shadow-sm hover:shadow hover:bg-gray-800 dark:hover:bg-gray-100 transition-all disabled:hover:bg-gray-900 dark:disabled:hover:bg-white"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {t('analyzing')}
                </>
              ) : (
                t('startAnalysis')
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
