import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, action } = body;
    
    // Simple validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Handle login
    if (action === 'login') {
      // In a real app, validate credentials against database
      // For now, mocking a successful login with a dummy user
      
      // Set an auth cookie
      cookies().set({
        name: 'auth-token',
        value: 'dummy-token-would-be-jwt-in-real-app',
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });

      return NextResponse.json({
        user: {
          id: '123',
          name: 'Demo User',
          email,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        },
      });
    } 
    
    // Handle register
    else if (action === 'register') {
      // In a real app, store user in database
      // For demo, just pretend we registered and return success
      
      return NextResponse.json({
        message: 'Registration successful',
        user: {
          id: '123',
          name: email.split('@')[0],
          email,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        },
      });
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Check if user is logged in by verifying the auth cookie
  // Return user data if authenticated
  try {
    // Fix: Use await with cookies() function
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');
    
    if (!token) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }
    
    // In a real app, verify JWT token and fetch user data
    // For now, return a dummy user
    return NextResponse.json({
      authenticated: true,
      user: {
        id: '123',
        name: 'Demo User',
        email: 'user@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
      },
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { authenticated: false, error: 'Authentication check failed' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  // Logout - clear the auth cookie
  try {
    // Fix: Use await with cookies() function
    const cookieStore = await cookies();
    cookieStore.delete('auth-token');
    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
