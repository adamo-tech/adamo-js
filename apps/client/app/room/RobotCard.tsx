'use client';

import { useEffect, useRef, useState } from 'react';

type StreamingRoom = {
  id: string;
  name: string;
  robot_name?: string;
  is_streaming: boolean;
  track_names: string[];
  livekit_url: string;
  livekit_room_name: string;
};

type RobotCardProps = {
  room: StreamingRoom;
  preferredTrack: string;
  onClick: () => void;
};

/**
 * RobotCard — shows a live video thumbnail from one camera.
 *
 * Creates a lightweight read-only LiveKit Room connection to show one video
 * track. Disconnects on unmount.
 */
export function RobotCard({ room, preferredTrack, onClick }: RobotCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const roomRef = useRef<any>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);

  // Determine which track to request (prefer the given track, fall back to first available)
  const trackName = room.track_names.includes(preferredTrack)
    ? preferredTrack
    : room.track_names[0] || preferredTrack;

  useEffect(() => {
    if (!room.is_streaming) return;

    let cancelled = false;
    let lkRoom: any = null;

    async function connect() {
      try {
        // Get a view-only token
        const user = JSON.parse(sessionStorage.getItem('user') || '{}');
        const identity = `observer-${user.email || 'anon'}-${room.id}`;
        const tokenResp = await fetch(
          `/api/token?room=${encodeURIComponent(room.livekit_room_name)}&username=${encodeURIComponent(identity)}`
        );
        if (!tokenResp.ok) throw new Error('Token fetch failed');
        const { token } = await tokenResp.json();

        if (cancelled) return;

        // Dynamic import to avoid SSR
        const lk = await import('livekit-client');

        lkRoom = new lk.Room({
          adaptiveStream: true,
          dynacast: false,
        });

        lkRoom.on(lk.RoomEvent.TrackSubscribed, (track: any) => {
          if (cancelled) return;
          if (track.kind === 'video' && videoRef.current) {
            track.attach(videoRef.current);
            setPlaying(true);
          }
        });

        await lkRoom.connect(room.livekit_url, token, { autoSubscribe: true });
        if (cancelled) { lkRoom.disconnect(); return; }
        roomRef.current = lkRoom;

        // Attach any already-subscribed video tracks
        for (const p of lkRoom.remoteParticipants.values()) {
          for (const pub of p.videoTrackPublications.values()) {
            if (pub.track && pub.trackName === trackName && videoRef.current) {
              pub.track.attach(videoRef.current);
              setPlaying(true);
            }
          }
        }
      } catch (e) {
        if (!cancelled) setError(true);
      }
    }

    connect();

    return () => {
      cancelled = true;
      if (lkRoom) lkRoom.disconnect();
      roomRef.current = null;
    };
  }, [room.is_streaming, room.livekit_url, room.livekit_room_name, trackName]);

  return (
    <button
      onClick={onClick}
      className="group cursor-pointer text-left rounded-xl border border-white/[0.06] bg-navy-900/40 overflow-hidden transition-all duration-200 hover:border-white/[0.15] hover:bg-navy-900/80 hover:shadow-xl hover:shadow-black/40 hover:scale-[1.01] hover:ring-1 hover:ring-white/20 active:scale-[0.99] active:opacity-90"
    >
      {/* Video thumbnail — 16:9 */}
      <div className="relative aspect-video bg-navy-950 rounded-t-[11px] overflow-hidden">
        {room.is_streaming ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`h-full w-full object-cover transition-opacity duration-300 ${
                playing ? 'opacity-100' : 'opacity-0'
              }`}
            />
            {!playing && !error && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/20" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-white/30" />
                </span>
              </div>
            )}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center text-[11px] text-white/30">
                Failed to connect
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[11px] text-white/20">
            Offline
          </div>
        )}

        {/* Track label */}
        {playing && (
          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[9px] font-mono uppercase tracking-wider text-white/60">
            {trackName}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.04] bg-navy-900/60">
        <span className="text-[13px] font-medium text-white truncate">
          {room.robot_name || room.name}
        </span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${
            room.is_streaming
              ? 'bg-emerald-500/10 text-emerald-400'
              : 'bg-white/[0.04] text-white/30'
          }`}
        >
          <span className="relative flex h-1.5 w-1.5">
            {room.is_streaming && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
            )}
            <span
              className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
                room.is_streaming ? 'bg-emerald-500' : 'bg-white/20'
              }`}
            />
          </span>
          {room.is_streaming ? 'Live' : 'Idle'}
        </span>
      </div>
    </button>
  );
}
