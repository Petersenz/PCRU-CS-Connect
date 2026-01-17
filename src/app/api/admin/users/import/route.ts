import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('pcru-auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user || user.role !== 'a') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const { users } = await request.json();

    if (!users || !Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: 'ไม่มีข้อมูลผู้ใช้' }, { status: 400 });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as any[]
    };

    for (let i = 0; i < users.length; i++) {
      const userData = users[i];
      
      try {
        // Validate required fields
        if (!userData.email || !userData.password || !userData.full_name) {
          results.failed++;
          results.errors.push({
            row: i + 2, // +2 because row 1 is header
            email: userData.email,
            error: 'ข้อมูลไม่ครบถ้วน (ต้องมี email, password, full_name)'
          });
          continue;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
          results.failed++;
          results.errors.push({
            row: i + 2,
            email: userData.email,
            error: 'รูปแบบอีเมลไม่ถูกต้อง'
          });
          continue;
        }

        // Validate role
        const validRoles = ['s', 't', 'a'];
        const role = userData.role || 's';
        if (!validRoles.includes(role)) {
          results.failed++;
          results.errors.push({
            row: i + 2,
            email: userData.email,
            error: 'บทบาทไม่ถูกต้อง (ต้องเป็น s, t, หรือ a)'
          });
          continue;
        }

        // Check if email already exists
        const { data: existingUser } = await supabaseAdmin
          .from('users')
          .select('email')
          .eq('email', userData.email)
          .single();

        if (existingUser) {
          results.failed++;
          results.errors.push({
            row: i + 2,
            email: userData.email,
            error: 'อีเมลนี้มีอยู่ในระบบแล้ว'
          });
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Insert user
        const { error } = await supabaseAdmin
          .from('users')
          .insert({
            email: userData.email,
            password: hashedPassword,
            full_name: userData.full_name,
            role: role
          });

        if (error) throw error;

        results.success++;
      } catch (error) {
        console.error(`Error importing user at row ${i + 2}:`, error);
        results.failed++;
        results.errors.push({
          row: i + 2,
          email: userData.email,
          error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      results 
    });
  } catch (error) {
    console.error('Import users error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}
