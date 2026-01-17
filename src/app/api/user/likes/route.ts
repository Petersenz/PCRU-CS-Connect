import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('pcru-auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = supabaseAdmin;
    if (!admin) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    // Get user's likes
    const { data: likes, error } = await admin
      .from('likes')
      .select('*')
      .eq('user_id', user.user_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Enrich likes with content details and filter out hidden questions
    const enrichedLikes = await Promise.all(
      (likes || []).map(async (like) => {
        if (like.content_type === 'q') {
          // Get question details (only visible ones)
          const { data: question } = await admin
            .from('questions')
            .select('question_id, title, content, created_at, is_visible, user:users(full_name)')
            .eq('question_id', like.content_id)
            .eq('is_visible', true)
            .single();

          return { ...like, question };
        } else if (like.content_type === 'c') {
          // Get comment details
          const { data: comment } = await admin
            .from('comments')
            .select('comment_id, content, created_at, question_id, user:users(full_name)')
            .eq('comment_id', like.content_id)
            .single();

          return { ...like, comment };
        }
        return like;
      })
    );

    // Filter out likes where question is null (hidden or deleted)
    const filteredLikes = enrichedLikes.filter(like => {
      if (like.content_type === 'q') {
        return like.question !== null;
      }
      return true;
    });

    return NextResponse.json({ success: true, data: filteredLikes });
  } catch (error) {
    console.error('Get user likes error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}
