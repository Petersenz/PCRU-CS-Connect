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
    if (!user || (user.role !== 'a' && user.role !== 't')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const admin = supabaseAdmin;
    if (!admin) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'pending';

    let query = admin
      .from('reports')
      .select(`
        *,
        reporter:users!reports_user_id_fkey(user_id, full_name, role)
      `)
      .order('created_at', { ascending: false });

    if (filter === 'pending') {
      query = query.eq('is_resolved', false);
    } else if (filter === 'resolved') {
      query = query.eq('is_resolved', true);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Get reports error:', error);
    return NextResponse.json(
      { error: 'Failed to get reports' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('pcru-auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user || (user.role !== 'a' && user.role !== 't')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { report_id, is_resolved, action } = await request.json();

    if (!report_id) {
      return NextResponse.json({ error: 'Missing report_id' }, { status: 400 });
    }

    const admin = supabaseAdmin;
    if (!admin) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    // Get report details first
    const { data: report, error: reportError } = await admin
      .from('reports')
      .select('*')
      .eq('report_id', report_id)
      .single();

    if (reportError) throw reportError;

    // Update report status
    const { data, error } = await admin
      .from('reports')
      .update({ is_resolved, updated_at: new Date().toISOString() })
      .eq('report_id', report_id)
      .select()
      .single();

    if (error) throw error;

    // Handle content based on action
    if (is_resolved && report && action === 'hide') {
      // Only hide/delete if action is 'hide'
      if (report.content_type === 'q') {
        // Hide question
        await admin
          .from('questions')
          .update({ is_visible: false })
          .eq('question_id', report.content_id);
      } else if (report.content_type === 'c') {
        // Delete comment
        await admin
          .from('comments')
          .delete()
          .eq('comment_id', report.content_id);
      }
    }
    // If action is 'reject', just mark as resolved without hiding/deleting content

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Update report error:', error);
    return NextResponse.json(
      { error: 'Failed to update report' },
      { status: 500 }
    );
  }
}
