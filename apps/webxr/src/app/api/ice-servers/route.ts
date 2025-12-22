import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'https://adamo-backend-c7ko.onrender.com';

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/ice-servers`);

    if (!response.ok) {
      console.error('Backend ICE servers error:', response.status);
      return NextResponse.json({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch ICE servers:', error);
    return NextResponse.json({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });
  }
}
