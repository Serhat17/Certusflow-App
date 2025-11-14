import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';
import { getOAuthUrl } from '@/lib/integrations/oauth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;
    const supabase = await createServerClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    console.log('OAuth Connect - User:', user?.id, 'Error:', userError);
    
    if (userError || !user) {
      console.error('No authenticated user found');
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/de/login?error=unauthorized&returnTo=/dashboard/integrations`
      );
    }

    // Generate OAuth URL
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
