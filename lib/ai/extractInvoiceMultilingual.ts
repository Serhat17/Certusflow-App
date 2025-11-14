import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPTS = {
  de: `Du bist ein Experte für das Extrahieren strukturierter Daten aus deutschen und internationalen Rechnungen und Belegen.

EXTRAHIERE FOLGENDE FELDER:
- rechnungsnummer: Die Rechnungs-/Belegnummer
- lieferant_name: Name des Lieferanten/Händlers
- lieferant_adresse: Vollständige Adresse
- betrag_netto: Nettobetrag (ohne MwSt.)
- betrag_brutto: Bruttobetrag (mit MwSt.)
- währung: EUR, USD, CHF, etc.
- mehrwertsteuer_betrag: MwSt./USt./VAT Betrag
- mehrwertsteuer_satz: MwSt. Satz (19%, 7%, 20%, etc.)
- ausstellungsdatum: Datum der Rechnung
- fälligkeitsdatum: Zahlungsfrist
- iban: IBAN des Empfängers (falls vorhanden)
- bic: BIC/SWIFT Code (falls vorhanden)
- ust_id: Umsatzsteuer-ID (falls vorhanden)
- zahlungsart: Überweisung, PayPal, Lastschrift, etc.

WICHTIGE ERKENNUNGSREGELN FÜR DEUTSCHE DOKUMENTE:
- Suche nach: "Rechnung", "Rechnungsnr.", "RE-Nr.", "Invoice"
- Datumserkennung: DD.MM.YYYY oder DD.MM.YY oder TT.MM.JJJJ
- Zahlenformate: 1.234,56 EUR (Punkt als Tausender, Komma als Dezimal)
- MwSt. Synonyme: "MwSt.", "USt.", "Mehrwertsteuer", "Umsatzsteuer", "VAT"
- Fälligkeitsdatum: "Fällig am", "Zahlbar bis", "Zahlung bis", "Due date"
- Netto/Brutto: "Nettobetrag", "Bruttobetrag", "Gesamt", "Summe"

Antworte NUR mit validem JSON. Keine Erklärungen.`,

  en: `You are an expert at extracting structured data from English and international invoices and receipts.

EXTRACT THE FOLLOWING FIELDS:
- invoice_number: The invoice/receipt number
- vendor_name: Name of the vendor/merchant
- vendor_address: Full address
- amount_net: Net amount (before tax)
- amount_gross: Gross amount (including tax)
- currency: EUR, USD, GBP, etc.
- tax_amount: VAT/Tax amount
- tax_rate: Tax rate (19%, 20%, 5%, etc.)
- issue_date: Date of invoice
- due_date: Payment due date
- iban: IBAN (if present)
- bic: BIC/SWIFT code (if present)
- vat_number: VAT registration number (if present)
- payment_method: Transfer, PayPal, Direct Debit, etc.

IMPORTANT RECOGNITION RULES FOR ENGLISH DOCUMENTS:
- Look for: "Invoice", "Invoice No.", "Invoice #", "Bill", "Receipt"
- Date formats: MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD
- Number formats: 1,234.56 USD (comma as thousands separator, dot as decimal)
- Tax synonyms: "VAT", "Tax", "Sales Tax", "GST"
- Due date: "Due date", "Payment due", "Pay by", "Due by"
- Net/Gross: "Subtotal", "Total", "Grand Total", "Amount Due"

Respond with valid JSON ONLY. No explanations.`
};

interface ExtractedInvoiceData {
  invoice_number?: string;
  vendor_name?: string;
  vendor_address?: string;
  amount_net?: number;
  amount_gross?: number;
  currency?: string;
  tax_amount?: number;
  tax_rate?: number;
  issue_date?: string;
  due_date?: string;
  iban?: string;
  bic?: string;
  vat_number?: string;
  payment_method?: string;
}

