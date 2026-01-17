import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

const WORDS_FILE = path.join(process.cwd(), 'src/lib/profanity-words.json');

// GET - ดึงรายการคำทั้งหมด
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('pcru-auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // เฉพาะ admin เท่านั้น
    if (decoded.role !== 'a') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = JSON.parse(fs.readFileSync(WORDS_FILE, 'utf-8'));

    return NextResponse.json({
      success: true,
      data: {
        words: data.words,
        count: data.words.length,
        version: data.version,
        lastUpdated: data.lastUpdated
      }
    });
  } catch (error) {
    console.error('Error fetching profanity words:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - เพิ่มคำใหม่
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('pcru-auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // เฉพาะ admin เท่านั้น
    if (decoded.role !== 'a') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { word } = await request.json();

    if (!word || typeof word !== 'string') {
      return NextResponse.json(
        { error: 'Invalid word' },
        { status: 400 }
      );
    }

    const cleanWord = word.trim().toLowerCase();
    if (!cleanWord) {
      return NextResponse.json(
        { error: 'Word cannot be empty' },
        { status: 400 }
      );
    }

    const data = JSON.parse(fs.readFileSync(WORDS_FILE, 'utf-8'));

    // ตรวจสอบว่ามีคำนี้อยู่แล้วหรือไม่
    if (data.words.includes(cleanWord)) {
      return NextResponse.json(
        { error: 'Word already exists' },
        { status: 400 }
      );
    }

    // เพิ่มคำใหม่
    data.words.push(cleanWord);
    data.words.sort(); // เรียงตามตัวอักษร
    data.lastUpdated = new Date().toISOString().split('T')[0];

    // บันทึกไฟล์
    fs.writeFileSync(WORDS_FILE, JSON.stringify(data, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'Word added successfully',
      data: {
        word: cleanWord,
        totalWords: data.words.length
      }
    });
  } catch (error) {
    console.error('Error adding profanity word:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - ลบคำ
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('pcru-auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // เฉพาะ admin เท่านั้น
    if (decoded.role !== 'a') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const word = searchParams.get('word');

    if (!word) {
      return NextResponse.json(
        { error: 'Word parameter is required' },
        { status: 400 }
      );
    }

    const cleanWord = word.trim().toLowerCase();
    const data = JSON.parse(fs.readFileSync(WORDS_FILE, 'utf-8'));

    // ตรวจสอบว่ามีคำนี้หรือไม่
    const index = data.words.indexOf(cleanWord);
    if (index === -1) {
      return NextResponse.json(
        { error: 'Word not found' },
        { status: 404 }
      );
    }

    // ลบคำ
    data.words.splice(index, 1);
    data.lastUpdated = new Date().toISOString().split('T')[0];

    // บันทึกไฟล์
    fs.writeFileSync(WORDS_FILE, JSON.stringify(data, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'Word deleted successfully',
      data: {
        word: cleanWord,
        totalWords: data.words.length
      }
    });
  } catch (error) {
    console.error('Error deleting profanity word:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
