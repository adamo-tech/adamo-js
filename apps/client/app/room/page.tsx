'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Teleoperate,
  useAdamo,
  HeartbeatMonitor,
  GamepadController,
} from '@adamo-tech/react';
import { CameraLayout, type CameraLayoutApi } from './CameraLayout';
import { RobotStatusPanel } from './RobotStatusPanel';
import { StatsPanel } from './StatsPanel';
import { RoomSelector, type Robot } from './RoomSelector';
import { RoomHeader } from './RoomHeader';
import { HeightOverlay, type HeightOverlayRef } from './HeightOverlay';
import { BUTTONS, W3C_BUTTONS } from './buttons';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function RoomPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Robot[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState<Robot | null>(null);
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

  // Fetch rooms with polling
  const fetchRooms = useCallback(async () => {
    if (!accessToken) return;
    try {
      const resp = await fetch(`${API_URL}/rooms`, {
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
    }, 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated, accessToken, fetchRooms, selectedRoom]);

  // Rename a room
  const handleRename = async (roomId: string, newName: string) => {
    if (!accessToken || !newName.trim()) return;
    try {
      const resp = await fetch(`${API_URL}/rooms/${roomId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (resp.ok) fetchRooms();
    } catch (e) {
      console.error('Failed to rename room:', e);
    }
  };

  // D-pad navigation for room selection
  useEffect(() => {
    if (selectedRoom || rooms.length === 0) return;

    let gamepadIndex: number | null = null;
    let animationFrame: number;
    const prevButtons: Record<number, boolean> = {};

    const pollGamepad = () => {
      const gamepads = navigator.getGamepads();
      let gp: Gamepad | null = null;

      if (gamepadIndex !== null) {
        gp = gamepads[gamepadIndex];
      } else {
        for (const pad of gamepads) {
          if (pad) { gp = pad; gamepadIndex = pad.index; break; }
        }
      }

      if (gp) {
        const watched = [
          W3C_BUTTONS.DPAD_UP,
          W3C_BUTTONS.DPAD_DOWN,
          W3C_BUTTONS.DPAD_LEFT,
          W3C_BUTTONS.DPAD_RIGHT,
          W3C_BUTTONS.A,
        ];
        for (const btnIdx of watched) {
          const pressed = gp.buttons[btnIdx]?.pressed;
          const wasPressed = prevButtons[btnIdx];
          if (pressed && !wasPressed) {
            if (btnIdx === W3C_BUTTONS.DPAD_UP || btnIdx === W3C_BUTTONS.DPAD_LEFT) {
              setSelectedIndex((prev) => (prev - 1 + rooms.length) % rooms.length);
            } else if (btnIdx === W3C_BUTTONS.DPAD_DOWN || btnIdx === W3C_BUTTONS.DPAD_RIGHT) {
              setSelectedIndex((prev) => (prev + 1) % rooms.length);
            } else if (btnIdx === W3C_BUTTONS.A) {
              setSelectedRoom(rooms[selectedIndex]);
            }
          }
          prevButtons[btnIdx] = pressed;
        }
      }
      animationFrame = requestAnimationFrame(pollGamepad);
    };

    animationFrame = requestAnimationFrame(pollGamepad);
    return () => cancelAnimationFrame(animationFrame);
  }, [selectedRoom, rooms, selectedIndex]);

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
  if (rooms.length === 0) {
    return <LoadingScreen message="No robots online. Waiting for connections…" dim />;
  }

  // Room selection screen
  if (!selectedRoom) {
    return (
      <RoomSelector
        rooms={rooms}
        selectedIndex={selectedIndex}
        onSelect={setSelectedRoom}
        onRename={handleRename}
        onLogout={handleLogout}
      />
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
        hasPrev={rooms.length > 1}
        hasNext={rooms.length > 1}
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
  hasPrev: boolean;
  hasNext: boolean;
  onBack: () => void;
  onPrev: () => void;
  onNext: () => void;
  onLogout: () => void;
};

function RoomContent({ robotName, hasPrev, hasNext, onBack, onPrev, onNext, onLogout }: RoomContentProps) {
  const { connectionState } = useAdamo();
  const [heightOverlayOpen, setHeightOverlayOpen] = useState(false);
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

    if (buttonIndex === BUTTONS.LB) { cameraLayoutRef.current?.cycleMode('prev'); return; }
    if (buttonIndex === BUTTONS.RB) { cameraLayoutRef.current?.cycleMode('next'); return; }
  }, [heightOverlayOpen]);

  const handleCameraReady = useCallback((api: CameraLayoutApi) => {
    cameraLayoutRef.current = api;
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#050812]">
      <HeartbeatMonitor />
      <GamepadController onButtonDown={handleButtonDown} />

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
        <CameraLayout onReady={handleCameraReady} />
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
      <RobotStatusPanel topic="robot_status" />
      <StatsPanel />

      {/* Height preset overlay (toggled by Start button) */}
      {heightOverlayOpen && (
        <HeightOverlay
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
