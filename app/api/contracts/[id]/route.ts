/**
 * Contract Analysis Delete API Route
 * ===================================
 * DELETE /api/contracts/[id]/delete
 * 
 * Allows users to manually delete their contract analysis immediately.
 * DSGVO-compliant: Right to erasure (Art. 17 DSGVO)
 * 
 * @version 1.0
 * @date 2025-11-14
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';

/**
 * DELETE: Remove a saved contract analysis
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const analysisId = params.id;

    // 2. Verify analysis exists and belongs to user
    const { data: analysis, error: fetchError } = await supabase
      .from('contract_analyses')
      .select('id, file_name, user_id')
      .eq('id', analysisId)
      .single();

    if (fetchError || !analysis) {
      return NextResponse.json(
        { error: 'Analyse nicht gefunden' },
        { status: 404 }
      );
    }

    // 3. Verify ownership (RLS should handle this, but double-check)
    if (analysis.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Keine Berechtigung' },
        { status: 403 }
      );
    }

    // 4. Delete the analysis
    const { error: deleteError } = await supabase
      .from('contract_analyses')
      .delete()
      .eq('id', analysisId);

    if (deleteError) {
      console.error('Failed to delete analysis:', deleteError);
      throw deleteError;
    }

    // 5. Log audit event
    await supabase.from('audit_log').insert({
      user_id: user.id,
      action_type: 'contract_analysis_deleted',
      action_category: 'data_deletion',
      description: 'User deleted contract analysis',
      metadata: {
        analysis_id: analysisId,
        file_name: analysis.file_name,
        deleted_at: new Date().toISOString()
      }
    });

    // 6. Return success
    return NextResponse.json({
      success: true,
      message: 'Analyse erfolgreich gelöscht'
    });

  } catch (error) {
    console.error('Failed to delete analysis:', error);
    
    return NextResponse.json(
      { error: 'Fehler beim Löschen der Analyse' },
      { status: 500 }
    );
  }
}

/**
 * GET: Fetch a specific analysis (with decrypted content)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const analysisId = params.id;

    // 2. Fetch analysis (RLS ensures user can only access their own)
    const { data: analysis, error: fetchError } = await supabase
      .from('contract_analyses')
      .select('*')
      .eq('id', analysisId)
      .single();

    if (fetchError || !analysis) {
      return NextResponse.json(
        { error: 'Analyse nicht gefunden' },
        { status: 404 }
      );
    }

    // 3. Decrypt the analysis
    let decryptedAnalysis;
    try {
      const { decryptData } = await import('@/lib/encryption');
      const analysisJson = decryptData(analysis.encrypted_analysis);
      decryptedAnalysis = JSON.parse(analysisJson);
    } catch (error) {
      console.error('Failed to decrypt analysis:', error);
      return NextResponse.json(
        { error: 'Fehler beim Entschlüsseln der Analyse' },
        { status: 500 }
      );
    }

    // 4. Return analysis
    return NextResponse.json({
      success: true,
      analysis: {
        id: analysis.id,
        file_name: analysis.file_name,
        file_size: analysis.file_size,
        file_type: analysis.file_type,
        created_at: analysis.created_at,
        auto_delete_at: analysis.auto_delete_at,
        ...decryptedAnalysis
      }
    });

  } catch (error) {
    console.error('Failed to fetch analysis:', error);
    
    return NextResponse.json(
      { error: 'Fehler beim Laden der Analyse' },
      { status: 500 }
    );
  }
}
