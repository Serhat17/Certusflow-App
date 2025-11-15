import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { verifyTOTP, decryptSecret, verifyBackupCode } from '@/lib/auth/twoFactor';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, code, trustDevice, useBackupCode } = body;

    if (!email || !password || !code) {
      return NextResponse.json(
        { error: 'Email, password and verification code are required' },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();

    // Step 1: Verify password with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const userId = authData.user.id;

    // Step 2: Check if user has 2FA enabled
    const { data: twoFactorData, error: twoFactorError } = await supabase
      .from('user_2fa')
      .select('secret, backup_codes, enabled')
      .eq('user_id', userId)
      .eq('enabled', true)
      .single();

    if (twoFactorError || !twoFactorData) {
      // No 2FA enabled, just return the session
      return NextResponse.json({ 
        success: true,
        requires2FA: false,
        session: authData.session 
      });
    }

    // Step 3: Verify TOTP code or backup code
    let isValid = false;
    let usedBackupCode: string | null = null;

    if (useBackupCode) {
      // Check backup codes
      const backupCodes = twoFactorData.backup_codes || [];
      for (const hashedCode of backupCodes) {
        if (await verifyBackupCode(code, hashedCode)) {
          isValid = true;
          usedBackupCode = hashedCode;
          break;
        }
      }
    } else {
      // Verify TOTP
      const secret = decryptSecret(twoFactorData.secret);
      isValid = verifyTOTP(code, secret);
    }

    if (!isValid) {
      // Log failed attempt
      await supabase.from('user_2fa_audit').insert({
        user_id: userId,
        event_type: 'login_failed',
        success: false,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
        user_agent: request.headers.get('user-agent'),
      });

      // Sign out the user since 2FA failed
      await supabase.auth.signOut();

      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 401 }
      );
    }

    // Step 4: If backup code was used, remove it from the list
    if (usedBackupCode) {
      const updatedBackupCodes = twoFactorData.backup_codes.filter(
        (code: string) => code !== usedBackupCode
      );
      await supabase
        .from('user_2fa')
        .update({ backup_codes: updatedBackupCodes })
        .eq('user_id', userId);
    }

    // Step 5: Handle trusted device if requested
    let deviceToken: string | null = null;
    if (trustDevice) {
      const userAgent = request.headers.get('user-agent') || '';
      const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';
      
      // Create device fingerprint (hash of user-agent + user ID)
      const fingerprint = crypto
        .createHash('sha256')
        .update(`${userId}-${userAgent}`)
        .digest('hex');

      // Generate secure device token
      deviceToken = crypto.randomBytes(32).toString('hex');

      // Store trusted device (expires in 30 days)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const deviceName = extractDeviceName(userAgent);

      await supabase.from('user_trusted_devices').upsert({
        user_id: userId,
        device_fingerprint: fingerprint,
        device_name: deviceName,
        ip_address: ip,
        user_agent: userAgent,
        expires_at: expiresAt.toISOString(),
        last_used_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,device_fingerprint',
      });
    }

    // Step 6: Log successful login
    await supabase.from('user_2fa_audit').insert({
      user_id: userId,
      event_type: 'login_success',
      success: true,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
      user_agent: request.headers.get('user-agent'),
    });

    // Step 7: Return success with session
    const response = NextResponse.json({
      success: true,
      requires2FA: true,
      verified: true,
      session: authData.session,
    });

    // Set trusted device cookie if applicable
    if (deviceToken) {
      response.cookies.set('trusted_device_token', deviceToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      });
    }

    return response;

  } catch (error) {
    console.error('2FA login verification error:', error);
    return NextResponse.json(
      { error: 'An error occurred during verification' },
      { status: 500 }
    );
  }
}

// Helper function to extract device name from user agent
function extractDeviceName(userAgent: string): string {
  const browsers = [
    { name: 'Chrome', pattern: /Chrome\/[\d.]+/ },
    { name: 'Firefox', pattern: /Firefox\/[\d.]+/ },
    { name: 'Safari', pattern: /Safari\/[\d.]+/ },
    { name: 'Edge', pattern: /Edg\/[\d.]+/ },
    { name: 'Opera', pattern: /OPR\/[\d.]+/ },
  ];

  const os = [
    { name: 'Windows', pattern: /Windows/ },
    { name: 'macOS', pattern: /Mac OS X/ },
    { name: 'Linux', pattern: /Linux/ },
    { name: 'iOS', pattern: /iPhone|iPad/ },
    { name: 'Android', pattern: /Android/ },
  ];

  let browserName = 'Unknown Browser';
  let osName = 'Unknown OS';

  for (const browser of browsers) {
    if (browser.pattern.test(userAgent)) {
      browserName = browser.name;
      break;
    }
  }

  for (const system of os) {
    if (system.pattern.test(userAgent)) {
      osName = system.name;
      break;
    }
  }

  return `${browserName} on ${osName}`;
}

// Check if device is trusted endpoint
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ trusted: false, requires2FA: false });
    }

    const userId = session.user.id;

    // Check if user has 2FA enabled
    const { data: twoFactorData } = await supabase
      .from('user_2fa')
      .select('enabled')
      .eq('user_id', userId)
      .eq('enabled', true)
      .single();

    if (!twoFactorData) {
      return NextResponse.json({ trusted: false, requires2FA: false });
    }

    // Check if device is trusted
    const deviceToken = request.cookies.get('trusted_device_token')?.value;
    if (!deviceToken) {
      return NextResponse.json({ trusted: false, requires2FA: true });
    }

    const userAgent = request.headers.get('user-agent') || '';
    const fingerprint = crypto
      .createHash('sha256')
      .update(`${userId}-${userAgent}`)
      .digest('hex');

    const { data: trustedDevice } = await supabase
      .from('user_trusted_devices')
      .select('id, expires_at')
      .eq('user_id', userId)
      .eq('device_fingerprint', fingerprint)
      .single();

    if (!trustedDevice) {
      return NextResponse.json({ trusted: false, requires2FA: true });
    }

    // Check if device token is expired
    if (new Date(trustedDevice.expires_at) < new Date()) {
      // Delete expired device
      await supabase
        .from('user_trusted_devices')
        .delete()
        .eq('id', trustedDevice.id);
      
      return NextResponse.json({ trusted: false, requires2FA: true });
    }

    // Update last used timestamp
    await supabase
      .from('user_trusted_devices')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', trustedDevice.id);

    return NextResponse.json({ trusted: true, requires2FA: true });

  } catch (error) {
    console.error('Trusted device check error:', error);
    return NextResponse.json({ trusted: false, requires2FA: false });
  }
}
