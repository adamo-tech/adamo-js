import React, { createContext, useContext, useEffect, useState, useRef, useCallback, useMemo, ReactNode } from 'react';
import {
  AdamoClient,
  AdamoClientConfig,
  ConnectionState,
  VideoTrack,
} from '@adamo/adamo-core';

interface AdamoContextValue {
  client: AdamoClient | null;
  connectionState: ConnectionState;
  availableTracks: VideoTrack[];
  connect: (url: string, token: string) => Promise<void>;
  disconnect: () => void;
}

const AdamoContext = createContext<AdamoContextValue | null>(null);

export interface AdamoProviderProps {
  children: ReactNode;
  /** Client configuration options */
  config?: AdamoClientConfig;
  /** Auto-connect to this URL and token on mount */
  autoConnect?: {
    url: string;
    token: string;
  };
}

// Stringify config for stable dependency comparison
function useStableConfig(config?: AdamoClientConfig): AdamoClientConfig | undefined {
  const configJson = config ? JSON.stringify(config) : undefined;
  return useMemo(() => (configJson ? JSON.parse(configJson) : undefined), [configJson]);
}

/**
 * AdamoProvider - Context provider for Adamo client
 *
 * Provides the Adamo client instance to all child components.
 * Must be used at the root of your application (or the part that needs Adamo).
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <AdamoProvider config={{ serverIdentity: 'python-bot' }}>
 *       <CameraFeed topic="fork" />
 *     </AdamoProvider>
 *   );
 * }
 * ```
 */
export function AdamoProvider({ children, config, autoConnect }: AdamoProviderProps) {
  const clientRef = useRef<AdamoClient | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [availableTracks, setAvailableTracks] = useState<VideoTrack[]>([]);

  // Stabilize config to prevent reconnection on every render
  const stableConfig = useStableConfig(config);

  // Extract primitives from autoConnect for stable dependencies
  const autoConnectUrl = autoConnect?.url;
  const autoConnectToken = autoConnect?.token;

  // Initialize client (only when config actually changes)
  useEffect(() => {
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

  const value: AdamoContextValue = {
    client: clientRef.current,
    connectionState,
    availableTracks,
    connect,
    disconnect,
  };

  return (
    <AdamoContext.Provider value={value}>
      {children}
    </AdamoContext.Provider>
  );
}

/**
 * Hook to access the Adamo context
 *
 * @throws If used outside of AdamoProvider
 */
export function useAdamoContext(): AdamoContextValue {
  const context = useContext(AdamoContext);
  if (!context) {
    throw new Error('useAdamoContext must be used within an AdamoProvider');
  }
  return context;
}
