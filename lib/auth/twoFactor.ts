/**
 * Two-Factor Authentication Library
 * ==================================
 * TOTP-based 2FA implementation using authenticator apps
 * 
 * @version 1.0
 * @date 2025-11-15
 */

import { authenticator } from 'otplib';
import crypto from 'crypto';

const APP_NAME = 'CertusFlow';

// Use environment variable for encryption, fallback to a default for development
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'certusflow-dev-key-change-in-production-32chars';

/**
 * Generate a new TOTP secret for a user
 */
export function generateTOTPSecret(): string {
  return authenticator.generateSecret();
}

/**
 * Generate a QR code URL for authenticator apps
 * @param email User's email address
 * @param secret TOTP secret
 */
export function generateQRCodeUrl(email: string, secret: string): string {
  return authenticator.keyuri(email, APP_NAME, secret);
}

/**
 * Verify a TOTP token
 * @param token 6-digit code from authenticator app
 * @param secret User's TOTP secret
 * @returns true if token is valid
 */
export function verifyTOTP(token: string, secret: string): boolean {
  try {
    // Configure with a time window for clock drift
    authenticator.options = {
      window: 1 // Allow ±30 seconds (1 step before/after)
    };
    return authenticator.verify({ token, secret });
  } catch (error) {
    console.error('TOTP verification error:', error);
    return false;
  }
}

/**
 * Generate backup codes for emergency access
 * @param count Number of backup codes to generate (default: 10)
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    // Generate 8-character hex code (e.g., "A3F9C2E1")
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(code);
  }
  return codes;
}

/**
 * Hash a backup code for secure storage
 * @param code Plain text backup code
 */
export function hashBackupCode(code: string): string {
  return crypto.createHash('sha256').update(code.toUpperCase()).digest('hex');
}

/**
 * Verify a backup code against stored hash
 * @param code Plain text code to verify
 * @param hash Stored hash to compare against
 */
export function verifyBackupCode(code: string, hash: string): boolean {
  const codeHash = hashBackupCode(code);
  return codeHash === hash;
}

/**
 * Encrypt a TOTP secret for database storage
 * @param secret Plain text secret
 */
export function encryptSecret(secret: string): string {
  try {
    // Use a proper key derivation
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    
    let encrypted = cipher.update(secret, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Return IV + encrypted data
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt secret');
  }
}

/**
 * Decrypt a TOTP secret from database
 * @param encrypted Encrypted secret with IV
 */
export function decryptSecret(encrypted: string): string {
  try {
    const parts = encrypted.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt secret');
  }
}

/**
 * Format a backup code for display (e.g., "A3F9-C2E1")
 * @param code 8-character code
 */
export function formatBackupCode(code: string): string {
  return code.match(/.{1,4}/g)?.join('-') || code;
}
