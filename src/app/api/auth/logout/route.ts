import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'ออกจากระบบเรียบร้อยแล้ว'
    });

    // Clear auth cookie
    response.cookies.delete('pcru-auth-token');

    return response;
  } catch (error) {
    console.error('Logout API error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดของเซิร์ฟเวอร์' },
      { status: 500 }
    );
  }
}