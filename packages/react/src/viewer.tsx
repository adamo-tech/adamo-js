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
} from '@adamo-tech/core';
import { AdamoContext, AdamoContextValue } from './context';

interface ViewerContextValue extends AdamoContextValue {
  /** Always true for ViewerContext - indicates this is a view-only session */
  isViewer: true;
}

const ViewerContext = createContext<ViewerContextValue | null>(null);

export interface ViewerProps {
  children: ReactNode;
  /** Client configuration options (serverIdentity not needed for viewers) */
  config?: Omit<AdamoClientConfig, 'serverIdentity'>;
  /** Auto-connect to this URL and token on mount */
  autoConnect?: {
    url: string;
    token: string;
  };
}

// Stringify config for stable dependency comparison
function useStableConfig(
  config?: Omit<AdamoClientConfig, 'serverIdentity'>
): AdamoClientConfig | undefined {
  const configJson = config ? JSON.stringify(config) : undefined;
  return useMemo(
    () => (configJson ? JSON.parse(configJson) : undefined),
    [configJson]
  );
}

/**
 * Viewer - Context provider for view-only robot stream observation
 *
 * Provides read-only access to robot video streams without control capabilities.
 * Viewers connect directly to the LiveKit SFU, consuming no additional robot bandwidth.
 *
 * Unlike Teleoperate, Viewer:
 * - Cannot send joy/gamepad data
 * - Cannot send heartbeats
 * - Cannot publish any data channels
 * - Does not use WebSocket signaling
 *
 * @example
 * ```tsx
 * function ViewerApp() {
 *   return (
 *     <Viewer autoConnect={{ url: livekitUrl, token: viewerToken }}>
 *       <VideoFeed topic="front_camera" />
 *       <VideoFeed topic="rear_camera" />
 *     </Viewer>
 *   );
 * }
 * ```
 */
export function Viewer({ children, config, autoConnect }: ViewerProps) {
  const clientRef = useRef<AdamoClient | null>(null);
  const [connectionState, setConnectionState] =
    useState<ConnectionState>('disconnected');
  const [availableTracks, setAvailableTracks] = useState<VideoTrack[]>([]);

  // Stabilize config to prevent reconnection on every render
  // Viewers don't need serverIdentity since they don't send RPCs
  const stableConfig = useStableConfig(config);

  // Extract primitives from autoConnect for stable dependencies
  const autoConnectUrl = autoConnect?.url;
  const autoConnectToken = autoConnect?.token;

  // Initialize client (only when config actually changes)
  useEffect(() => {
    // Create client without serverIdentity - viewers don't need it
    const client = new AdamoClient(stableConfig);
    clientRef.current = client;

    // Subscribe to events
    const unsubConnectionState = client.on('connectionStateChanged', (state) => {
      setConnectionState(state);
    });

    const unsubTrackAvailable = client.on('trackAvailable', () => {
      setAvailableTracks(client.getAvailableTracks());
    });

    const unsubTrackRemoved = client.on('trackRemoved', () => {
      setAvailableTracks(client.getAvailableTracks());
    });

    // Auto-connect if configured
    if (autoConnectUrl && autoConnectToken) {
      client.connect(autoConnectUrl, autoConnectToken).catch(console.error);
    }

    return () => {
      unsubConnectionState();
      unsubTrackAvailable();
      unsubTrackRemoved();
      client.disconnect();
      clientRef.current = null;
    };
  }, [stableConfig, autoConnectUrl, autoConnectToken]);

  const connect = useCallback(async (url: string, token: string) => {
    if (clientRef.current) {
      await clientRef.current.connect(url, token);
    }
  }, []);

  const disconnect = useCallback(() => {
    clientRef.current?.disconnect();
  }, []);

  const value: ViewerContextValue = {
    client: clientRef.current,
    connectionState,
    availableTracks,
    connect,
    disconnect,
    isViewer: true,
  };

  return (
    <AdamoContext.Provider value={value}>
      <ViewerContext.Provider value={value}>{children}</ViewerContext.Provider>
    </AdamoContext.Provider>
  );
}

/**
 * Hook to access the Viewer context
 *
 * @throws If used outside of Viewer
 */
export function useViewerContext(): ViewerContextValue {
  const context = useContext(ViewerContext);
  if (!context) {
    throw new Error('useViewerContext must be used within a Viewer provider');
  }
  return context;
}

