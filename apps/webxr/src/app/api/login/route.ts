import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'https://adamo-backend-c7ko.onrender.com';
const SIGNALLING_URL = process.env.SIGNALLING_URL || 'wss://adamo-backend-c7ko.onrender.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('Attempting login to:', `${BACKEND_URL}/auth/login`);

    const response = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    console.log('Backend response:', response.status, text.substring(0, 200));

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

    // Backend already provides ice_servers, just add signalling_url
    return NextResponse.json({
      ...data,
      signalling_url: SIGNALLING_URL,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : 'Login failed' },
      { status: 500 }
    );
  }
}
