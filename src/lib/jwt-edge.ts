// JWT utilities for Edge Runtime (middleware)
// Using Web Crypto API instead of Node.js crypto

export interface JWTPayload {
  user_id: string;
  email: string;
  full_name: string;
  role: 's' | 't' | 'a';
  iat?: number;
  exp?: number;
}

// Base64 URL encode
function base64UrlEncode(data: string): string {
  return btoa(data)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Base64 URL decode
function base64UrlDecode(data: string): string {
  let base64 = data.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return atob(base64);
}

// Verify JWT token using Web Crypto API
export async function verifyJWT(token: string, secret: string): Promise<JWTPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const [headerB64, payloadB64, signatureB64] = parts;
    
    // Decode payload
    const payload = JSON.parse(base64UrlDecode(payloadB64)) as JWTPayload;
    
    // Check expiration
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }

    // Verify signature
    const encoder = new TextEncoder();
    const data = encoder.encode(`${headerB64}.${payloadB64}`);
    const secretKey = encoder.encode(secret);
    
    const key = await crypto.subtle.importKey(
      'raw',
      secretKey,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signature = Uint8Array.from(atob(base64UrlDecode(signatureB64)), c => c.charCodeAt(0));
    
    const isValid = await crypto.subtle.verify('HMAC', key, signature, data);
    
    return isValid ? payload : null;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}