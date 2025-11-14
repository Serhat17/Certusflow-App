/**
 * Contract Analysis AI Module
 * ============================
 * DSGVO-konforme Vertragsanalyse mit OpenAI GPT-4
 * 
 * Features:
 * - Automatische Vertragstyp-Erkennung
 * - Risikobewertung (0-100 Score)
 * - DSGVO-Compliance Check
 * - Kritische Klauseln identifizieren
 * - Rechtliche Handlungsempfehlungen
 * 
 * @version 1.0
 * @date 2025-11-14
 */

import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Types
export interface ContractAnalysis {
  contract_type: string;
  risk_score: number;
  risk_level: 'niedrig' | 'gering' | 'mittel' | 'hoch' | 'sehr_hoch';
  overall_assessment: string;
  
  gdpr_compliance: {
    is_compliant: boolean;
    violations: string[];
    missing_elements: string[];
    recommendations: string[];
  };
  
  critical_clauses: CriticalClause[];
  
  financial_risks: {
    payment_terms: string;
    hidden_costs: string[];
    penalties: string[];
    liability_caps: string[];
  };
  
  termination: {
    notice_period: string;
    minimum_term: string;
    auto_renewal: boolean;
    early_termination_rights: string[];
  };
  
  action_items: string[];
  
  sign_or_not: {
    recommendation: 'sign' | 'negotiate' | 'reject' | 'legal_review';
    reasoning: string;
  };
}

export interface CriticalClause {
  clause_text: string;
  section: string;
  risk_level: 'niedrig' | 'mittel' | 'hoch';
  issue: string;
  explanation: string;
  legal_basis: string;
  recommendation: string;
}

// System Prompt for German Contract Analysis
const SYSTEM_PROMPT = `Du bist ein spezialisierter Rechtsassistent für deutsche Vertragsanalyse.

DEINE EXPERTISE:
- Deutsches Vertragsrecht (BGB, HGB)
- EU-Datenschutz-Grundverordnung (DSGVO/GDPR)
- AGB-Recht (§§ 305 ff. BGB)
- Handelsrecht und Gewährleistung

ANALYSE-AUFGABEN:
1. **Vertragstyp identifizieren**
   - Dienstleistungsvertrag, Kaufvertrag, AV-Vertrag, Arbeitsvertrag, etc.

2. **Risikobewertung (0-100 Punkte)**
   - 0-20: Niedrig (Standardklauseln, DSGVO-konform)
   - 21-40: Gering (Kleinere Optimierungen)
   - 41-60: Mittel (Nachverhandlung empfohlen)
   - 61-80: Hoch (Rechtliche Prüfung erforderlich)
   - 81-100: Sehr Hoch (NICHT UNTERSCHREIBEN!)

3. **DSGVO-Compliance prüfen** (falls relevant)
   - Art. 28 DSGVO: Auftragsverarbeitungsvertrag korrekt?
   - Datenverarbeitungszwecke definiert?
   - Sub-Processor aufgelistet?
   - Technische und organisatorische Maßnahmen (TOMs)?
   - Betroffenenrechte gewährleistet?
   - Löschung/Rückgabe geregelt?

4. **Kritische Klauseln identifizieren**
   - Unwirksame Klauseln (§ 134, 138 BGB)
   - AGB-Kontrolle (§§ 307-309 BGB)
   - Haftungsausschlüsse
   - Versteckte Kosten
   - Einseitige Kündigungsrechte
   - Wettbewerbsverbote
   - Gerichtsstand/Schiedsklauseln

5. **Handlungsempfehlungen**
   - Was sollte nachverhandelt werden?
   - Welche Klauseln müssen ergänzt werden?
   - Wo ist rechtliche Beratung nötig?

WICHTIGE HINWEISE:
- Zitiere relevante Rechtsgrundlagen (§§, Art.)
- Sei präzise und verständlich
- Gib konkrete, umsetzbare Empfehlungen
- Erkläre rechtliche Risiken klar
- Berücksichtige typische Fallstricke

ANTWORT-FORMAT (JSON):
Gib deine Analyse als strukturiertes JSON zurück. Verwende deutsche Formulierungen.`;

/**
 * Analyze a contract using AI
 * @param contractText - Full text of the contract
 * @param contractType - Optional: Pre-identified contract type
 * @returns ContractAnalysis object
 */
