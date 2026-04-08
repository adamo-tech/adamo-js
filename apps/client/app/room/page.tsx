'use client';

import { Suspense, useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Teleoperate,
  useAdamo,
  HeartbeatMonitor,
  GamepadController,
} from '@adamo-tech/react';
import { CameraLayout, type CameraLayoutApi } from './CameraLayout';

import { StatsPanel } from './StatsPanel';
import { RobotCard } from './RobotCard';
import { RoomHeader } from './RoomHeader';
import { HeightOverlay, type HeightOverlayRef } from './HeightOverlay';
import { LogOutIcon } from './icons';
import { BUTTONS, W3C_BUTTONS } from './buttons';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface StreamingRoom {
  id: string;
  name: string;
  robot_name?: string;
  is_online: boolean;
  is_streaming: boolean;
  track_names: string[];
  livekit_url: string;
  livekit_room_name: string;
}

export default function RoomPage() {
  return (
    <Suspense fallback={<LoadingScreen message="Loading…" />}>
      <RoomPageInner />
    </Suspense>
  );
}

function RoomPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedRobotId = searchParams.get('robot');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [rooms, setRooms] = useState<StreamingRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<StreamingRoom | null>(null);
  const [livekitToken, setLivekitToken] = useState<string | null>(null);
  const [livekitUrl, setLivekitUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check authentication
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('access_token');
      if (!token) {
        router.push('/');
      } else {
        setAccessToken(token);
        setIsAuthenticated(true);
      }
    }
  }, [router]);

  // Fetch rooms with streaming status from /api/observe
  const fetchRooms = useCallback(async () => {
    if (!accessToken) return;
    try {
      const resp = await fetch('/api/observe', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (resp.status === 401) {
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        sessionStorage.removeItem('user');
        router.push('/');
        return;
      }
      if (!resp.ok) throw new Error('Failed to fetch rooms');
      const data = await resp.json();
      setRooms(data.rooms || []);
    } catch (e) {
      setError('Failed to load rooms');
      console.error('Failed to fetch rooms:', e);
    } finally {
      setLoading(false);
    }
  }, [accessToken, router]);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;
    fetchRooms();
    const interval = setInterval(() => {
      if (!selectedRoom) fetchRooms();
    }, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated, accessToken, fetchRooms, selectedRoom]);

  // Auto-select robot from ?robot= query param
  useEffect(() => {
    if (preselectedRobotId && rooms.length > 0 && !selectedRoom) {
      const match = rooms.find((r) => r.id === preselectedRobotId);
      if (match) setSelectedRoom(match);
    }
  }, [preselectedRobotId, rooms, selectedRoom]);

  // Fetch LiveKit token once room is selected
  useEffect(() => {
    if (!selectedRoom || !accessToken) return;
    const fetchToken = async () => {
      try {
        const resp = await fetch(`${API_URL}/rooms/${selectedRoom.id}/token`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (resp.status === 401) {
          sessionStorage.removeItem('access_token');
          sessionStorage.removeItem('refresh_token');
          sessionStorage.removeItem('user');
          router.push('/');
          return;
        }
        if (!resp.ok) throw new Error('Failed to get token');
        const data = await resp.json();
        if (data.livekit_token && data.livekit_url) {
          setLivekitToken(data.livekit_token);
          setLivekitUrl(data.livekit_url);
        }
      } catch (e) {
        console.error('Failed to get token:', e);
        setError('Failed to get connection token');
      }
    };
    fetchToken();
  }, [selectedRoom, accessToken, router]);

  const handleLogout = () => {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('user');
    router.push('/');
  };

  const handleBackToList = () => {
    setSelectedRoom(null);
    setLivekitToken(null);
    setLivekitUrl(null);
  };

  const selectedRoomIdx = selectedRoom ? rooms.findIndex((r) => r.id === selectedRoom.id) : -1;

  const handlePrevRobot = () => {
    if (rooms.length === 0) return;
    const idx = selectedRoomIdx === -1 ? 0 : (selectedRoomIdx - 1 + rooms.length) % rooms.length;
    setLivekitToken(null);
    setLivekitUrl(null);
    setSelectedRoom(rooms[idx]);
  };

  const handleNextRobot = () => {
    if (rooms.length === 0) return;
    const idx = selectedRoomIdx === -1 ? 0 : (selectedRoomIdx + 1) % rooms.length;
    setLivekitToken(null);
    setLivekitUrl(null);
    setSelectedRoom(rooms[idx]);
  };

  if (!isAuthenticated) {
    return <LoadingScreen message="Checking authentication…" />;
  }
  if (loading) {
    return <LoadingScreen message="Loading robots…" />;
  }
  if (error) {
    return <ErrorScreen message={error} />;
  }
  const streamingRooms = rooms.filter((r) => r.is_streaming);

  // Fleet overview — shows live camera thumbnails for all streaming robots
  if (!selectedRoom) {
    return (
      <div className="min-h-screen bg-[#050812]">
        {/* Atmospheric background */}
        <div className="pointer-events-none fixed inset-x-0 top-0 h-96 bg-gradient-to-b from-red-500/[0.06] via-red-500/[0.02] to-transparent" />

        {/* Header */}
        <div className="relative px-8 pt-6">
          <div className="flex items-end justify-between border-b border-white/[0.06] pb-4">
            <div>
              <div className="flex items-baseline gap-3">
                <h1 className="text-3xl font-medium tracking-tight text-white">Robots</h1>
                {streamingRooms.length > 0 && (
                  <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                    {streamingRooms.length} streaming
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-[12px] text-white/30">
                Click a robot to start operating
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="group flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] text-white/40 hover:text-white/80 hover:bg-white/[0.06] text-[12px] transition-all"
            >
              <LogOutIcon className="h-3.5 w-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="relative px-8 py-6">
          {streamingRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="h-16 w-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4">
                <svg className="h-7 w-7 text-white/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-[13px] text-white/30 mb-1">No robots streaming</p>
              <p className="text-[11px] text-white/20">
                Robots will appear here when they come online
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {streamingRooms.map((room) => (
                <RobotCard
                  key={room.id}
                  room={room}
                  preferredTrack="front_low"
                  onClick={() => setSelectedRoom(room)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!livekitToken || !livekitUrl) {
    return (
      <LoadingScreen
        message={`Connecting to ${selectedRoom.robot_name || selectedRoom.name}…`}
      />
    );
  }

  return (
    <Teleoperate
      config={{
        serverIdentity: 'python-bot',
        adaptiveStream: false,
        dynacast: true,
        videoCodec: 'h264',
        playoutDelay: 0,
      }}
      autoConnect={{ url: livekitUrl, token: livekitToken }}
    >
      <RoomContent
        robotName={selectedRoom.robot_name || selectedRoom.name}
        trackNames={selectedRoom.track_names}
        roomId={selectedRoom.id}
        accessToken={accessToken!}
        hasPrev={streamingRooms.length > 1}
        hasNext={streamingRooms.length > 1}
        onBack={handleBackToList}
        onPrev={handlePrevRobot}
        onNext={handleNextRobot}
        onLogout={handleLogout}
      />
    </Teleoperate>
  );
}

type RoomContentProps = {
  robotName: string;
  trackNames: string[];
  roomId: string;
  accessToken: string;
  hasPrev: boolean;
  hasNext: boolean;
  onBack: () => void;
  onPrev: () => void;
  onNext: () => void;
  onLogout: () => void;
};

function RoomContent({ robotName, trackNames, roomId, accessToken, hasPrev, hasNext, onBack, onPrev, onNext, onLogout }: RoomContentProps) {
  const { connectionState, availableTracks } = useAdamo();
  const [heightOverlayOpen, setHeightOverlayOpen] = useState(false);

  // Merge API track names with live-discovered tracks so late-starting cameras appear
  const allTrackNames = useMemo(() => {
    const names = new Set(trackNames);
    for (const t of availableTracks) {
      names.add(t.name);
    }
    return [...names];
  }, [trackNames, availableTracks]);
  const heightOverlayRef = useRef<HeightOverlayRef | null>(null);
  const cameraLayoutRef = useRef<CameraLayoutApi | null>(null);

  const handleButtonDown = useCallback((buttonIndex: number) => {
    if (buttonIndex === BUTTONS.START) {
      setHeightOverlayOpen((open) => !open);
      return;
    }

    if (heightOverlayOpen) {
      const ref = heightOverlayRef.current;
      if (!ref) return;
      switch (buttonIndex) {
        case BUTTONS.DPAD_UP:    ref.handleDpad('up'); return;
        case BUTTONS.DPAD_DOWN:  ref.handleDpad('down'); return;
        case BUTTONS.DPAD_LEFT:  ref.handleDpad('left'); return;
        case BUTTONS.DPAD_RIGHT: ref.handleDpad('right'); return;
        case BUTTONS.A:          ref.handleDpad('confirm'); return;
        case BUTTONS.X:          ref.handleDpad('delete'); return;
        case BUTTONS.B:          setHeightOverlayOpen(false); return;
      }
      return;
    }

    if (buttonIndex === BUTTONS.LB) { cameraLayoutRef.current?.cycleLayout('prev'); return; }
    if (buttonIndex === BUTTONS.RB) { cameraLayoutRef.current?.cycleLayout('next'); return; }
  }, [heightOverlayOpen]);

  const handleCameraReady = useCallback((api: CameraLayoutApi) => {
    cameraLayoutRef.current = api;
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#050812]">
      <HeartbeatMonitor />
      <GamepadController paused={heightOverlayOpen} onButtonDown={handleButtonDown} />

      {/* Connection veil while still connecting */}
      {connectionState !== 'connected' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#050812]/95 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500/20" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500/80" />
            </div>
            <div className="text-[12px] text-white/50 font-mono uppercase tracking-wider">
              {connectionState}
            </div>
          </div>
        </div>
      )}

      {/* Camera grid — fills viewport */}
      <div className="absolute inset-0">
        <CameraLayout trackNames={allTrackNames} roomId={roomId} accessToken={accessToken} onReady={handleCameraReady} />
      </div>

      {/* Header bar — robot name, nav, logout */}
      <RoomHeader
        robotName={robotName}
        connectionState={connectionState}
        hasPrev={hasPrev}
        hasNext={hasNext}
        onBack={onBack}
        onPrev={onPrev}
        onNext={onNext}
        onLogout={onLogout}
      />

      {/* Corner panels */}
      <StatsPanel />

      {/* Height preset overlay (toggled by Start button) */}
      {heightOverlayOpen && (
        <HeightOverlay
          roomId={roomId}
          accessToken={accessToken}
          onClose={() => setHeightOverlayOpen(false)}
          onReady={(ref) => { heightOverlayRef.current = ref; }}
        />
      )}
    </div>
  );
}

function LoadingScreen({ message, dim }: { message: string; dim?: boolean }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050812]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex h-8 w-8 items-center justify-center">
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${dim ? 'bg-white/10' : 'bg-red-500/20'}`} />
          <span className={`relative inline-flex h-2 w-2 rounded-full ${dim ? 'bg-white/40' : 'bg-red-500/80'}`} />
        </div>
        <div className="text-[12px] text-white/40 font-mono uppercase tracking-wider">{message}</div>
      </div>
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050812]">
      <div className="flex flex-col items-center gap-3 text-center max-w-sm px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <div className="text-[14px] text-red-400 font-medium">Connection error</div>
        <div className="text-[12px] text-white/40">{message}</div>
      </div>
    </div>
  );
}
