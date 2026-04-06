import { NextRequest, NextResponse } from 'next/server';
import { RoomServiceClient } from 'livekit-server-sdk';

export const revalidate = 0;

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface BackendRoom {
  id: string;
  name: string;
  robot_name?: string;
  livekit_url?: string;
  livekit_room_name?: string;
  is_online: boolean;
  last_seen?: string;
}

interface StreamingRoom extends BackendRoom {
  is_streaming: boolean;
  track_names: string[];
  livekit_url: string;
  livekit_room_name: string;
}

/**
 * GET /api/observe
 *
 * Returns the list of rooms enriched with live streaming status.
 * Uses LiveKit Server SDK to check each online room for participants
 * that are publishing video tracks.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const defaultLivekitUrl = process.env.LIVEKIT_URL;

  if (!apiKey || !apiSecret) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  // 1. Fetch rooms from the backend
  let rooms: BackendRoom[];
  try {
    const resp = await fetch(`${BACKEND_URL}/rooms`, {
      headers: { Authorization: authHeader },
    });
    if (!resp.ok) {
      return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: resp.status });
    }
    const data = await resp.json();
    rooms = data.rooms || [];
  } catch (e) {
    return NextResponse.json({ error: 'Backend unreachable' }, { status: 502 });
  }

  // 2. For each online room, check LiveKit for active video tracks
  const livekitClient = new RoomServiceClient(
    defaultLivekitUrl!,
    apiKey,
    apiSecret,
  );

  const results: StreamingRoom[] = await Promise.all(
    rooms.map(async (room): Promise<StreamingRoom> => {
      const livekitUrl = room.livekit_url || defaultLivekitUrl || '';
      const livekitRoomName = room.livekit_room_name || room.name;

      if (!room.is_online) {
        return {
          ...room,
          is_streaming: false,
          track_names: [],
          livekit_url: livekitUrl,
          livekit_room_name: livekitRoomName,
        };
      }

      try {
        const participants = await livekitClient.listParticipants(livekitRoomName);
        const trackNames: string[] = [];

        for (const p of participants) {
          for (const track of p.tracks) {
            if (track.type === 1 && track.name) {
              // type 1 = VIDEO
              trackNames.push(track.name);
            }
          }
        }

        return {
          ...room,
          is_streaming: trackNames.length > 0,
          track_names: trackNames,
          livekit_url: livekitUrl,
          livekit_room_name: livekitRoomName,
        };
      } catch {
        // Room may not exist in LiveKit yet
        return {
          ...room,
          is_streaming: false,
          track_names: [],
          livekit_url: livekitUrl,
          livekit_room_name: livekitRoomName,
        };
      }
    })
  );

  return NextResponse.json(
    { rooms: results },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
