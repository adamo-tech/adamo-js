import { useCallback } from 'react';
import { useAdamoContext } from '../context';

/**
 * Hook to publish arbitrary JSON data to a server-bound topic.
 *
 * Returns a stable callback that publishes to the given topic.
 * The connection must be established before publishing — calls before
 * connection will be silently dropped.
 *
 * @typeParam T - The shape of the data being published
 * @param topic - The topic name to publish on (e.g., 'height_command')
 * @param options - Optional publish options (reliable defaults to true)
 * @returns A function that publishes data to the topic
 *
 * @example
 * ```tsx
 * function HeightControls() {
 *   const publish = useJsonPublisher<{ cmd: string; name: string }>('height_command');
 *
 *   return (
 *     <button onClick={() => publish({ cmd: 'goto', name: 'top' })}>
 *       Go to top
 *     </button>
 *   );
 * }
 * ```
 */
export function useJsonPublisher<T = unknown>(
  topic: string,
  options?: { reliable?: boolean }
): (data: T) => void {
  const { client, connectionState } = useAdamoContext();
  const reliable = options?.reliable;

  return useCallback(
    (data: T) => {
      if (!client || connectionState !== 'connected') {
        return;
      }
      client
        .publishJson(topic, data, { reliable: reliable ?? true })
        .catch((err: unknown) => {
          console.error(`[useJsonPublisher] Failed to publish to ${topic}:`, err);
        });
    },
    [client, connectionState, topic, reliable]
  );
}