export async function extractInvoiceDataMultilingual(
  documentText: string,
  userLanguage: 'de' | 'en' = 'de',
  autoDetectLanguage: boolean = true
): Promise<{
  extracted_data: ExtractedInvoiceData;
  confidence_score: number;
  detected_language: 'de' | 'en' | 'other';
  ai_model: string;
  processing_time_ms: number;
}> {
  const startTime = Date.now();

  // Auto-detect document language if enabled
  let documentLanguage: 'de' | 'en' = userLanguage;
  if (autoDetectLanguage) {
    documentLanguage = detectLanguage(documentText);
  }

  // Use appropriate system prompt
  const systemPrompt = SYSTEM_PROMPTS[documentLanguage];

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Extrahiere Rechnungsdaten / Extract invoice data:\n\n${documentText}`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
      max_tokens: 1000,
    });

    const extracted = JSON.parse(completion.choices[0].message.content!);
    const processingTime = Date.now() - startTime;

    // Normalize field names (German → English mapping)
    const normalized = normalizeExtractedData(extracted, documentLanguage);

    return {
      extracted_data: normalized,
      confidence_score: calculateConfidence(normalized),
      detected_language: documentLanguage,
      ai_model: 'gpt-4-turbo-preview',
      processing_time_ms: processingTime
    };
  } catch (error: any) {
    console.error('AI extraction failed:', error);
    throw new Error(`Invoice extraction failed: ${error.message}`);
  }
}

/**
 * Auto-detect document language based on keywords
 */
function detectLanguage(text: string): 'de' | 'en' {
  const lowerText = text.toLowerCase();
  
  // German keywords
  const germanKeywords = [
    'rechnung', 'rechnungsnummer', 'lieferant', 'mwst', 'ust',
    'mehrwertsteuer', 'umsatzsteuer', 'fällig', 'zahlbar',
    'netto', 'brutto', 'gesamt', 'summe', 'betrag'
  ];
  
  // English keywords
  const englishKeywords = [
    'invoice', 'bill', 'receipt', 'vendor', 'supplier',
    'vat', 'tax', 'due date', 'subtotal', 'total',
    'amount', 'payment', 'gross', 'net'
  ];
  
  let germanScore = 0;
  let englishScore = 0;
  
  germanKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) germanScore++;
  });
  
  englishKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) englishScore++;
  });
  
  return germanScore > englishScore ? 'de' : 'en';
}

/**
 * Normalize German field names to English
 */
function normalizeExtractedData(
  data: any,
  sourceLanguage: 'de' | 'en'
): ExtractedInvoiceData {
  if (sourceLanguage === 'en') {
    return data; // Already in English
  }
  
  // Map German field names to English
  return {
    invoice_number: data.rechnungsnummer || data.invoice_number,
    vendor_name: data.lieferant_name || data.vendor_name,
    vendor_address: data.lieferant_adresse || data.vendor_address,
    amount_net: data.betrag_netto || data.amount_net,
    amount_gross: data.betrag_brutto || data.amount_gross,
    currency: data.währung || data.currency,
    tax_amount: data.mehrwertsteuer_betrag || data.tax_amount,
    tax_rate: data.mehrwertsteuer_satz || data.tax_rate,
    issue_date: data.ausstellungsdatum || data.issue_date,
    due_date: data.fälligkeitsdatum || data.due_date,
    iban: data.iban,
    bic: data.bic,
    vat_number: data.ust_id || data.vat_number,
    payment_method: data.zahlungsart || data.payment_method,
  };
}

/**
 * Calculate confidence score based on extracted fields
 */
function calculateConfidence(data: ExtractedInvoiceData): number {
  const criticalFields = [
    'invoice_number',
    'vendor_name',
    'amount_gross',
    'currency'
  ];
  
  let filledFields = 0;
  let totalFields = 0;
  
  criticalFields.forEach(field => {
    totalFields++;
    if (data[field as keyof ExtractedInvoiceData]) {
      filledFields++;
    }
  });
  
  return filledFields / totalFields;
}

/**
 * Format amount according to locale
 */
export function formatCurrency(
  amount: number,
  currency: string = 'EUR',
  locale: 'de' | 'en' = 'de'
): string {
  const localeMap = {
    de: 'de-DE',
    en: 'en-US'
  };
  
  return new Intl.NumberFormat(localeMap[locale], {
    style: 'currency',
    currency: currency
  }).format(amount);
}

/**
 * Format date according to locale
 */
export function formatDate(
  dateString: string,
  locale: 'de' | 'en' = 'de'
): string {
  const date = new Date(dateString);
  const localeMap = {
    de: 'de-DE',
    en: 'en-US'
  };
  
  return new Intl.DateTimeFormat(localeMap[locale], {
    dateStyle: 'long'
  }).format(date);
}
