import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { exchangeCodeForToken, testIntegrationConnection } from '@/lib/integrations/oauth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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
    const userId = state.userId;

    if (!userId) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integrations?error=invalid_state`
      );
    }

    // Use service role key to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Ensure user profile exists (required for foreign key constraint)
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (!profile) {
      // Create profile if it doesn't exist
      const { data: authUser } = await supabase.auth.admin.getUserById(userId);
      if (authUser?.user) {
        await supabase.from('profiles').insert({
          id: userId,
          email: authUser.user.email,
          full_name: authUser.user.user_metadata?.full_name || null,
          preferred_language: authUser.user.user_metadata?.preferred_language || 'de'
        });
      }
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
    // First check if integration exists
    const { data: existingIntegration } = await supabase
      .from('integrations')
      .select('id')
      .eq('user_id', userId)
      .eq('service_name', provider)
      .single();

    const integrationData = {
      user_id: userId,
      service_name: provider,
      service_type: provider === 'gmail' || provider === 'outlook' ? 'email' 
        : provider === 'dropbox' || provider === 'onedrive' ? 'storage'
        : provider === 'slack' || provider === 'microsoft-teams' ? 'communication'
        : provider === 'google-sheets' ? 'spreadsheet'
        : 'other',
      is_connected: true,
      connection_status: 'connected',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      config_data: {
        email: connectionTest.email,
        name: connectionTest.name,
        connected_at: new Date().toISOString()
      },
      last_connected_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    let dbError;
    if (existingIntegration) {
      // Update existing integration
      const result = await supabase
        .from('integrations')
        .update(integrationData)
        .eq('id', existingIntegration.id);
      dbError = result.error;
    } else {
      // Insert new integration
      const result = await supabase
        .from('integrations')
        .insert(integrationData);
      dbError = result.error;
    }

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
