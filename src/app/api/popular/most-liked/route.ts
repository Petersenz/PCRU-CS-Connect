import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all'; // all, questions, comments

    let data: any = { questions: [], comments: [] };

    if (type === 'all' || type === 'questions') {
      // Get questions
      const { data: questions, error: qError } = await supabaseAdmin
        .from('questions')
        .select(`
          *,
          user:users(user_id, full_name, role),
          categories:question_categories(
            category:categories(category_id, category_name)
          )
        `)
        .eq('is_visible', true)
        .order('created_at', { ascending: false })
        .limit(50);

      if (qError) throw qError;

      // Count likes for each question
      const questionsWithLikes = await Promise.all(
        (questions || []).map(async (q) => {
          const { count } = await supabaseAdmin
            .from('likes')
            .select('*', { count: 'exact', head: true })
            .eq('content_id', q.question_id)
            .eq('content_type', 'q');
          
          return { ...q, likes: count || 0 };
        })
      );

      // Sort by likes and take top 20
      data.questions = questionsWithLikes.sort((a, b) => b.likes - a.likes).slice(0, 20);
    }

    if (type === 'all' || type === 'comments') {
      // Get comments
      const { data: comments, error: cError } = await supabaseAdmin
        .from('comments')
        .select(`
          *,
          user:users(user_id, full_name, role),
          question:questions(question_id, title)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (cError) throw cError;

      // Count likes for each comment
      const commentsWithLikes = await Promise.all(
        (comments || []).map(async (c) => {
          const { count } = await supabaseAdmin
            .from('likes')
            .select('*', { count: 'exact', head: true })
            .eq('content_id', c.comment_id)
            .eq('content_type', 'c');
          
          return { ...c, likes: count || 0 };
        })
      );

      // Sort by likes and take top 20
      data.comments = commentsWithLikes.sort((a, b) => b.likes - a.likes).slice(0, 20);
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Get most liked error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}
