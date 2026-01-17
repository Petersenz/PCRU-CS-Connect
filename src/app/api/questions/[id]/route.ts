import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { profanityFilter } from '@/lib/profanity-filter';

// Update question
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { title, content } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'Title and content are required' },
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

    if (!titleValidation.isValid) {
      return NextResponse.json(
        { success: false, error: titleValidation.errors[0] || 'หัวข้อไม่ถูกต้อง' },
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
        { success: false, error: contentValidation.errors[0] || 'เนื้อหาไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    console.log('Updating question:', { questionId: id, userId: user.user_id });
    const data = await db.updateQuestion(id, user.user_id, { title, content });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Update question error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update question' },
      { status: error.message === 'Unauthorized' ? 403 : 500 }
    );
  }
}

// Delete question
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    // console.log('Deleting question:', { questionId: id, userId: user.user_id });
    await db.deleteQuestion(id, user.user_id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete question error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete question' },
      { status: error.message === 'Unauthorized' ? 403 : 500 }
    );
  }
}
