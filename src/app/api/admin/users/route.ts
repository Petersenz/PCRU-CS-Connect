import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { hashPassword } from '@/lib/auth';

// GET - Get all users
export async function GET() {
  try {
    if (!supabaseAdmin) throw new Error('Supabase admin not initialized');

    const { data, error } = await supabaseAdmin
      .from('users')
      .select('user_id, email, full_name, role, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    );
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) throw new Error('Supabase admin not initialized');

    const { user_id, email, password, full_name, role } = await request.json();

    // Validate input
    if (!user_id || !email || !password || !full_name || !role) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Insert user using admin client (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert({
        user_id,
        email,
        password: hashedPassword,
        full_name,
        role
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'รหัสผู้ใช้หรืออีเมลนี้มีอยู่แล้ว' },
          { status: 400 }
        );
      }
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    );
  }
}

// PUT - Update user
export async function PUT(request: NextRequest) {
  try {
    if (!supabaseAdmin) throw new Error('Supabase admin not initialized');

    const { user_id, email, full_name, role, password } = await request.json();

    if (!user_id) {
      return NextResponse.json(
        { error: 'ไม่พบรหัสผู้ใช้' },
        { status: 400 }
      );
    }

    const updateData: any = {
      email,
      full_name,
      role,
      updated_at: new Date().toISOString()
    };

    // If password is provided, hash it
    if (password) {
      updateData.password = await hashPassword(password);
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('user_id', user_id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    );
  }
}

// DELETE - Delete user
export async function DELETE(request: NextRequest) {
  try {
    if (!supabaseAdmin) throw new Error('Supabase admin not initialized');

    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json(
        { error: 'ไม่พบรหัสผู้ใช้' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('user_id', user_id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    );
  }
}