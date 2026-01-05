import { useEffect, useState, useRef, useCallback } from 'react';
import { TopicDataPayload } from '@adamo-tech/core';
import { useAdamoContext } from '../context';

/**
 * Hook to subscribe to arbitrary JSON data on a specific topic
 *
 * Use this hook to receive real-time JSON payloads from any ROS topic
 * that the server is streaming via LiveKit data channels.
 *
 * @typeParam T - The expected shape of the JSON data
 * @param topic - The topic name to subscribe to (e.g., 'robot_status', 'sensor/imu')
 * @returns Object containing the latest data, timestamp, and loading state
 *
 * @example
 * ```tsx
 * interface RobotStatus {
 *   battery_level: number;
 *   temperature: number;
 *   error_code: number;
 * }
 *
 * function StatusPanel() {
 *   const { data, timestamp } = useTopicData<RobotStatus>('robot_status');
 *
 *   if (!data) return <div>Waiting for status...</div>;
 *
 *   return (
 *     <div>
 *       <p>Battery: {data.battery_level}%</p>
 *       <p>Temperature: {data.temperature}°C</p>
 *       <p>Last update: {new Date(timestamp!).toLocaleTimeString()}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTopicData<T = unknown>(topic: string): {
  data: T | null;
  timestamp: number | null;
  isReceiving: boolean;
} {
  const { client, connectionState } = useAdamoContext();
  const [data, setData] = useState<T | null>(null);
  const [timestamp, setTimestamp] = useState<number | null>(null);
  const [isReceiving, setIsReceiving] = useState(false);
  const receivedRef = useRef(false);

  useEffect(() => {
    if (!client || connectionState !== 'connected') {
      return;
    }

    const unsubscribe = client.on('topicData', (payload: TopicDataPayload) => {
      if (payload.topic === topic) {
        setData(payload.data as T);
        setTimestamp(payload.timestamp);
        if (!receivedRef.current) {
          receivedRef.current = true;
          setIsReceiving(true);
        }
      }
    });

    return () => {
      unsubscribe();
      receivedRef.current = false;
      setIsReceiving(false);
    };
  }, [client, connectionState, topic]);

  // Reset state when topic changes
  useEffect(() => {
    setData(null);
    setTimestamp(null);
    setIsReceiving(false);
    receivedRef.current = false;
  }, [topic]);

  return {
    data,
    timestamp,
    isReceiving,
  };
}

/**
 * Hook to subscribe to multiple topics at once
 *
 * @param topics - Array of topic names to subscribe to
 * @returns Map of topic name to their latest data
 *
 * @example
 * ```tsx
 * function MultiSensorPanel() {
 *   const topicData = useMultiTopicData(['sensor/imu', 'sensor/gps', 'sensor/lidar']);
 *
 *   return (
 *     <div>
 *       {Array.from(topicData.entries()).map(([topic, { data, timestamp }]) => (
 *         <div key={topic}>
 *           <h3>{topic}</h3>
 *           <pre>{JSON.stringify(data, null, 2)}</pre>
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useMultiTopicData(topics: string[]): Map<string, { data: unknown; timestamp: number }> {
  const { client, connectionState } = useAdamoContext();
  const [dataMap, setDataMap] = useState<Map<string, { data: unknown; timestamp: number }>>(new Map());
  const topicsRef = useRef(topics);

  // Update ref when topics change
  useEffect(() => {
    topicsRef.current = topics;
  }, [topics]);

  useEffect(() => {
    if (!client || connectionState !== 'connected') {
      return;
    }

    const unsubscribe = client.on('topicData', (payload: TopicDataPayload) => {
      if (topicsRef.current.includes(payload.topic)) {
        setDataMap((prev) => {
          const next = new Map(prev);
          next.set(payload.topic, { data: payload.data, timestamp: payload.timestamp });
          return next;
        });
      }
    });

    return unsubscribe;
  }, [client, connectionState]);

  // Reset when topics array changes
  useEffect(() => {
    setDataMap(new Map());
  }, [JSON.stringify(topics)]);

  return dataMap;
}

/**
 * Hook to get a callback-based subscription for topic data
 *
 * Use this when you need more control over how data is processed,
 * or when you want to avoid re-renders on every message.
 *
 * @param topic - The topic name to subscribe to
 * @param callback - Function called with each new data payload
 *
 * @example
 * ```tsx
 * function LoggingComponent() {
 *   useTopicDataCallback('debug/logs', (data) => {
 *     console.log('Debug log:', data);
 *   });
 *
 *   return null; // Invisible component
 * }
 * ```
 */
export function useTopicDataCallback<T = unknown>(
  topic: string,
  callback: (data: T, timestamp: number) => void
): void {
  const { client, connectionState } = useAdamoContext();
  const callbackRef = useRef(callback);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!client || connectionState !== 'connected') {
      return;
    }

    const unsubscribe = client.on('topicData', (payload: TopicDataPayload) => {
      if (payload.topic === topic) {
        callbackRef.current(payload.data as T, payload.timestamp);
      }
    });

    return unsubscribe;
  }, [client, connectionState, topic]);
}
