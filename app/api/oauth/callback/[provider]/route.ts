import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { exchangeCodeForToken, testIntegrationConnection } from '@/lib/integrations/oauth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const stateStr = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integrations?error=${error}`
      );
    }

    if (!code || !stateStr) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integrations?error=invalid_request`
      );
    }

    const state = JSON.parse(stateStr);
    const supabase = createClient();

    // Verify user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user || user.id !== state.userId) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integrations?error=unauthorized`
      );
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForToken(provider as any, code);

    // Test the connection
    const connectionTest = await testIntegrationConnection(
      provider as any,
      tokens.access_token
    );

    if (!connectionTest.success) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integrations?error=connection_failed`
      );
    }

    // Store integration in database
    const { error: dbError } = await supabase
      .from('integrations')
      .upsert({
        user_id: user.id,
        provider: provider,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        connected_account: connectionTest.email || connectionTest.name,
        status: 'active',
        settings: {},
        last_sync_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,provider'
      });

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integrations?error=database_error`
      );
    }

    // Success redirect
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integrations?success=${provider}`
    );
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integrations?error=server_error`
    );
  }
}
