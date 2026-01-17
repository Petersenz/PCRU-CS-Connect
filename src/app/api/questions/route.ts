import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { profanityFilter } from '@/lib/profanity-filter';

// POST - Create new question
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

    const { title, content, category_ids } = await request.json();

    // Validate input
    if (!title || !content || !category_ids || category_ids.length === 0) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      );
    }

    // ตรวจสอบคำหยาบในหัวข้อ
    const titleValidation = profanityFilter.validate(title, {
      checkProfanity: true,
      checkSpam: true,
      checkLength: true,
      minLength: 5,
      maxLength: 200
    });

    console.log('Title validation:', titleValidation);

    if (!titleValidation.isValid) {
      return NextResponse.json(
        { error: titleValidation.errors[0] || 'หัวข้อไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    // ตรวจสอบคำหยาบในเนื้อหา
    const contentValidation = profanityFilter.validate(content, {
      checkProfanity: true,
      checkSpam: true,
      checkLength: true,
      minLength: 10,
      maxLength: 10000
    });

    if (!contentValidation.isValid) {
      return NextResponse.json(
        { error: contentValidation.errors[0] || 'เนื้อหาไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    // Insert question
    const { data: question, error: questionError } = await supabaseAdmin
      .from('questions')
      .insert({
        title,
        content,
        user_id: user.user_id,
        view_count: 0,
        is_visible: true
      })
      .select()
      .single();

    if (questionError) throw questionError;

    // Insert question categories
    const categoryInserts = category_ids.map((category_id: string) => ({
      question_id: question.question_id,
      category_id
    }));

    const { error: categoryError } = await supabaseAdmin
      .from('question_categories')
      .insert(categoryInserts);

    if (categoryError) throw categoryError;

    return NextResponse.json({ success: true, data: question });
  } catch (error) {
    console.error('Create question error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    );
  }
}