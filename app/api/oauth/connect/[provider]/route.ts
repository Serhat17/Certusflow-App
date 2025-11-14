import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { getOAuthUrl } from '@/lib/integrations/oauth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;
    const searchParams = request.nextUrl.searchParams;
    const accessToken = searchParams.get('access_token');
    
    if (!accessToken) {
      const url = new URL(request.url);
      const locale = url.pathname.split('/')[1] || 'de';
      return NextResponse.redirect(
        new URL(`/${locale}/login?error=no_token&returnTo=/dashboard/integrations`, request.url)
      );
    }

    // Create Supabase client and set the session
    const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);
    
    // Get user with the provided access token
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
    
    console.log('OAuth Connect - User:', user?.id, 'Error:', userError);
    
    if (userError || !user) {
      console.error('No authenticated user found');
      const url = new URL(request.url);
      const locale = url.pathname.split('/')[1] || 'de';
      return NextResponse.redirect(
        new URL(`/${locale}/login?error=invalid_session&returnTo=/dashboard/integrations`, request.url)
      );
    }

    // Generate OAuth URL with user ID
    const oauthUrl = getOAuthUrl(provider as any, user.id);

    // Redirect to OAuth provider
    return NextResponse.redirect(oauthUrl);
  } catch (error) {
    console.error('OAuth initiation error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate OAuth flow' },
      { status: 500 }
    );
  }
}
