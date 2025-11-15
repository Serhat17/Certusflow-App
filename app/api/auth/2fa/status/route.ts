import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

/**
 * GET /api/auth/2fa/status
 * Check if 2FA is enabled for the current user
 */
export async function GET() {
  try {
    const supabase = await createServerClient();
    
    // Debug: Check what cookies we have
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    console.log('Available cookies:', allCookies.map(c => c.name));
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    console.log('Session check:', { 
      hasSession: !!session, 
      error: sessionError?.message,
      userId: session?.user?.id 
    });
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in again', debug: sessionError?.message }, 
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

    // Check 2FA status
    const { data: twoFaData } = await supabase
      .from('user_2fa')
      .select('enabled, verified_at')
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({
      enabled: twoFaData?.enabled || false,
      verifiedAt: twoFaData?.verified_at || null
    });

  } catch (error) {
    console.error('2FA status check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
