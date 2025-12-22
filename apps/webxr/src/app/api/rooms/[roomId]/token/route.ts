import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'https://adamo-backend-c7ko.onrender.com';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json({ detail: 'Missing authorization' }, { status: 401 });
    }

    const { roomId } = await params;

    const response = await fetch(`${BACKEND_URL}/rooms/${roomId}/token`, {
      method: 'POST',
      headers: { 'Authorization': authHeader },
    });

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      const detail = `Backend error: ${text.substring(0, 100)}`;
      return NextResponse.json({ detail }, { status: response.status || 502 });
    }

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Room token error:', error);
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : 'Failed to fetch room token' },
      { status: 500 }
    );
  }
}
