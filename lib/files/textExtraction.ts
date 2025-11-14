/**
 * File Text Extraction Utilities
 * ===============================
 * Extrahiert Text aus PDF, DOCX und TXT Dateien
 * 
 * Unterstützte Formate:
 * - PDF (.pdf)
 * - Word Documents (.docx)
 * - Plain Text (.txt)
 * 
 * @version 1.0
 * @date 2025-11-14
 */

import { Buffer } from 'buffer';

/**
 * Extract text from uploaded file
 * 
 * @param file - File object from FormData
 * @returns Extracted text content
 * @throws Error if file type not supported or extraction fails
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  // Plain text files
  if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
    return await extractTextFromTxt(file);
  }

  // PDF files
  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    return await extractTextFromPdf(file);
  }

  // Word documents
  if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.endsWith('.docx')
  ) {
    return await extractTextFromDocx(file);
  }

  throw new Error(
    `Dateiformat nicht unterstützt: ${fileType || 'unbekannt'}. ` +
    `Erlaubt sind: PDF, DOCX, TXT`
  );
}

/**
 * Extract text from plain text file
 */
async function extractTextFromTxt(file: File): Promise<string> {
  try {
    const text = await file.text();
    
    if (!text || text.trim().length === 0) {
      throw new Error('Text-Datei ist leer');
    }

    return text;
  } catch (error) {
    throw new Error('Fehler beim Lesen der Text-Datei');
  }
}

/**
 * Extract text from PDF file
 * Uses pdf-parse library
 */
async function extractTextFromPdf(file: File): Promise<string> {
  try {
    // Dynamic import for Node.js only library
    const pdfParse = (await import('pdf-parse/lib/pdf-parse.js')).default;
    
    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse PDF
    const data = await pdfParse(buffer);

    if (!data.text || data.text.trim().length === 0) {
      throw new Error('PDF enthält keinen extrahierbaren Text');
    }

    return data.text;
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error(
      'Fehler beim Lesen der PDF-Datei. ' +
      'Stelle sicher, dass die PDF Text enthält (keine gescannten Bilder).'
    );
  }
}

/**
 * Extract text from DOCX file
 * Uses mammoth library
 */
async function extractTextFromDocx(file: File): Promise<string> {
  try {
    // Dynamic import for Node.js only library
    const mammoth = await import('mammoth');
    
    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text
    const result = await mammoth.extractRawText({ buffer });

    if (!result.value || result.value.trim().length === 0) {
      throw new Error('DOCX enthält keinen extrahierbaren Text');
    }

    return result.value;
  } catch (error) {
    console.error('DOCX extraction error:', error);
    throw new Error('Fehler beim Lesen der DOCX-Datei');
  }
}

/**
 * Validate file size
 * 
 * @param file - File to validate
 * @param maxSizeMB - Maximum size in megabytes (default: 10)
 * @throws Error if file too large
 */
export function validateFileSize(file: File, maxSizeMB: number = 10): void {
  const maxBytes = maxSizeMB * 1024 * 1024;
  
  if (file.size > maxBytes) {
    throw new Error(
      `Datei zu groß: ${(file.size / 1024 / 1024).toFixed(2)} MB. ` +
      `Maximum: ${maxSizeMB} MB`
    );
  }
}

/**
 * Validate file type
 * 
 * @param file - File to validate
 * @param allowedTypes - Array of allowed MIME types
 * @throws Error if file type not allowed
 */
export function validateFileType(
  file: File,
  allowedTypes: string[] = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
): void {
  const fileName = file.name.toLowerCase();
  const fileType = file.type;

  // Check MIME type or file extension
  const isValid = 
    allowedTypes.includes(fileType) ||
    fileName.endsWith('.pdf') ||
    fileName.endsWith('.docx') ||
    fileName.endsWith('.txt');

  if (!isValid) {
    throw new Error(
      `Dateiformat nicht erlaubt: ${fileType || 'unbekannt'}. ` +
      `Erlaubt sind: PDF, DOCX, TXT`
    );
  }
}

/**
 * Clean extracted text (remove excess whitespace, etc.)
 * 
 * @param text - Raw extracted text
 * @returns Cleaned text
 */
export function cleanText(text: string): string {
  return text
    // Remove multiple spaces
    .replace(/  +/g, ' ')
    // Remove multiple line breaks
    .replace(/\n\n\n+/g, '\n\n')
    // Trim each line
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    // Trim overall
    .trim();
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

/**
 * Format file size for display
 * 
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g. "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
