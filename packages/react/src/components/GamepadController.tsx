import { useEffect, useRef } from 'react';
import { useJoypad } from '../hooks/useJoypad';
import type { JoypadConfig, JoyMessage } from '@adamo/adamo-core';

export interface GamepadControllerProps {
  /** Joypad configuration */
  config?: JoypadConfig;
  /** Called on each input event (continuous, at autorepeat rate) */
  onInput?: (input: JoyMessage) => void;
  /** Called once when a button is pressed (0 → 1 transition) */
  onButtonDown?: (buttonIndex: number) => void;
  /** Called once when a button is released (1 → 0 transition) */
  onButtonUp?: (buttonIndex: number) => void;
  /** Called when gamepad connection state changes */
  onConnectionChange?: (connected: boolean) => void;
}

/**
 * GamepadController - Declarative gamepad input component
 *
 * Drop this component anywhere inside AdamoProvider to enable gamepad input.
 * It automatically starts polling and sending joy data to the server.
 *
 * @example
 * ```tsx
 * <AdamoProvider config={...} autoConnect={...}>
 *   <GamepadController />
 *   <VideoFeed topic="fork" />
 * </AdamoProvider>
 *
 * // With edge-triggered button callbacks
 * <GamepadController
 *   onButtonDown={(index) => {
 *     if (index === 5) cycleToNextCamera(); // Right bumper pressed
 *   }}
 *   onButtonUp={(index) => {
 *     if (index === 6) stopRecording(); // Left trigger released
 *   }}
 * />
 *
 * // With continuous input monitoring
 * <GamepadController
 *   onInput={(joy) => console.log('Axes:', joy.axes)}
 * />
 * ```
 */
export function GamepadController({
  config,
  onInput,
  onButtonDown,
  onButtonUp,
  onConnectionChange,
}: GamepadControllerProps) {
  const { isConnected, lastInput } = useJoypad(config);
  const prevButtonsRef = useRef<number[]>([]);

  // Notify on input and detect button edges
  useEffect(() => {
    if (!lastInput) return;

    // Continuous input callback
    onInput?.(lastInput);

    // Edge detection for buttons
    if (onButtonDown || onButtonUp) {
      const prevButtons = prevButtonsRef.current;
      const currButtons = lastInput.buttons;

      currButtons.forEach((curr, index) => {
        const prev = prevButtons[index] ?? 0;

        // Rising edge: 0 → 1 (button pressed)
        if (curr === 1 && prev === 0) {
          onButtonDown?.(index);
        }
        // Falling edge: 1 → 0 (button released)
        else if (curr === 0 && prev === 1) {
          onButtonUp?.(index);
        }
      });

      prevButtonsRef.current = [...currButtons];
    }
  }, [lastInput, onInput, onButtonDown, onButtonUp]);

  // Notify on connection change
  useEffect(() => {
    onConnectionChange?.(isConnected);
  }, [isConnected, onConnectionChange]);

  // This component renders nothing - it just enables gamepad functionality
  return null;
}
