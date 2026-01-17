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
    if (!user || user.role !== 'a') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const admin = supabaseAdmin;
    if (!admin) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const [
      usersCount,
      questionsCount,
      commentsCount,
      reportsCount
    ] = await Promise.all([
      admin.from('users').select('*', { count: 'exact', head: true }),
      admin.from('questions').select('*', { count: 'exact', head: true }).eq('is_visible', true),
      admin.from('comments').select('*', { count: 'exact', head: true }),
      admin.from('reports').select('*', { count: 'exact', head: true }).eq('is_resolved', false)
    ]);

    const statistics = {
      total_users: usersCount.count || 0,
      total_questions: questionsCount.count || 0,
      total_comments: commentsCount.count || 0,
      pending_reports: reportsCount.count || 0
    };

    return NextResponse.json({ success: true, data: statistics });
  } catch (error) {
    console.error('Get statistics error:', error);
    return NextResponse.json(
      { error: 'Failed to get statistics' },
      { status: 500 }
    );
  }
}
