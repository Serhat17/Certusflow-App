/**
 * Contract Analysis API Route
 * ============================
 * POST /api/contracts/analyze
 * 
 * Uploads contract, extracts text, analyzes with AI, and optionally stores encrypted result.
 * DSGVO-compliant with consent management and auto-deletion.
 * 
 * @version 1.0
 * @date 2025-11-14
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { analyzeContract } from '@/lib/ai/contractAnalysis';
import { encryptData } from '@/lib/encryption';
import {
  extractTextFromFile,
  validateFileSize,
  validateFileType,
  cleanText
} from '@/lib/files/textExtraction';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds for AI processing

/**
 * POST: Analyze a contract
 */
export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    // 2. Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const saveResult = formData.get('save_result') === 'true';
    const consent = formData.get('consent') === 'true';

    // 3. Validate inputs
    if (!file) {
      return NextResponse.json(
        { error: 'Keine Datei hochgeladen' },
        { status: 400 }
      );
    }

    if (!consent) {
      return NextResponse.json(
        { error: 'Einwilligung zur Verarbeitung erforderlich' },
        { status: 400 }
      );
    }

    // 4. Validate file
    try {
      validateFileSize(file, 10); // Max 10 MB
      validateFileType(file);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Ungültige Datei' },
        { status: 400 }
      );
    }

    // 5. Extract text from file
    let rawText: string;
    try {
      rawText = await extractTextFromFile(file);
      rawText = cleanText(rawText);
    } catch (error) {
      console.error('Text extraction failed:', error);
      return NextResponse.json(
        { 
          error: error instanceof Error 
            ? error.message 
            : 'Fehler beim Extrahieren des Texts' 
        },
        { status: 400 }
      );
    }

    // Validate text length
    if (rawText.length < 100) {
      return NextResponse.json(
        { error: 'Der extrahierte Text ist zu kurz für eine Analyse (min. 100 Zeichen)' },
        { status: 400 }
      );
    }

    // 6. Analyze with AI
    let analysis;
    try {
      analysis = await analyzeContract(rawText);
    } catch (error) {
      console.error('AI analysis failed:', error);
      
      // Log failure
      await supabase.from('audit_log').insert({
        user_id: user.id,
        action_type: 'contract_analysis_failed',
        action_category: 'ai_processing',
        description: 'Contract analysis failed',
        metadata: {
          file_name: file.name,
          file_size: file.size,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });

      return NextResponse.json(
        { 
          error: error instanceof Error 
            ? error.message 
            : 'Fehler bei der KI-Analyse' 
        },
        { status: 500 }
      );
    }

    // 7. Save result if user consented
    let analysisId: string | null = null;

    if (saveResult) {
      try {
        // Encrypt the full analysis
        const encryptedAnalysis = encryptData(JSON.stringify(analysis));

        // Calculate auto-delete date (30 days from now)
        const autoDeleteAt = new Date();
        autoDeleteAt.setDate(autoDeleteAt.getDate() + 30);

        // Insert into database
        const { data: savedAnalysis, error: saveError } = await supabase
          .from('contract_analyses')
          .insert({
            user_id: user.id,
            file_name: file.name,
            file_size: file.size,
            file_type: file.type || 'unknown',
            encrypted_analysis: encryptedAnalysis,
            risk_score: analysis.risk_score,
            risk_level: analysis.risk_level,
            contract_type: analysis.contract_type,
            is_gdpr_compliant: analysis.gdpr_compliance.is_compliant,
            auto_delete_at: autoDeleteAt.toISOString()
          })
          .select('id')
          .single();

        if (saveError) {
          console.error('Failed to save analysis:', saveError);
          throw saveError;
        }

        analysisId = savedAnalysis.id;

      } catch (error) {
        console.error('Database save failed:', error);
        // Don't fail the request if saving fails - user still gets the result
      }
    }

    // 8. Log audit event
    await supabase.from('audit_log').insert({
      user_id: user.id,
      action_type: 'contract_analysis',
      action_category: 'ai_processing',
      description: 'Contract analyzed successfully',
      metadata: {
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        risk_score: analysis.risk_score,
        risk_level: analysis.risk_level,
        contract_type: analysis.contract_type,
        saved: saveResult,
        analysis_id: analysisId
      }
    });

    // 9. Return analysis result
    return NextResponse.json({
      success: true,
      analysis_id: analysisId,
      analysis,
      auto_delete_at: saveResult 
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : null
    });

  } catch (error) {
    console.error('Unexpected error in contract analysis:', error);
    
    return NextResponse.json(
      { error: 'Ein unerwarteter Fehler ist aufgetreten' },
      { status: 500 }
    );
  }
}

/**
 * GET: List user's saved analyses
 */
export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    // Fetch analyses (without encrypted content)
    const { data: analyses, error: fetchError } = await supabase
      .from('contract_analyses')
      .select('id, file_name, file_size, risk_score, risk_level, contract_type, is_gdpr_compliant, created_at, auto_delete_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      throw fetchError;
    }

    return NextResponse.json({
      success: true,
      analyses: analyses || []
    });

  } catch (error) {
    console.error('Failed to fetch analyses:', error);
    
    return NextResponse.json(
      { error: 'Fehler beim Laden der Analysen' },
      { status: 500 }
    );
  }
}
