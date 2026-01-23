'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Teleoperate,
  ConnectionStatus,
  useAdamo,
  HeartbeatMonitor,
  StatsOverlay,
  AutoVideoLayout,
} from '@adamo-tech/react';
import type { TwistMessage } from '@adamo-tech/core';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const VELOCITY_INCREMENT = 0.01;
const TWIST_TOPIC = 'twist';

interface Room {
  id: string;
  name: string;
  robot_name?: string;
  is_online: boolean;
}

export default function RoomPage() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [signalingUrl, setSignalingUrl] = useState<string | null>(null);
  const [signalingToken, setSignalingToken] = useState<string | null>(null);
  const [iceServers, setIceServers] = useState<RTCIceServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check auth and fetch rooms
  useEffect(() => {
    const token = sessionStorage.getItem('access_token');
    if (!token) {
      router.push('/');
      return;
    }
    setAccessToken(token);

    const fetchRooms = async () => {
      try {
        const resp = await fetch(`${API_URL}/rooms`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resp.status === 401) {
          sessionStorage.removeItem('access_token');
          router.push('/');
          return;
        }
        if (!resp.ok) throw new Error('Failed to fetch rooms');
        const data = await resp.json();
        setRooms(data.rooms || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load rooms');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [router]);

  // Fetch token when room is selected
  useEffect(() => {
    if (!selectedRoom || !accessToken) return;

    const fetchToken = async () => {
      try {
        const resp = await fetch(`${API_URL}/rooms/${selectedRoom.id}/token`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!resp.ok) throw new Error('Failed to get token');
        const data = await resp.json();

        if (!data.websocket_url) {
          throw new Error('Missing websocket_url in response');
        }
        const apiBase = API_URL.replace(/^http/, 'ws');
        const signalingWsUrl = `${apiBase}${data.websocket_url}`;

        setSignalingUrl(signalingWsUrl);
        setSignalingToken(data.token);
        if (data.ice_servers) {
          setIceServers(data.ice_servers);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Connection failed');
        setSelectedRoom(null);
      }
    };

    fetchToken();
  }, [selectedRoom, accessToken]);

  const handleDisconnect = () => {
    setSelectedRoom(null);
    setSignalingUrl(null);
    setSignalingToken(null);
    setIceServers([]);
  };

  if (loading) {
    return (
      <div style={styles.center}>
        <div style={styles.loading}>Loading rooms...</div>
      </div>
    );
  }

  if (error && !selectedRoom) {
    return (
      <div style={styles.center}>
        <div style={styles.error}>{error}</div>
        <button onClick={() => router.push('/')} style={styles.backButton}>
          Back to Login
        </button>
      </div>
    );
  }

  // Room selection screen
  if (!selectedRoom) {
    return (
      <div style={styles.selectorContainer}>
        <h1 style={styles.title}>Select Robot</h1>

        {rooms.length === 0 ? (
          <p style={styles.noRooms}>No robots available</p>
        ) : (
          <div style={styles.roomList}>
            {rooms.map((room) => (
              <button
                key={room.id}
                style={{
                  ...styles.roomItem,
                  ...(!room.is_online ? styles.roomItemOffline : {}),
                }}
                onClick={() => setSelectedRoom(room)}
              >
                <div style={styles.roomHeader}>
                  <div style={styles.roomName}>{room.name}</div>
                  <div
                    style={{
                      ...styles.statusDot,
                      backgroundColor: room.is_online ? '#22c55e' : '#666',
                    }}
                  />
                </div>
                {room.robot_name && (
                  <div style={styles.robotName}>{room.robot_name}</div>
                )}
              </button>
            ))}
          </div>
        )}

        <button onClick={() => router.push('/')} style={styles.logoutButton}>
          Logout
        </button>
      </div>
    );
  }

  // Waiting for token
  if (!signalingToken || !signalingUrl) {
    return (
      <div style={styles.center}>
        <div style={styles.loading}>Connecting to {selectedRoom.name}...</div>
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
      <RoomContent roomName={selectedRoom.name} onDisconnect={handleDisconnect} />
    </Teleoperate>
  );
}

function RoomContent({ roomName, onDisconnect }: { roomName: string; onDisconnect: () => void }) {
  const { connectionState, client } = useAdamo();
  const [velocity, setVelocity] = useState<TwistMessage>({
    linear: { x: 0, y: 0, z: 0 },
    angular: { x: 0, y: 0, z: 0 },
  });
  const keysHeldRef = useRef<Set<string>>(new Set());

  // Keyboard handling
  const updateVelocity = useCallback((key: string) => {
    const inc = VELOCITY_INCREMENT;
    setVelocity((v) => {
      const newV = { ...v, linear: { ...v.linear }, angular: { ...v.angular } };
      switch (key.toLowerCase()) {
        case 'w':
          newV.linear.x += inc;
          break;
        case 's':
          newV.linear.x -= inc;
          break;
        case 'a':
          newV.linear.y -= inc;
          break;
        case 'd':
          newV.linear.y += inc;
          break;
        case 'q':
          newV.angular.z -= inc;
          break;
        case 'e':
          newV.angular.z += inc;
          break;
        case 'x':
          newV.linear = { x: 0, y: 0, z: 0 };
          newV.angular = { x: 0, y: 0, z: 0 };
          break;
      }
      return newV;
    });
  }, []);

  // Send velocity when it changes
  useEffect(() => {
    if (!client || connectionState !== 'connected') return;
    client.sendTwist(velocity, TWIST_TOPIC).catch((e) => {
      console.debug('[Keyboard] Failed to send twist:', e);
    });
  }, [client, connectionState, velocity]);

  // Keyboard event listeners
  useEffect(() => {
    if (connectionState !== 'connected') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'q', 'e', 'x'].includes(key)) {
        e.preventDefault();
        if (!keysHeldRef.current.has(key)) {
          keysHeldRef.current.add(key);
          updateVelocity(key);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysHeldRef.current.delete(e.key.toLowerCase());
    };

    // Continuous sending while keys are held (10 Hz)
    const intervalId = setInterval(() => {
      if (keysHeldRef.current.size > 0) {
        for (const key of keysHeldRef.current) {
          updateVelocity(key);
        }
      }
    }, 100);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(intervalId);
    };
  }, [connectionState, updateVelocity]);

  if (connectionState !== 'connected') {
    return (
      <div style={styles.center}>
        <ConnectionStatus />
      </div>
    );
  }

  return (
    <>
      <HeartbeatMonitor />
      <AutoVideoLayout style={styles.videoLayout} />
      <StatsOverlay />

      {/* Room name and disconnect */}
      <div style={styles.roomIndicator}>
        <span>{roomName}</span>
        <button onClick={onDisconnect} style={styles.disconnectButton}>
          ✕
        </button>
      </div>

      {/* Velocity display */}
      <div style={styles.velocityPanel}>
        <div style={styles.velocityTitle}>Velocity</div>
        <div style={styles.velocityRow}>
          <span style={styles.velocityLabel}>Linear X</span>
          <span style={styles.velocityValue}>{velocity.linear.x.toFixed(3)}</span>
        </div>
        <div style={styles.velocityRow}>
          <span style={styles.velocityLabel}>Linear Y</span>
          <span style={styles.velocityValue}>{velocity.linear.y.toFixed(3)}</span>
        </div>
        <div style={styles.velocityRow}>
          <span style={styles.velocityLabel}>Angular Z</span>
          <span style={styles.velocityValue}>{velocity.angular.z.toFixed(3)}</span>
        </div>
      </div>

      {/* Controls hint */}
      <div style={styles.hint}>
        <span style={styles.hintKey}>W</span>
        <span style={styles.hintKey}>A</span>
        <span style={styles.hintKey}>S</span>
        <span style={styles.hintKey}>D</span>
        <span style={styles.hintSep}>Move</span>
        <span style={styles.hintKey}>Q</span>
        <span style={styles.hintKey}>E</span>
        <span style={styles.hintSep}>Rotate</span>
        <span style={styles.hintKey}>X</span>
        <span style={styles.hintSep}>Stop</span>
      </div>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  center: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    gap: 16,
  },
  loading: {
    color: '#666',
    fontSize: 14,
  },
  error: {
    color: '#ef4444',
    fontSize: 14,
  },
  backButton: {
    padding: '8px 16px',
    backgroundColor: '#333',
    border: 'none',
    borderRadius: 4,
    color: '#fff',
    cursor: 'pointer',
    fontSize: 12,
  },
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
    marginBottom: 32,
  },
  noRooms: {
    color: '#666',
    fontSize: 14,
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
    border: '1px solid #333',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s ease',
  },
  roomItemOffline: {
    opacity: 0.5,
  },
  roomHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roomName: {
    fontSize: 18,
    fontWeight: 500,
    color: '#fff',
  },
  robotName: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
  },
  logoutButton: {
    marginTop: 40,
    padding: '8px 16px',
    backgroundColor: 'transparent',
    border: '1px solid #333',
    borderRadius: 4,
    color: '#666',
    cursor: 'pointer',
    fontSize: 12,
  },
  videoLayout: {
    position: 'fixed',
    inset: 0,
    padding: 8,
  },
  roomIndicator: {
    position: 'fixed',
    top: 10,
    right: 10,
    padding: '6px 12px',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: '#fff',
    fontSize: 12,
    borderRadius: 4,
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  disconnectButton: {
    background: 'none',
    border: 'none',
    color: '#666',
    cursor: 'pointer',
    fontSize: 14,
    padding: 0,
  },
  velocityPanel: {
    position: 'fixed',
    top: 10,
    left: 10,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: 8,
    fontSize: 12,
    fontFamily: 'monospace',
    zIndex: 1000,
    minWidth: 140,
  },
  velocityTitle: {
    color: '#888',
    marginBottom: 8,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  velocityRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 4,
  },
  velocityLabel: {
    color: '#666',
  },
  velocityValue: {
    color: '#3b82f6',
    fontWeight: 500,
  },
  hint: {
    position: 'fixed',
    bottom: 10,
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '8px 16px',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    borderRadius: 20,
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  hintKey: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    fontSize: 10,
    fontWeight: 600,
  },
  hintSep: {
    marginLeft: 4,
    marginRight: 8,
    color: 'rgba(255, 255, 255, 0.3)',
  },
};
