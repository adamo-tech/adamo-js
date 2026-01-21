'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Teleoperate,
  ConnectionStatus,
  useAdamo,
  useTeleoperateContext,
  HeartbeatMonitor,
  GamepadController,
  StatsOverlay,
} from '@adamo-tech/react';
import { CameraLayout } from './CameraLayout';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Room {
  id: string;
  name: string;
  robot_name?: string;
  is_online: boolean;
  last_seen?: string;
}

export default function RoomPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [signalingUrl, setSignalingUrl] = useState<string | null>(null);
  const [signalingToken, setSignalingToken] = useState<string | null>(null);
  const [iceServers, setIceServers] = useState<RTCIceServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    router.push('/');
  }, [router]);

  // Check authentication (use localStorage for persistence)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/');
      } else {
        setAccessToken(token);
        setIsAuthenticated(true);
      }
    }
  }, [router]);

  // Fetch rooms
  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    const fetchRooms = async () => {
      try {
        const resp = await fetch(`${API_URL}/rooms`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (resp.status === 401) {
          // Token expired or invalid - clear and redirect to login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          router.push('/');
          return;
        }
        if (!resp.ok) throw new Error('Failed to fetch rooms');
        const data = await resp.json();
        console.log('[Room] Fetched rooms:', data);
        setRooms(data.rooms || []);
      } catch (e) {
        setError('Failed to load rooms');
        console.error('Failed to fetch rooms:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [isAuthenticated, accessToken]);

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
          if (pad) {
            gp = pad;
            gamepadIndex = pad.index;
            break;
          }
        }
      }

      if (gp) {
        // D-pad: up=12, down=13, left=14, right=15
        // A button = 0 (select)
        const buttons = [12, 13, 14, 15, 0];

        for (const btnIdx of buttons) {
          const pressed = gp.buttons[btnIdx]?.pressed;
          const wasPressed = prevButtons[btnIdx];

          if (pressed && !wasPressed) {
            if (btnIdx === 12 || btnIdx === 14) {
              // Up or Left - previous room
              setSelectedIndex((prev) => (prev - 1 + rooms.length) % rooms.length);
            } else if (btnIdx === 13 || btnIdx === 15) {
              // Down or Right - next room
              setSelectedIndex((prev) => (prev + 1) % rooms.length);
            } else if (btnIdx === 0) {
              // A button - select room
              setSelectedRoom(rooms[selectedIndex]);
            }
          }

          prevButtons[btnIdx] = pressed;
        }
      }

      animationFrame = requestAnimationFrame(pollGamepad);
    };

    animationFrame = requestAnimationFrame(pollGamepad);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [selectedRoom, rooms, selectedIndex]);

  // Fetch LiveKit token once room is selected
  useEffect(() => {
    if (!selectedRoom || !accessToken) return;

    const fetchToken = async () => {
      try {
        const resp = await fetch(`${API_URL}/rooms/${selectedRoom.id}/token`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (resp.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          router.push('/');
          return;
        }
        if (!resp.ok) throw new Error('Failed to get token');
        const data = await resp.json();

        // Build signaling WebSocket URL from backend's websocket_url (relative path)
        // websocket_url is like "/ws/signal/{room_id}?token=xxx"
        if (!data.websocket_url) {
          throw new Error('Missing websocket_url in response');
        }
        // Convert API_URL to WebSocket URL and append the path
        const apiBase = API_URL.replace(/^http/, 'ws');
        const signalingWsUrl = `${apiBase}${data.websocket_url}`;

        const token = data.token;
        if (signalingWsUrl && token) {
          setSignalingUrl(signalingWsUrl);
          setSignalingToken(token);
          if (data.ice_servers) {
            setIceServers(data.ice_servers);
          }
        }
      } catch (e) {
        console.error('Failed to get token:', e);
        setError('Failed to get connection token');
      }
    };

    fetchToken();
  }, [selectedRoom, accessToken, router]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-zinc-600 dark:text-zinc-400">Checking authentication...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-zinc-600 dark:text-zinc-400">Loading rooms...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 dark:bg-black">
        <div className="text-red-500">{error}</div>
        <button
          onClick={logout}
          className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-300 underline"
        >
          Logout
        </button>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 dark:bg-black">
        <div className="text-zinc-600 dark:text-zinc-400">No robots configured. Add rooms in the admin panel.</div>
        <button
          onClick={logout}
          className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-300 underline"
        >
          Logout
        </button>
      </div>
    );
  }

  // Room selection screen
  if (!selectedRoom) {
    return (
      <div style={styles.selectorContainer}>
        <h1 style={styles.title}>Select Robot</h1>
        <p style={styles.subtitle}>Use D-pad to navigate, A to select</p>

        <div style={styles.roomList}>
          {rooms.map((room, index) => (
            <div
              key={room.id}
              style={{
                ...styles.roomItem,
                ...(index === selectedIndex ? styles.roomItemSelected : {}),
                ...(!room.is_online ? styles.roomItemOffline : {}),
              }}
              onClick={() => setSelectedRoom(room)}
            >
              <div style={styles.roomHeader}>
                <div style={styles.roomName}>{room.name}</div>
                <div style={{
                  ...styles.statusDot,
                  backgroundColor: room.is_online ? '#22c55e' : '#666',
                }} />
              </div>
              {room.robot_name && <div style={styles.robotName}>{room.robot_name}</div>}
            </div>
          ))}
        </div>

        <div style={styles.controls}>
          <span style={styles.controlHint}>D-pad: Navigate</span>
          <span style={styles.controlHint}>A: Select</span>
        </div>
      </div>
    );
  }

  if (!signalingToken || !signalingUrl) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-zinc-600 dark:text-zinc-400">Connecting to {selectedRoom.name}...</div>
      </div>
    );
  }

  return (
    <Teleoperate
      config={{ debug: true }}
      signaling={{
        serverUrl: signalingUrl,
        roomId: selectedRoom.id,
        token: signalingToken,
        iceServers: iceServers.length > 0 ? iceServers : undefined,
      }}
      autoConnect
    >
      <RoomContent roomName={selectedRoom.name} onDisconnect={() => {
        setSelectedRoom(null);
        setSignalingToken(null);
        setSignalingUrl(null);
        setIceServers([]);
      }} />
    </Teleoperate>
  );
}

