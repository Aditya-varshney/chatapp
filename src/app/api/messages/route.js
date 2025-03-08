import { NextResponse } from 'next/server';

// In-memory message store - in production use a database
const messageStore = new Map();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');
    
    if (!roomId) {
      return NextResponse.json(
        { error: 'Room ID is required' },
        { status: 400 }
      );
    }
    
    // Get messages for the specified room
    const messages = messageStore.get(roomId) || [];
    
    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { roomId, message } = body;
    
    if (!roomId || !message || !message.content || !message.sender) {
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 400 }
      );
    }
    
    // Add timestamp if not provided
    const newMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: message.timestamp || new Date().toISOString(),
    };
    
    // Store the message
    if (!messageStore.has(roomId)) {
      messageStore.set(roomId, []);
    }
    
    messageStore.get(roomId).push(newMessage);
    
    return NextResponse.json({ 
      message: 'Message saved successfully',
      data: newMessage
    }, { status: 201 });
  } catch (error) {
    console.error('Error saving message:', error);
    return NextResponse.json(
      { error: 'Failed to save message' },
      { status: 500 }
    );
  }
}