export async function analyzeContract(
  contractText: string,
  contractType?: string
): Promise<ContractAnalysis> {
  
  // Validate input
  if (!contractText || contractText.trim().length < 100) {
    throw new Error('Contract text is too short for meaningful analysis');
  }

  // Truncate if too long (GPT-4 token limit)
  const maxLength = 30000; // ~7500 tokens
  const truncatedText = contractText.length > maxLength 
    ? contractText.substring(0, maxLength) + '\n\n[... Text wurde gekürzt ...]'
    : contractText;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { 
          role: 'system', 
          content: SYSTEM_PROMPT 
        },
        { 
          role: 'user', 
          content: `Analysiere folgenden Vertrag:\n\n${truncatedText}` 
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2, // Lower temperature for consistent legal analysis
      max_tokens: 4000,
    });

    const analysisText = completion.choices[0].message.content;
    
    if (!analysisText) {
      throw new Error('Empty response from AI');
    }

    const analysis: ContractAnalysis = JSON.parse(analysisText);

    // Validate and normalize the response
    return normalizeAnalysis(analysis);

  } catch (error) {
    console.error('Contract analysis failed:', error);
    
    // Provide fallback error response
    throw new Error(
      error instanceof Error 
        ? `AI-Analyse fehlgeschlagen: ${error.message}` 
        : 'AI-Analyse fehlgeschlagen'
    );
  }
}

/**
 * Normalize and validate AI response
 */
function normalizeAnalysis(analysis: any): ContractAnalysis {
  // Ensure risk_score is between 0-100
  const risk_score = Math.max(0, Math.min(100, analysis.risk_score || 50));
  
  // Determine risk_level from score
  let risk_level: ContractAnalysis['risk_level'];
  if (risk_score <= 20) risk_level = 'niedrig';
  else if (risk_score <= 40) risk_level = 'gering';
  else if (risk_score <= 60) risk_level = 'mittel';
  else if (risk_score <= 80) risk_level = 'hoch';
  else risk_level = 'sehr_hoch';

  return {
    contract_type: analysis.contract_type || 'Unbekannt',
    risk_score,
    risk_level,
    overall_assessment: analysis.overall_assessment || 'Keine Bewertung verfügbar',
    
    gdpr_compliance: {
      is_compliant: analysis.gdpr_compliance?.is_compliant ?? null,
      violations: analysis.gdpr_compliance?.violations || [],
      missing_elements: analysis.gdpr_compliance?.missing_elements || [],
      recommendations: analysis.gdpr_compliance?.recommendations || [],
    },
    
    critical_clauses: (analysis.critical_clauses || []).map((clause: any) => ({
      clause_text: clause.clause_text || '',
      section: clause.section || 'Unbekannt',
      risk_level: clause.risk_level || 'mittel',
      issue: clause.issue || '',
      explanation: clause.explanation || '',
      legal_basis: clause.legal_basis || '',
      recommendation: clause.recommendation || '',
    })),
    
    financial_risks: {
      payment_terms: analysis.financial_risks?.payment_terms || 'Nicht angegeben',
      hidden_costs: analysis.financial_risks?.hidden_costs || [],
      penalties: analysis.financial_risks?.penalties || [],
      liability_caps: analysis.financial_risks?.liability_caps || [],
    },
    
    termination: {
      notice_period: analysis.termination?.notice_period || 'Nicht angegeben',
      minimum_term: analysis.termination?.minimum_term || 'Nicht angegeben',
      auto_renewal: analysis.termination?.auto_renewal ?? false,
      early_termination_rights: analysis.termination?.early_termination_rights || [],
    },
    
    action_items: analysis.action_items || [],
    
    sign_or_not: {
      recommendation: analysis.sign_or_not?.recommendation || 'legal_review',
      reasoning: analysis.sign_or_not?.reasoning || 'Keine Empfehlung verfügbar',
    },
  };
}

/**
 * Get risk level color for UI
 */
export function getRiskColor(score: number): string {
  if (score <= 20) return 'text-green-600';
  if (score <= 40) return 'text-yellow-600';
  if (score <= 60) return 'text-orange-600';
  if (score <= 80) return 'text-red-600';
  return 'text-red-900';
}

/**
 * Get risk level badge style
 */
export function getRiskBadge(level: string): string {
  switch (level) {
    case 'niedrig':
      return 'bg-green-100 text-green-800';
    case 'gering':
      return 'bg-yellow-100 text-yellow-800';
    case 'mittel':
      return 'bg-orange-100 text-orange-800';
    case 'hoch':
      return 'bg-red-100 text-red-800';
    case 'sehr_hoch':
      return 'bg-red-900 text-white';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
