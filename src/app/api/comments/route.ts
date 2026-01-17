import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { profanityFilter } from '@/lib/profanity-filter';

// POST - Create new comment
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'กรุณาเข้าสู่ระบบก่อน' },
        { status: 401 }
      );
    }

    if (!supabaseAdmin) throw new Error('Supabase admin not initialized');

    const { content, question_id } = await request.json();

    // Validate input
    if (!content || !question_id) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      );
    }

    // ตรวจสอบคำหยาบและ spam
    const validation = profanityFilter.validate(content, {
      checkProfanity: true,
      checkSpam: true,
      checkLength: true,
      minLength: 1,
      maxLength: 5000
    });

    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.errors[0] || 'เนื้อหาไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    // Insert comment
    const { data, error } = await supabaseAdmin
      .from('comments')
      .insert({
        content,
        user_id: user.user_id,
        question_id
      })
      .select(`
        *,
        user:users(user_id, full_name, role)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Create comment error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    );
  }
}