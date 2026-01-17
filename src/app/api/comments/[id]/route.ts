import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { profanityFilter } from '@/lib/profanity-filter';

// Update comment
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
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
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
        { success: false, error: validation.errors[0] || 'เนื้อหาไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    console.log('Updating comment:', { commentId: id, userId: user.user_id });
    const data = await db.updateComment(parseInt(id), user.user_id, content);

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Update comment error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update comment' },
      { status: error.message === 'Unauthorized' ? 403 : 500 }
    );
  }
}

// Delete comment
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
    console.log('Deleting comment:', { commentId: id, userId: user.user_id });
    await db.deleteComment(parseInt(id), user.user_id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete comment error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete comment' },
      { status: error.message === 'Unauthorized' ? 403 : 500 }
    );
  }
}
