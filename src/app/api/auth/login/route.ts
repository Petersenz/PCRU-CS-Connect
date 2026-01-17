import { NextRequest, NextResponse } from 'next/server';
import { login, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { user_id, password } = await request.json();

    if (!user_id || !password) {
      return NextResponse.json(
        { error: 'กรุณากรอกรหัสผู้ใช้และรหัสผ่าน' },
        { status: 400 }
      );
    }

    const result = await login({ user_id, password });

    if (!result) {
      return NextResponse.json(
        { error: 'รหัสผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      );
    }

    // Set auth cookie
    const response = NextResponse.json({
      success: true,
      user: result.user,
      message: 'เข้าสู่ระบบสำเร็จ'
    });

    // Set cookie in response
    response.cookies.set('pcru-auth-token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดของเซิร์ฟเวอร์' },
      { status: 500 }
    );
  }
}