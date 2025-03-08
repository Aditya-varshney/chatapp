import { NextResponse } from 'next/server';

// Paths that require authentication
const PROTECTED_PATHS = ['/chat', '/settings'];
// Paths that should redirect to dashboard if user is already authenticated
const AUTH_PATHS = ['/login', '/register'];

export default function middleware(req) {
  const { pathname } = req.nextUrl;

  // Check if the path is protected or an auth path
  const isProtectedPath = PROTECTED_PATHS.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );
  const isAuthPath = AUTH_PATHS.some(path => pathname === path);
  
  // If neither protected nor auth path, proceed as normal
  if (!isProtectedPath && !isAuthPath) {
    return NextResponse.next();
  }
  
  // Check if user is authenticated via auth cookie
  const authToken = req.cookies.get('auth-token');
  const isAuthenticated = !!authToken;
  
  // If protected path and user is not authenticated, redirect to login
  if (isProtectedPath && !isAuthenticated) {
    const url = new URL('/login', req.url);
    url.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(url);
  }
  
  // If auth path and user is authenticated, redirect to chat
  if (isAuthPath && isAuthenticated) {
    return NextResponse.redirect(new URL('/chat', req.url));
  }
  
  // Otherwise, proceed as normal
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protect these paths
    '/chat/:path*',
    '/settings',
    // Also check these paths for potential redirects
    '/login',
    '/register',
  ],
};
