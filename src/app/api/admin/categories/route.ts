import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET - Get all categories
export async function GET() {
  try {
    if (!supabaseAdmin) throw new Error('Supabase admin not initialized');

    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .order('category_name');

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    );
  }
}

// POST - Create new category
export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) throw new Error('Supabase admin not initialized');

    const { category_name } = await request.json();

    if (!category_name) {
      return NextResponse.json(
        { error: 'กรุณากรอกชื่อหมวดหมู่' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert({ category_name })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'ชื่อหมวดหมู่นี้มีอยู่แล้ว' },
          { status: 400 }
        );
      }
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    );
  }
}

// PUT - Update category
export async function PUT(request: NextRequest) {
  try {
    if (!supabaseAdmin) throw new Error('Supabase admin not initialized');

    const { category_id, category_name } = await request.json();

    if (!category_id || !category_name) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('categories')
      .update({ category_name })
      .eq('category_id', category_id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Update category error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    );
  }
}

// DELETE - Delete category (with RESTRICT constraint)
export async function DELETE(request: NextRequest) {
  try {
    if (!supabaseAdmin) throw new Error('Supabase admin not initialized');

    const { searchParams } = new URL(request.url);
    const category_id = searchParams.get('category_id');

    if (!category_id) {
      return NextResponse.json(
        { error: 'ไม่พบรหัสหมวดหมู่' },
        { status: 400 }
      );
    }

    // Try to delete - database will prevent if in use
    const { error } = await supabaseAdmin
      .from('categories')
      .delete()
      .eq('category_id', category_id);

    if (error) {
      // Check if it's a foreign key violation (category is in use)
      if (error.code === '23503') {
        return NextResponse.json(
          { 
            error: 'ไม่สามารถลบหมวดหมู่นี้ได้ เนื่องจากมีกระทู้ที่ใช้หมวดหมู่นี้อยู่',
            inUse: true 
          },
          { status: 400 }
        );
      }
      throw error;
    }

    return NextResponse.json({ success: true, message: 'ลบหมวดหมู่สำเร็จ' });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    );
  }
}