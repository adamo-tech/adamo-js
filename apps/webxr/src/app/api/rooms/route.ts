import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'https://adamo-backend-c7ko.onrender.com';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json({ detail: 'Missing authorization' }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_URL}/rooms`, {
      headers: { 'Authorization': authHeader },
    });

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { detail: `Backend error: ${text.substring(0, 100)}` },
        { status: 502 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Rooms error:', error);
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : 'Failed to fetch rooms' },
      { status: 500 }
    );
  }
}
