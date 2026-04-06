import { NextRequest, NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';

export const revalidate = 0;

/**
 * GET /api/token?room=<roomName>&username=<identity>
 *
 * Generates a LiveKit access token for the given room and identity.
 * Used by the observe page to create lightweight viewer connections.
 */
export async function GET(req: NextRequest) {
  const room = req.nextUrl.searchParams.get('room');
  const username = req.nextUrl.searchParams.get('username');

  if (!room || !username) {
    return NextResponse.json(
      { error: 'Missing "room" and/or "username" query parameters' },
      { status: 400 },
    );
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  const at = new AccessToken(apiKey, apiSecret, { identity: username });
  at.addGrant({ room, roomJoin: true, canPublish: false, canSubscribe: true });

  return NextResponse.json(
    { token: await at.toJwt() },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
