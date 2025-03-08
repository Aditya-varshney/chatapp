import { NextResponse } from 'next/server';

// This is needed for Next.js App Router to properly handle WebSockets
// In development mode, we'll just return a success response
// For production, use the custom server.js

export async function GET(req) {
  // In dev mode, we just need to respond to the initial connection check
  // The real Socket.io connection happens in server.js in production
  return NextResponse.json(
    { message: 'Development mode: WebSocket endpoint not available. Using mock implementation.' },
    { status: 200 }
  );
}

export async function HEAD(req) {
  // Similar to GET but without the body
  return new NextResponse(null, { status: 200 });
}

export async function POST(req) {
  // For any Socket.io polling requests
  return NextResponse.json(
    { message: 'For Socket.io connections, use the custom server.js in production' },
    { status: 200 }
  );
}
