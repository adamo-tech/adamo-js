import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import {
  AdamoClient,
  AdamoClientConfig,
  ConnectionState,
  VideoTrack,
  SignalingConfig,
} from '@adamo-tech/core';

interface TeleoperateContextValue {
  client: AdamoClient | null;
  connectionState: ConnectionState;
  /** All available video tracks (keyed by track name/topic) */
  videoTracks: Map<string, VideoTrack>;
  /** The first video track (for backwards compatibility) */
  videoTrack: VideoTrack | null;
  /** Whether the data channel is open and ready */
  dataChannelOpen: boolean;
  /** Connect to robot */
  connect: (signaling: SignalingConfig) => Promise<void>;
  /** Disconnect from robot */
  disconnect: () => void;
}

const TeleoperateContext = createContext<TeleoperateContextValue | null>(null);

export interface TeleoperateProps {
  children: ReactNode;
  /** Client configuration options */
  config?: AdamoClientConfig;
  /** Signaling configuration for auto-connect */
  signaling?: SignalingConfig;
  /** Auto-connect on mount (requires signaling prop) */
  autoConnect?: boolean;
}

// Stringify config for stable dependency comparison
function useStableConfig(config?: AdamoClientConfig): AdamoClientConfig | undefined {
  const configJson = config ? JSON.stringify(config) : undefined;
  return useMemo(() => (configJson ? JSON.parse(configJson) : undefined), [configJson]);
}

function useStableSignaling(signaling?: SignalingConfig): SignalingConfig | undefined {
  const signalingJson = signaling ? JSON.stringify(signaling) : undefined;
  return useMemo(() => (signalingJson ? JSON.parse(signalingJson) : undefined), [signalingJson]);
}

/**
 * Teleoperate - Context provider for robot teleoperation
 *
 * Provides the Adamo client instance to all child components.
 * Must be used at the root of your application (or the part that needs teleoperation).
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <Teleoperate
 *       config={{ debug: true }}
 *       signaling={{
 *         serverUrl: 'wss://relay.example.com',
 *         roomId: 'robot-1',
 *         token: 'jwt...',
 *       }}
 *       autoConnect
 *     >
 *       <VideoFeed />
 *       <HeartbeatMonitor />
 *       <GamepadController />
 *     </Teleoperate>
 *   );
 * }
 * ```
 */
export function Teleoperate({ children, config, signaling, autoConnect }: TeleoperateProps) {
  const clientRef = useRef<AdamoClient | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [videoTracks, setVideoTracks] = useState<Map<string, VideoTrack>>(new Map());
  const [dataChannelOpen, setDataChannelOpen] = useState(false);

  // Stabilize config to prevent reconnection on every render
  const stableConfig = useStableConfig(config);
  const stableSignaling = useStableSignaling(signaling);

  // Initialize client (only when config actually changes)
  useEffect(() => {
    const client = new AdamoClient(stableConfig);
    clientRef.current = client;

    // Subscribe to events
    const unsubConnectionState = client.on('connectionStateChanged', (state) => {
      setConnectionState(state);
      // Clear tracks on disconnect
      if (state === 'disconnected') {
        setVideoTracks(new Map());
      }
    });

    const unsubVideoTrack = client.on('videoTrackReceived', (track) => {
      setVideoTracks((prev) => {
        const next = new Map(prev);
        next.set(track.name, track);
        return next;
      });
    });

    const unsubVideoEnded = client.on('videoTrackEnded', (trackId) => {
      setVideoTracks((prev) => {
        const next = new Map(prev);
        // Find and remove track by ID
        for (const [name, track] of next) {
          if (track.id === trackId) {
            next.delete(name);
            break;
          }
        }
        return next;
      });
    });

    const unsubDataChannelOpen = client.on('dataChannelOpen', () => {
      setDataChannelOpen(true);
    });

    const unsubDataChannelClose = client.on('dataChannelClose', () => {
      setDataChannelOpen(false);
    });

    // Auto-connect if configured
    if (autoConnect && stableSignaling) {
      client.connect(stableSignaling).catch(console.error);
    }

    return () => {
      unsubConnectionState();
      unsubVideoTrack();
      unsubVideoEnded();
      unsubDataChannelOpen();
      unsubDataChannelClose();
      client.disconnect();
      clientRef.current = null;
    };
  }, [stableConfig, stableSignaling, autoConnect]);

  const connect = useCallback(async (signalingConfig: SignalingConfig) => {
    if (clientRef.current) {
      await clientRef.current.connect(signalingConfig);
    }
  }, []);

  const disconnect = useCallback(() => {
    clientRef.current?.disconnect();
  }, []);

  // Compute first track for backwards compatibility
  const videoTrack = videoTracks.size > 0 ? videoTracks.values().next().value ?? null : null;

  const value: TeleoperateContextValue = {
    client: clientRef.current,
    connectionState,
    videoTracks,
    videoTrack,
    dataChannelOpen,
    connect,
    disconnect,
  };

  return <TeleoperateContext.Provider value={value}>{children}</TeleoperateContext.Provider>;
}

/**
 * Hook to access the Teleoperate context
 *
 * @throws If used outside of Teleoperate
 */
export function useTeleoperateContext(): TeleoperateContextValue {
  const context = useContext(TeleoperateContext);
  if (!context) {
    throw new Error('useTeleoperateContext must be used within a Teleoperate provider');
  }
  return context;
}

/** @deprecated Use Teleoperate instead */
export const AdamoProvider = Teleoperate;
/** @deprecated Use TeleoperateProps instead */
export type AdamoProviderProps = TeleoperateProps;
/** @deprecated Use useTeleoperateContext instead */
export const useAdamoContext = useTeleoperateContext;
