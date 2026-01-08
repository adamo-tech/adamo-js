'use client';

import { useState, useCallback, useEffect } from 'react';
import { Teleoperate, useTeleoperateContext, StatsOverlay, AutoVideoLayout, XRTeleop, GamepadController } from '@adamo-tech/react';

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
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Connection state
  const [roomId, setRoomId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<string>('new');

  // VR mode - enabled when in a VR browser (e.g., Quest)
  const [isVRMode, setIsVRMode] = useState(false);

  // Detect VR browser on mount
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.xr) {
      navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
        setIsVRMode(supported);
      });
    }
  }, []);

  // Check for stored session on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const storedToken = localStorage.getItem('access_token');
    const storedSignallingUrl = localStorage.getItem('signalling_url');
    const storedIceServers = localStorage.getItem('ice_servers');
    
    if (storedToken && storedSignallingUrl) {
      setAccessToken(storedToken);
      setSignallingUrl(storedSignallingUrl);
      if (storedIceServers) {
        try {
          setIceServers(JSON.parse(storedIceServers));
        } catch {}
      }
      setIsLoggedIn(true);
      // Fetch rooms with stored token
      fetchRooms(storedToken);
    }
    setIsCheckingAuth(false);
  }, []);

  const fetchRooms = async (token: string) => {
    setIsLoadingRooms(true);
    try {
      const roomsResponse = await fetch('/api/rooms', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (roomsResponse.status === 401) {
        // Token expired - clear and show login
        handleLogout();
        return;
      }
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
  };

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
      const token = data.access_token;
      const sigUrl = data.signalling_url;
      const servers = data.ice_servers || [];
      
      // Store in localStorage for persistence
      localStorage.setItem('access_token', token);
      localStorage.setItem('signalling_url', sigUrl);
      localStorage.setItem('ice_servers', JSON.stringify(servers));
      
      setAccessToken(token);
      setSignallingUrl(sigUrl);
      setIceServers(servers);
      console.log('Received ICE servers:', servers);
      setIsLoggedIn(true);

      // Fetch rooms
      await fetchRooms(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('signalling_url');
    localStorage.removeItem('ice_servers');
    
    setAccessToken('');
    setRoomToken('');
    setSignallingUrl('');
    setWebsocketPath('');
    setRoomId('');
    setRooms([]);
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

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-neutral-500">Loading...</div>
      </div>
    );
  }

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
          <div className="max-w-md mx-auto mt-20">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold mb-2">Select a Robot</h2>
              <p className="text-neutral-500 text-sm">Choose a robot to connect to</p>
            </div>

            {error && (
              <div className="mb-6 p-3 border border-neutral-700 rounded text-neutral-300 text-sm text-center">
                {error}
              </div>
            )}

            {isLoadingRooms ? (
              <div className="text-center py-12 text-neutral-500">
                Loading rooms...
              </div>
            ) : rooms.length > 0 ? (
              <div className="space-y-3">
                {rooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => {
                      setRoomId(room.id);
                      // Auto-connect when clicking a room
                      if (!isConnecting && !isConnected) {
                        setError(null);
                        setIsConnecting(true);
                        fetch(`/api/rooms/${room.id}/token`, {
                          method: 'POST',
                          headers: {
                            Authorization: `Bearer ${accessToken}`,
                          },
                        })
                          .then((response) => {
                            if (!response.ok) {
                              return response.json().then((data) => {
                                throw new Error(data.detail || 'Failed to fetch room token');
                              });
                            }
                            return response.json();
                          })
                          .then((data) => {
                            setRoomToken(data.token);
                            const wsBase = signallingUrl.replace(/^http/, 'ws');
                            setWebsocketPath(`${wsBase}${data.websocket_url}`);
                            setConnectionState('connecting');
                            setIsConnected(true);
                          })
                          .catch((err) => {
                            setError(err instanceof Error ? err.message : 'Failed to connect to room');
                            setRoomToken('');
                            setWebsocketPath('');
                            setIsConnected(false);
                          })
                          .finally(() => {
                            setIsConnecting(false);
                          });
                      }
                    }}
                    disabled={isConnecting}
                    className="w-full p-5 bg-neutral-900 border border-neutral-800 rounded-xl text-left transition-all hover:border-neutral-600 hover:bg-neutral-800/50 disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center group-hover:bg-neutral-700 transition-colors">
                          <svg
                            className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-white">{room.name}</div>
                          <div className="text-xs text-neutral-500 mt-0.5">Click to connect</div>
                        </div>
                      </div>
                      <svg
                        className="w-5 h-5 text-neutral-600 group-hover:text-white transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-neutral-800 rounded-xl">
                <div className="text-neutral-500">No rooms available</div>
                <div className="text-neutral-600 text-sm mt-1">Contact your administrator</div>
              </div>
            )}

            {isConnecting && (
              <div className="mt-6 text-center text-neutral-400 text-sm">
                Connecting...
              </div>
            )}
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
              <GamepadController />
              {isVRMode ? (
                <XRTeleop />
              ) : (
                <AutoVideoLayout
                  showLabels
                  onTracksChange={(tracks) => console.log('Available tracks:', tracks)}
                />
              )}
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
