import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { db } from './supabase';
import type { AuthUser, LoginCredentials } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET!;
const TOKEN_COOKIE_NAME = 'pcru-auth-token';

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Generate JWT token
export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      user_id: user.user_id,
      email: user.email,
      full_name: user.full_name,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Verify JWT token
export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return decoded;
  } catch (error) {
    return null;
  }
}

// Login function
export async function login(credentials: LoginCredentials): Promise<{ user: AuthUser; token: string } | null> {
  try {
    // Find user by user_id (รหัสนักศึกษา)
    const user = await db.getUserById(credentials.user_id);
    
    if (!user) {
      return null;
    }

    // Check if password exists
    if (!user.password) {
      console.error('User password is null or undefined');
      return null;
    }

    // Verify password
    const isValidPassword = await verifyPassword(credentials.password, user.password);
    
    if (!isValidPassword) {
      return null;
    }

    // Create auth user object (without password)
    const authUser: AuthUser = {
      user_id: user.user_id,
      email: user.email,
      full_name: user.full_name,
      role: user.role
    };

    // Generate token
    const token = generateToken(authUser);

    return { user: authUser, token };
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

// Get current user from token
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;

    if (!token) {
      return null;
    }

    return verifyToken(token);
  } catch {
    return null;
  }
}

// Set auth cookie
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 // 7 days
  });
}

// Clear auth cookie
export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_COOKIE_NAME);
}

// Check if user has required role
export function hasRole(user: AuthUser | null, requiredRole: 's' | 't' | 'a'): boolean {
  if (!user) return false;
  
  // Admin can access everything
  if (user.role === 'a') return true;
  
  // Teacher can access teacher and student features
  if (user.role === 't' && (requiredRole === 't' || requiredRole === 's')) return true;
  
  // Student can only access student features
  if (user.role === 's' && requiredRole === 's') return true;
  
  return false;
}

// Check if user is admin
export function isAdmin(user: AuthUser | null): boolean {
  return user?.role === 'a';
}

// Check if user is teacher or admin
export function isTeacherOrAdmin(user: AuthUser | null): boolean {
  return user?.role === 't' || user?.role === 'a';
}

// Generate random password for new users
export function generateRandomPassword(length: number = 8): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return password;
}