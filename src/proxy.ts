import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/jwt-edge';

// Routes that require authentication (middleware level)
const protectedRoutes: any[] = [
  // '/profile', // ใช้ client-side protection แทน
  // '/create', // ใช้ client-side protection แทน
];

// Routes that require admin access
const adminRoutes = [
  '/admin',
];

// Routes that require teacher or admin access
const teacherRoutes: string[] = [
  // Add teacher-specific routes here if needed
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookies
  const token = request.cookies.get('pcru-auth-token')?.value;

  // console.log('Proxy - All cookies:', request.cookies.getAll().map(c => c.name));

  // console.log('Proxy - Path:', pathname);
  // console.log('Proxy - Token exists:', !!token);

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    console.log('Proxy - Protected route detected');

    if (!token) {
      console.log('Proxy - No token, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Verify token using Edge-compatible JWT
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.log('Proxy - JWT_SECRET not found');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    console.log('Proxy - Token value:', token.substring(0, 20) + '...');
    const user = await verifyJWT(token, jwtSecret);
    console.log('Proxy - User from token:', user);

    if (!user) {
      console.log('Proxy - Invalid token, redirecting to login');
      console.log('Proxy - Full token:', token);
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('pcru-auth-token');
      return response;
    }

    // Check admin routes
    const isAdminRoute = adminRoutes.some(route =>
      pathname.startsWith(route)
    );

    if (isAdminRoute && user.role !== 'a') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // Check teacher routes
    const isTeacherRoute = teacherRoutes.some(route =>
      pathname.startsWith(route)
    );

    if (isTeacherRoute && user.role !== 't' && user.role !== 'a') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Redirect authenticated users away from login page
  if (pathname === '/login' && token) {
    const jwtSecret = process.env.JWT_SECRET;
    if (jwtSecret) {
      const user = await verifyJWT(token, jwtSecret);
      if (user) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
