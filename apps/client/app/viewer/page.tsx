'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Viewer,
  ConnectionStatus,
  useAdamoContext,
  StatsOverlay,
} from '@adamo-tech/react';
import { CameraLayout } from '../room/CameraLayout';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Room {
  id: string;
  name: string;
  robot_name?: string;
  is_online: boolean;
  last_seen?: string;
}

export default function ViewerPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
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
    };

    fetchRooms();
  }, [isAuthenticated, accessToken, router]);

  // Fetch LiveKit token with viewer role once room is selected
  useEffect(() => {
    if (!selectedRoom || !accessToken) return;

    const fetchToken = async () => {
      try {
        const resp = await fetch(`${API_URL}/rooms/${selectedRoom.id}/token`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ role: 'viewer' }),
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
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-zinc-600 dark:text-zinc-400">No robots configured. Add rooms in the admin panel.</div>
      </div>
    );
  }

  // Room selection screen
  if (!selectedRoom) {
    return (
      <div style={styles.selectorContainer}>
        <h1 style={styles.title}>View Robot Stream</h1>
        <p style={styles.subtitle}>View-only mode - no control</p>

        <div style={styles.roomList}>
          {rooms.map((room, index) => (
            <div
              key={room.id}
              style={{
                ...styles.roomItem,
                ...(index === selectedIndex ? styles.roomItemSelected : {}),
                ...(!room.is_online ? styles.roomItemOffline : {}),
              }}
              onClick={() => {
                setSelectedIndex(index);
                setSelectedRoom(room);
              }}
              onMouseEnter={() => setSelectedIndex(index)}
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
      </div>
    );
  }

  if (!livekitToken || !livekitUrl) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-zinc-600 dark:text-zinc-400">Connecting to {selectedRoom.name}...</div>
      </div>
    );
  }

  return (
    <Viewer
      config={{
        videoCodec: 'h264',
        playoutDelay: 0,
      }}
      autoConnect={{ url: livekitUrl, token: livekitToken }}
    >
      <ViewerContent roomName={selectedRoom.name} onDisconnect={() => {
        setSelectedRoom(null);
        setLivekitToken(null);
        setLivekitUrl(null);
      }} />
    </Viewer>
  );
}

function ViewerContent({ roomName, onDisconnect }: { roomName: string; onDisconnect: () => void }) {
  const { connectionState } = useAdamoContext();

  if (connectionState !== 'connected') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-900">
        <ConnectionStatus />
      </div>
    );
  }

  return (
    <>
      {/* No HeartbeatMonitor or GamepadController - viewer mode */}
      <CameraLayout />
      <StatsOverlay />

      {/* Viewer mode indicator */}
      <div style={styles.roomIndicator}>
        <span style={styles.viewerBadge}>VIEWER</span>
        {roomName}
      </div>

      <div style={{ position: 'fixed', top: 10, right: 10, zIndex: 1000 }}>
        <ConnectionStatus hideWhenConnected />
      </div>

      {/* Back button */}
      <button
        onClick={onDisconnect}
        style={styles.backButton}
      >
        Back to Room List
      </button>
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
    borderColor: '#8b5cf6',
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
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  viewerBadge: {
    backgroundColor: '#8b5cf6',
    color: '#fff',
    padding: '2px 6px',
    borderRadius: 3,
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.5px',
  },
  backButton: {
    position: 'fixed',
    bottom: 20,
    left: 20,
    padding: '8px 16px',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: '#fff',
    border: '1px solid #333',
    borderRadius: 6,
    cursor: 'pointer',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: 14,
    zIndex: 1000,
  },
};
