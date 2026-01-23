'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Teleoperate,
  ConnectionStatus,
  useAdamo,
  HeartbeatMonitor,
  StatsOverlay,
} from '@adamo-tech/react';
import type { TwistMessage } from '@adamo-tech/core';
import { KeyboardLayout } from './KeyboardLayout';
import { VELOCITY_INCREMENT, TOPICS } from '../../config/topics';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function RoomPage() {
  const router = useRouter();
  const [signalingUrl, setSignalingUrl] = useState<string | null>(null);
  const [signalingToken, setSignalingToken] = useState<string | null>(null);
  const [iceServers, setIceServers] = useState<RTCIceServer[]>([]);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check auth and fetch token
  useEffect(() => {
    const token = sessionStorage.getItem('access_token');
    if (!token) {
      router.push('/');
      return;
    }

    const fetchToken = async () => {
      try {
        // Fetch first available room
        const roomsResp = await fetch(`${API_URL}/rooms`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!roomsResp.ok) throw new Error('Failed to fetch rooms');
        const roomsData = await roomsResp.json();
        const room = roomsData.rooms?.[0];
        if (!room) throw new Error('No rooms available');

        // Get WebRTC token
        const tokenResp = await fetch(`${API_URL}/rooms/${room.id}/token`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!tokenResp.ok) throw new Error('Failed to get token');
        const tokenData = await tokenResp.json();

        // Build signaling WebSocket URL
        if (!tokenData.websocket_url) {
          throw new Error('Missing websocket_url in response');
        }
        const apiBase = API_URL.replace(/^http/, 'ws');
        const signalingWsUrl = `${apiBase}${tokenData.websocket_url}`;

        setSignalingUrl(signalingWsUrl);
        setSignalingToken(tokenData.token);
        setRoomId(room.id);
        if (tokenData.ice_servers) {
          setIceServers(tokenData.ice_servers);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Connection failed');
      } finally {
        setLoading(false);
      }
    };

    fetchToken();
  }, [router]);

  if (loading) {
    return (
      <div style={styles.center}>
        <div style={styles.loading}>Connecting...</div>
      </div>
    );
  }

  if (error || !signalingToken || !signalingUrl || !roomId) {
    return (
      <div style={styles.center}>
        <div style={styles.error}>{error || 'Connection failed'}</div>
        <button onClick={() => router.push('/')} style={styles.backButton}>
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <Teleoperate
      config={{ debug: true }}
      signaling={{
        serverUrl: signalingUrl,
        roomId: roomId,
        token: signalingToken,
        iceServers: iceServers.length > 0 ? iceServers : undefined,
      }}
      autoConnect
    >
      <RoomContent />
    </Teleoperate>
  );
}

function RoomContent() {
  const { connectionState, client } = useAdamo();
  const [velocity, setVelocity] = useState<TwistMessage>({
    linear: { x: 0, y: 0, z: 0 },
    angular: { x: 0, y: 0, z: 0 },
  });
  const velocityRef = useRef(velocity);
  const keysHeldRef = useRef<Set<string>>(new Set());

  // Keep ref in sync
  useEffect(() => {
    velocityRef.current = velocity;
  }, [velocity]);

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
    client.sendTwist(velocity, TOPICS.cmdVel.name).catch((e) => {
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
      <KeyboardLayout />
      <StatsOverlay />

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