function RobotBusyDialog({ onCancel }: { onCancel: () => void }) {
  const { robotBusy, forceConnect, disconnect } = useTeleoperateContext();

  if (!robotBusy) return null;

  const handleCancel = () => {
    disconnect();
    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-6 max-w-sm mx-4">
        <h2 className="text-lg font-semibold mb-2">Robot In Use</h2>
        <p className="text-neutral-400 text-sm mb-6">
          Another user is currently connected to this robot. Would you like to take over?
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-2 border border-neutral-600 hover:border-neutral-400 rounded text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={forceConnect}
            className="flex-1 px-4 py-2 bg-white text-black hover:bg-neutral-200 rounded text-sm font-medium transition-colors"
          >
            Take Over
          </button>
        </div>
      </div>
    </div>
  );
}

function RoomContent({ roomName, onDisconnect }: { roomName: string; onDisconnect: () => void }) {
  const { connectionState } = useAdamo();

  if (connectionState !== 'connected') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-900">
        <ConnectionStatus />
        <RobotBusyDialog onCancel={onDisconnect} />
      </div>
    );
  }

  return (
    <>
      <HeartbeatMonitor />
      <GamepadController config={{ maxVideoStalenessMs: 0 }} />
      <CameraLayout />
      <StatsOverlay />

      {/* Room name indicator */}
      <div style={styles.roomIndicator}>
        {roomName}
      </div>

      <div style={{ position: 'fixed', top: 10, right: 10, zIndex: 1000 }}>
        <ConnectionStatus hideWhenConnected />
      </div>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  selectorContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 600,
    color: '#fff',
    marginBottom: 8,
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 40,
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  roomList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    width: '100%',
    maxWidth: 400,
  },
  roomItem: {
    padding: '16px 20px',
    backgroundColor: '#111',
    borderRadius: 8,
    border: '2px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  roomItemSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#1a1a2e',
  },
  roomItemOffline: {
    opacity: 0.5,
  },
  roomHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  roomName: {
    fontSize: 18,
    fontWeight: 500,
    color: '#fff',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  robotName: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
  },
  roomUrl: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  controls: {
    marginTop: 40,
    display: 'flex',
    gap: 24,
  },
  controlHint: {
    fontSize: 12,
    color: '#444',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  roomIndicator: {
    position: 'fixed',
    top: 10,
    left: 10,
    padding: '6px 12px',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: '#fff',
    fontSize: 12,
    borderRadius: 4,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    zIndex: 1000,
  },
};
