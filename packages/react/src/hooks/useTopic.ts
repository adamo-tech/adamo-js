import { useEffect, useState, useRef } from 'react';
import { TopicMessage } from '@adamo-tech/core';
import { useAdamoContext } from '../context';

/**
 * Hook to subscribe to a specific topic streamed from the robot
 *
 * The backend can be configured to stream arbitrary topics over the
 * WebRTC data channel as JSON. This hook filters messages by topic name
 * and provides the latest message data.
 *
 * @param topicName - The topic to subscribe to (e.g., "/robot/status")
 * @returns Object with the latest message data and metadata
 *
 * @example
 * ```tsx
 * function RobotStatus() {
 *   const { data, messageType, lastReceived } = useTopic('/robot/status');
 *
 *   if (!data) {
 *     return <div>Waiting for status...</div>;
 *   }
 *
 *   return <div>Status: {JSON.stringify(data)}</div>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With typed data
 * interface BatteryStatus {
 *   voltage: number;
 *   percentage: number;
 * }
 *
 * function BatteryMonitor() {
 *   const { data } = useTopic<BatteryStatus>('/battery/status');
 *
 *   return <div>Battery: {data?.percentage ?? '--'}%</div>;
 * }
 * ```
 */
export function useTopic<T = unknown>(topicName: string): {
  /** The latest message data for this topic */
  data: T | null;
  /** The ROS message type (e.g., "std_msgs/String") */
  messageType: string | null;
  /** Timestamp of when the last message was received */
  lastReceived: number | null;
  /** Whether any message has been received for this topic */
  hasData: boolean;
} {
  const { client, connectionState } = useAdamoContext();
  const [data, setData] = useState<T | null>(null);
  const [messageType, setMessageType] = useState<string | null>(null);
  const [lastReceived, setLastReceived] = useState<number | null>(null);

  useEffect(() => {
    if (!client || connectionState !== 'connected') {
      return;
    }

    const unsubscribe = client.on('topicMessage', (message: TopicMessage) => {
      if (message.topic === topicName) {
        setData(message.data as T);
        setMessageType(message.type);
        setLastReceived(Date.now());
      }
    });

    return unsubscribe;
  }, [client, connectionState, topicName]);

  return {
    data,
    messageType,
    lastReceived,
    hasData: data !== null,
  };
}

/**
 * Hook to subscribe to multiple topics at once
 *
 * Useful when you need to monitor several topics without creating
 * multiple subscriptions.
 *
 * @param topicNames - Array of topic names to subscribe to
 * @returns Object with messages keyed by topic name
 *
 * @example
 * ```tsx
 * function MultiTopicMonitor() {
 *   const { messages, lastUpdate } = useTopics([
 *     '/robot/status',
 *     '/battery/status',
 *     '/sensors/imu',
 *   ]);
 *
 *   return (
 *     <div>
 *       {Object.entries(messages).map(([topic, msg]) => (
 *         <div key={topic}>
 *           {topic}: {JSON.stringify(msg?.data)}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useTopics(topicNames: string[]): {
  /** Messages keyed by topic name */
  messages: Record<string, TopicMessage | null>;
  /** Timestamp of the most recent message across all topics */
  lastUpdate: number | null;
} {
  const { client, connectionState } = useAdamoContext();
  const [messages, setMessages] = useState<Record<string, TopicMessage | null>>(() => {
    const initial: Record<string, TopicMessage | null> = {};
    for (const topic of topicNames) {
      initial[topic] = null;
    }
    return initial;
  });
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);

  // Keep a ref to topic names for stable comparisons
  const topicNamesRef = useRef(topicNames);
  topicNamesRef.current = topicNames;

  useEffect(() => {
    if (!client || connectionState !== 'connected') {
      return;
    }

    const unsubscribe = client.on('topicMessage', (message: TopicMessage) => {
      if (topicNamesRef.current.includes(message.topic)) {
        setMessages((prev) => ({
          ...prev,
          [message.topic]: message,
        }));
        setLastUpdate(Date.now());
      }
    });

    return unsubscribe;
  }, [client, connectionState]);

  // Reset messages when topic names change
  useEffect(() => {
    setMessages((prev) => {
      const updated: Record<string, TopicMessage | null> = {};
      for (const topic of topicNames) {
        updated[topic] = prev[topic] ?? null;
      }
      return updated;
    });
  }, [topicNames.join(',')]);

  return {
    messages,
    lastUpdate,
  };
}

/**
 * Hook to receive all topic messages with a callback
 *
 * Lower-level hook for custom message handling. Useful when you need
 * to process messages in a specific way or maintain your own state.
 *
 * @param onMessage - Callback invoked for each topic message
 * @param filter - Optional filter function to only receive certain topics
 *
 * @example
 * ```tsx
 * function MessageLogger() {
 *   useTopicCallback(
 *     (message) => {
 *       console.log(`[${message.topic}] ${JSON.stringify(message.data)}`);
 *     },
 *     (message) => message.topic.startsWith('/sensors/')
 *   );
 *
 *   return <div>Logging sensor messages to console...</div>;
 * }
 * ```
 */
export function useTopicCallback(
  onMessage: (message: TopicMessage) => void,
  filter?: (message: TopicMessage) => boolean
): void {
  const { client, connectionState } = useAdamoContext();

  // Keep stable references
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;
  const filterRef = useRef(filter);
  filterRef.current = filter;

  useEffect(() => {
    if (!client || connectionState !== 'connected') {
      return;
    }

    const unsubscribe = client.on('topicMessage', (message: TopicMessage) => {
      if (!filterRef.current || filterRef.current(message)) {
        onMessageRef.current(message);
      }
    });

    return unsubscribe;
  }, [client, connectionState]);
}
