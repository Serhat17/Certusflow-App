import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { 
  generateTOTPSecret, 
  generateQRCodeUrl, 
  encryptSecret 
} from '@/lib/auth/twoFactor';

/**
 * POST /api/auth/2fa/setup
 * Initialize 2FA setup by generating a new TOTP secret
 */
export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    
    // Get the session from Supabase
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('Session error:', sessionError);
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

    // Check if 2FA is already enabled
    const { data: existing } = await supabase
      .from('user_2fa')
      .select('enabled')
      .eq('user_id', user.id)
      .single();

    if (existing?.enabled) {
      return NextResponse.json(
        { error: '2FA is already enabled. Disable it first to set up again.' },
        { status: 400 }
      );
    }

    // Generate new secret
    const secret = generateTOTPSecret();
    const qrCodeUrl = generateQRCodeUrl(user.email!, secret);
    const encryptedSecret = encryptSecret(secret);

    // Save to database (not yet enabled)
    const { error: dbError } = await supabase
      .from('user_2fa')
      .upsert({
        user_id: user.id,
        secret: encryptedSecret,
        enabled: false,
        verified_at: null,
        backup_codes: []
      }, {
        onConflict: 'user_id'
      });

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to initialize 2FA setup' },
        { status: 500 }
      );
    }

    // Log audit event
    await supabase.from('user_2fa_audit').insert({
      user_id: user.id,
      event_type: 'setup_initiated',
      success: true
    });

    return NextResponse.json({ 
      qrCodeUrl, 
      secret // Return plain secret for manual entry
    });

  } catch (error) {
    console.error('2FA setup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
