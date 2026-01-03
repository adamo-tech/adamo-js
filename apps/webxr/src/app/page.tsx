'use client';

import { useState, useCallback, useEffect } from 'react';
import { Teleoperate, XRTeleop, useTeleoperateContext, StatsOverlay } from '@adamo-tech/react';

export default function Home() {
  // Auth state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [roomToken, setRoomToken] = useState('');
  const [signallingUrl, setSignallingUrl] = useState('');
  const [websocketPath, setWebsocketPath] = useState('');
  const [iceServers, setIceServers] = useState<RTCIceServer[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [rooms, setRooms] = useState<{ id: string; name: string }[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);

  // Connection state
  const [roomId, setRoomId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<string>('new');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setIsLoggingIn(true);
    setError(null);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Login failed');
      }

      const data = await response.json();
      setAccessToken(data.access_token);
      setSignallingUrl(data.signalling_url);
      setIceServers(data.ice_servers || []);
      console.log('Received ICE servers:', data.ice_servers);
      setIsLoggedIn(true);

      // Fetch rooms
      setIsLoadingRooms(true);
      try {
        const roomsResponse = await fetch('/api/rooms', {
          headers: {
            Authorization: `Bearer ${data.access_token}`,
          },
        });
        if (!roomsResponse.ok) {
          const roomsData = await roomsResponse.json();
          throw new Error(roomsData.detail || 'Failed to fetch rooms');
        }
        const roomsData = await roomsResponse.json();
        setRooms(roomsData.rooms);
        if (roomsData.rooms.length > 0) {
          setRoomId(roomsData.rooms[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch rooms');
      } finally {
        setIsLoadingRooms(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setAccessToken('');
    setRoomToken('');
    setSignallingUrl('');
    setWebsocketPath('');
    setRoomId('');
    setIsLoggedIn(false);
    setIsConnected(false);
    setConnectionState('new');
  };

  const handleConnect = async () => {
    // Prevent duplicate connection attempts
    if (isConnecting || isConnected) {
      return;
    }

    if (!roomId) {
      setError('Please enter a room ID');
      return;
    }
    if (!accessToken) {
      setError('Missing access token. Please log in again.');
      return;
    }

    setError(null);
    setIsConnecting(true);

    try {
      const response = await fetch(`/api/rooms/${roomId}/token`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to fetch room token');
      }

      const data = await response.json();
      setRoomToken(data.token);
      // Build full signaling WebSocket URL (same as client app)
      const wsBase = signallingUrl.replace(/^http/, 'ws');
      setWebsocketPath(`${wsBase}${data.websocket_url}`);
      setConnectionState('connecting');
      setIsConnected(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to room');
      setRoomToken('');
      setWebsocketPath('');
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setIsConnecting(false);
    setConnectionState('new');
  };

  const handleConnectionStateChange = useCallback((state: string) => {
    setConnectionState(state);
    // Don't unmount Teleoperate on disconnect/fail - let it handle reconnection internally
  }, []);

  const handleError = useCallback((err: Error) => {
    setError(err.message);
    console.error('WebRTC error:', err);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-neutral-800 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-xl font-semibold tracking-tight">Adamo WebXR</h1>
          <div className="flex items-center gap-4">
            {isLoggedIn && (
              <span className="text-sm text-neutral-400">
                <span
                  className={
                    connectionState === 'connected'
                      ? 'text-white'
                      : connectionState === 'connecting'
                      ? 'text-neutral-400'
                      : 'text-neutral-600'
                  }
                >
                  {connectionState}
                </span>
              </span>
            )}
            {isConnected && (
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 bg-white text-black hover:bg-neutral-200 rounded text-sm font-medium transition-colors"
              >
                Disconnect
              </button>
            )}
            {isLoggedIn && !isConnected && (
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-neutral-700 hover:border-neutral-500 rounded text-sm transition-colors"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {!isLoggedIn ? (
          /* Login Form */
          <div className="max-w-sm mx-auto mt-32">
            <div className="border border-neutral-800 rounded-lg p-8">
              <h2 className="text-lg font-medium mb-6">Login (v5)</h2>

              {error && (
                <div className="mb-4 p-3 border border-neutral-700 rounded text-neutral-300 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-2 bg-black border border-neutral-700 rounded focus:outline-none focus:border-white text-white placeholder-neutral-600"
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>

                <div>
                  <label className="block text-sm text-neutral-400 mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    className="w-full px-4 py-2 bg-black border border-neutral-700 rounded focus:outline-none focus:border-white text-white placeholder-neutral-600"
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>

                <button
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className="w-full py-3 bg-white text-black hover:bg-neutral-200 disabled:bg-neutral-600 disabled:text-neutral-400 disabled:cursor-not-allowed rounded font-medium transition-colors"
                >
                  {isLoggingIn ? 'Logging in...' : 'Login'}
                </button>
              </div>
            </div>
          </div>
        ) : !isConnected ? (
          /* Room Selection */
          <div className="max-w-sm mx-auto mt-32">
            <div className="border border-neutral-800 rounded-lg p-8">
              <h2 className="text-lg font-medium mb-6">Connect</h2>

              {error && (
                <div className="mb-4 p-3 border border-neutral-700 rounded text-neutral-300 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">Room</label>
                  {isLoadingRooms ? (
                    <div className="w-full px-4 py-2 border border-neutral-700 rounded text-neutral-500">
                      Loading...
                    </div>
                  ) : rooms.length > 0 ? (
                    <select
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      className="w-full px-4 py-2 bg-black border border-neutral-700 rounded focus:outline-none focus:border-white text-white"
                    >
                      {rooms.map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full px-4 py-2 border border-neutral-800 rounded text-neutral-600">
                      No rooms available
                    </div>
                  )}
                </div>

                <button
                  onClick={handleConnect}
                  disabled={isConnecting || !roomId}
                  className="w-full py-3 bg-white text-black hover:bg-neutral-200 disabled:bg-neutral-600 disabled:text-neutral-400 disabled:cursor-not-allowed rounded font-medium transition-colors"
                >
                  {isConnecting ? 'Connecting...' : 'Connect'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Video View with XRTeleop */
          <div className="space-y-4">
            <Teleoperate
              config={{ debug: true }}
              signaling={{
                serverUrl: websocketPath,
                roomId: roomId,
                token: roomToken,
                iceServers: iceServers,
              }}
              autoConnect
            >
              <TeleoperateStateHandler
                onConnectionStateChange={handleConnectionStateChange}
              />
              <XRTeleop onError={handleError} />
              <StatsOverlay position="bottom-left" defaultExpanded />
            </Teleoperate>
          </div>
        )}
      </main>
    </div>
  );
}

// Helper component to handle connection state changes from Teleoperate context
function TeleoperateStateHandler({
  onConnectionStateChange,
}: {
  onConnectionStateChange: (state: string) => void;
}) {
  const { connectionState } = useTeleoperateContext();

  useEffect(() => {
    onConnectionStateChange(connectionState);
  }, [connectionState, onConnectionStateChange]);

  return null;
}
