import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { verifyTOTP, decryptSecret } from '@/lib/auth/twoFactor';

/**
 * POST /api/auth/2fa/disable
 * Disable 2FA after verifying current password and token
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
        { error: '2FA is not set up' },
        { status: 404 }
      );
    }

    if (!twoFaData.enabled) {
      return NextResponse.json(
        { error: '2FA is already disabled' },
        { status: 400 }
      );
    }

    // Verify token before disabling
    const secret = decryptSecret(twoFaData.secret);
    const isValid = verifyTOTP(token, secret);

    // Log attempt
    await supabase.from('user_2fa_audit').insert({
      user_id: user.id,
      event_type: 'disable_attempt',
      success: isValid
    });

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Delete 2FA record completely
    const { error: deleteError } = await supabase
      .from('user_2fa')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Failed to disable 2FA:', deleteError);
      return NextResponse.json(
        { error: 'Failed to disable 2FA' },
        { status: 500 }
      );
    }

    // Log success
    await supabase.from('user_2fa_audit').insert({
      user_id: user.id,
      event_type: 'disabled',
      success: true
    });

    return NextResponse.json({ 
      success: true,
      message: '2FA has been disabled'
    });

  } catch (error) {
    console.error('2FA disable error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
