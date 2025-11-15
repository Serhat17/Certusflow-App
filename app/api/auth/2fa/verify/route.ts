import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { 
  verifyTOTP, 
  decryptSecret, 
  generateBackupCodes, 
  hashBackupCode 
} from '@/lib/auth/twoFactor';

/**
 * POST /api/auth/2fa/verify
 * Verify the initial TOTP token and enable 2FA
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in again' }, 
        { status: 401 }
      );
    }
    
    const user = session.user;
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const { token } = await request.json();

    if (!token || token.length !== 6) {
      return NextResponse.json(
        { error: 'Invalid token format' },
        { status: 400 }
      );
    }

    // Get 2FA record
    const { data: twoFaData, error: fetchError } = await supabase
      .from('user_2fa')
      .select('secret, enabled')
      .eq('user_id', user.id)
      .single();

    if (fetchError || !twoFaData) {
      return NextResponse.json(
        { error: 'No 2FA setup found. Please start setup first.' },
        { status: 404 }
      );
    }

    if (twoFaData.enabled) {
      return NextResponse.json(
        { error: '2FA is already enabled' },
        { status: 400 }
      );
    }

    // Decrypt and verify
    const secret = decryptSecret(twoFaData.secret);
    const isValid = verifyTOTP(token, secret);

    // Log attempt
    await supabase.from('user_2fa_audit').insert({
      user_id: user.id,
      event_type: 'verify_attempt',
      success: isValid
    });

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Generate backup codes
    const backupCodes = generateBackupCodes(10);
    const hashedCodes = backupCodes.map(hashBackupCode);

    // Enable 2FA
    const { error: updateError } = await supabase
      .from('user_2fa')
      .update({
        enabled: true,
        verified_at: new Date().toISOString(),
        backup_codes: hashedCodes,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Failed to enable 2FA:', updateError);
      return NextResponse.json(
        { error: 'Failed to enable 2FA' },
        { status: 500 }
      );
    }

    // Log success
    await supabase.from('user_2fa_audit').insert({
      user_id: user.id,
      event_type: 'enabled',
      success: true
    });

    return NextResponse.json({ 
      success: true, 
      backupCodes 
    });

  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
