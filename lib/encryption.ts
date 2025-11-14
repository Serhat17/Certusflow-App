/**
 * Encryption Helper Functions
 * ============================
 * Ende-zu-Ende Verschlüsselung für sensible Vertragsdaten
 * 
 * Verwendet AES-256-GCM für symmetrische Verschlüsselung
 * DSGVO-konform: Zero-Knowledge Architektur
 * 
 * @version 1.0
 * @date 2025-11-14
 */

import crypto from 'crypto';

// Encryption settings
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // Initialization Vector length
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 64;
const KEY_LENGTH = 32; // 256 bits

/**
 * Get encryption key from environment
 * Falls nicht vorhanden, wird ein Fehler geworfen
 */
function getEncryptionKey(): string {
  const key = process.env.ENCRYPTION_KEY;
  
  if (!key) {
    throw new Error(
      'ENCRYPTION_KEY nicht gefunden in .env.local. ' +
      'Generiere einen mit: openssl rand -hex 32'
    );
  }

  if (key.length !== 64) { // 32 bytes = 64 hex characters
    throw new Error('ENCRYPTION_KEY muss 64 Zeichen (32 bytes) lang sein');
  }

  return key;
}

/**
 * Derive encryption key from master key using PBKDF2
 * Adds salt for additional security
 */
function deriveKey(masterKey: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(
    Buffer.from(masterKey, 'hex'),
    salt,
    100000, // iterations
    KEY_LENGTH,
    'sha256'
  );
}

/**
 * Encrypt data using AES-256-GCM
 * 
 * @param plaintext - Data to encrypt (string)
 * @returns Encrypted data in format: salt:iv:authTag:ciphertext (base64)
 * 
 * @example
 * const encrypted = encryptData('Sensitive contract text');
 * // Returns: "abc123...:def456...:ghi789...:jkl012..."
 */
export function encryptData(plaintext: string): string {
  try {
    const masterKey = getEncryptionKey();
    
    // Generate random salt and IV
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Derive key from master key + salt
    const key = deriveKey(masterKey, salt);
    
    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    // Encrypt
    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    // Get auth tag for integrity verification
    const authTag = cipher.getAuthTag();
    
    // Combine: salt:iv:authTag:ciphertext
    return [
      salt.toString('base64'),
      iv.toString('base64'),
      authTag.toString('base64'),
      encrypted
    ].join(':');
    
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Verschlüsselung fehlgeschlagen');
  }
}

/**
 * Decrypt data using AES-256-GCM
 * 
 * @param encryptedData - Encrypted data in format: salt:iv:authTag:ciphertext
 * @returns Decrypted plaintext string
 * 
 * @example
 * const decrypted = decryptData(encrypted);
 * // Returns: "Sensitive contract text"
 */
export function decryptData(encryptedData: string): string {
  try {
    const masterKey = getEncryptionKey();
    
    // Split encrypted data
    const parts = encryptedData.split(':');
    if (parts.length !== 4) {
      throw new Error('Invalid encrypted data format');
    }
    
    const [saltB64, ivB64, authTagB64, ciphertext] = parts;
    
    // Convert from base64
    const salt = Buffer.from(saltB64, 'base64');
    const iv = Buffer.from(ivB64, 'base64');
    const authTag = Buffer.from(authTagB64, 'base64');
    
    // Derive key
    const key = deriveKey(masterKey, salt);
    
    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    // Decrypt
    let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
    
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Entschlüsselung fehlgeschlagen');
  }
}

/**
 * Hash data using SHA-256 (one-way, for verification)
 * 
 * @param data - Data to hash
 * @returns Hex-encoded hash
 * 
 * @example
 * const hash = hashData('contract.pdf');
 * // Returns: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
 */
export function hashData(data: string): string {
  return crypto
    .createHash('sha256')
    .update(data)
    .digest('hex');
}

/**
 * Generate a random token (for upload tokens, session IDs, etc.)
 * 
 * @param length - Token length in bytes (default: 32)
 * @returns Hex-encoded random token
 * 
 * @example
 * const token = generateToken();
 * // Returns: "a1b2c3d4e5f6..."
 */
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate encryption key (for initial setup)
 * Run this once and save to .env.local
 * 
 * @example
 * const key = generateEncryptionKey();
 * console.log('ENCRYPTION_KEY=' + key);
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Verify data integrity using HMAC
 * 
 * @param data - Data to verify
 * @param signature - HMAC signature to check against
 * @returns true if valid, false otherwise
 */
export function verifySignature(data: string, signature: string): boolean {
  try {
    const masterKey = getEncryptionKey();
    const expectedSignature = crypto
      .createHmac('sha256', Buffer.from(masterKey, 'hex'))
      .update(data)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch {
    return false;
  }
}

/**
 * Create HMAC signature for data
 * 
 * @param data - Data to sign
 * @returns Hex-encoded HMAC signature
 */
export function createSignature(data: string): string {
  const masterKey = getEncryptionKey();
  return crypto
    .createHmac('sha256', Buffer.from(masterKey, 'hex'))
    .update(data)
    .digest('hex');
}
