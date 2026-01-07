'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Standard gamepad button indices
 */
export const GamepadButton = {
  A: 0,
  B: 1,
  X: 2,
  Y: 3,
  LB: 4,
  RB: 5,
  LT: 6,
  RT: 7,
  BACK: 8,
  START: 9,
  L3: 10,
  R3: 11,
  DPAD_UP: 12,
  DPAD_DOWN: 13,
  DPAD_LEFT: 14,
  DPAD_RIGHT: 15,
} as const;

/**
 * Configuration for useGamepadNavigation hook
 */
export interface UseGamepadNavigationConfig<T> {
  /**
   * Array of items to navigate through
   */
  items: T[];
  /**
   * Initial selected index
   * @default 0
   */
  initialIndex?: number;
  /**
   * Whether navigation is enabled
   * @default true
   */
  enabled?: boolean;
  /**
   * Button index for previous item (up/left)
   * @default [12, 14] (D-pad up and left)
   */
  prevButtons?: number[];
  /**
   * Button index for next item (down/right)
   * @default [13, 15] (D-pad down and right)
   */
  nextButtons?: number[];
  /**
   * Button index for selecting current item
   * @default [0] (A button)
   */
  selectButtons?: number[];
  /**
   * Callback when an item is selected
   */
  onSelect?: (item: T, index: number) => void;
  /**
   * Callback when selection index changes
   */
  onIndexChange?: (index: number) => void;
  /**
   * Whether to wrap around at list boundaries
   * @default true
   */
  wrapAround?: boolean;
}

/**
 * Return type for useGamepadNavigation hook
 */
export interface UseGamepadNavigationReturn<T> {
  /** Currently selected index */
  selectedIndex: number;
  /** Currently selected item (or null if items is empty) */
  selectedItem: T | null;
  /** Whether a gamepad is connected */
  isGamepadConnected: boolean;
  /** Manually set selected index */
  setSelectedIndex: (index: number) => void;
  /** Navigate to previous item */
  prev: () => void;
  /** Navigate to next item */
  next: () => void;
  /** Select current item (triggers onSelect callback) */
  select: () => void;
}

/**
 * Hook for gamepad-based menu navigation
 *
 * Provides D-pad navigation through a list of items with A button selection.
 * Useful for room selection, menu navigation, and accessibility.
 *
 * @example Basic usage for room selection
 * ```tsx
 * function RoomSelector() {
 *   const { rooms } = useRooms({ accessToken });
 *   const { connectToRoom } = useRoomConnection({ accessToken });
 *
 *   const {
 *     selectedIndex,
 *     selectedItem,
 *     isGamepadConnected,
 *   } = useGamepadNavigation({
 *     items: rooms,
 *     onSelect: (room) => connectToRoom(room.id),
 *   });
 *
 *   return (
 *     <div>
 *       {isGamepadConnected && <p>Use D-pad to navigate, A to select</p>}
 *       <ul>
 *         {rooms.map((room, index) => (
 *           <li
 *             key={room.id}
 *             style={{ fontWeight: index === selectedIndex ? 'bold' : 'normal' }}
 *             onClick={() => connectToRoom(room.id)}
 *           >
 *             {room.name}
 *           </li>
 *         ))}
 *       </ul>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example With custom buttons
 * ```tsx
 * const { selectedIndex } = useGamepadNavigation({
 *   items: menuItems,
 *   prevButtons: [GamepadButton.LB, GamepadButton.DPAD_UP],
 *   nextButtons: [GamepadButton.RB, GamepadButton.DPAD_DOWN],
 *   selectButtons: [GamepadButton.A, GamepadButton.START],
 *   onSelect: (item) => handleMenuSelect(item),
 * });
 * ```
 *
 * @example Disabled when connected to room
 * ```tsx
 * const { selectedIndex } = useGamepadNavigation({
 *   items: rooms,
 *   enabled: !isConnected, // Disable navigation when connected
 *   onSelect: handleRoomSelect,
 * });
 * ```
 */
export function useGamepadNavigation<T>(
  config: UseGamepadNavigationConfig<T>
): UseGamepadNavigationReturn<T> {
  const {
    items,
    initialIndex = 0,
    enabled = true,
    prevButtons = [GamepadButton.DPAD_UP, GamepadButton.DPAD_LEFT],
    nextButtons = [GamepadButton.DPAD_DOWN, GamepadButton.DPAD_RIGHT],
    selectButtons = [GamepadButton.A],
    onSelect,
    onIndexChange,
    wrapAround = true,
  } = config;

  const [selectedIndex, setSelectedIndexState] = useState(initialIndex);
  const [isGamepadConnected, setIsGamepadConnected] = useState(false);

  // Track previous button states for edge detection
  const prevButtonStates = useRef<Record<number, boolean>>({});
  const gamepadIndex = useRef<number | null>(null);
  const animationFrameRef = useRef<number>();

  // Ensure selectedIndex stays within bounds
  useEffect(() => {
    if (items.length === 0) {
      setSelectedIndexState(0);
    } else if (selectedIndex >= items.length) {
      setSelectedIndexState(items.length - 1);
    }
  }, [items.length, selectedIndex]);

  const setSelectedIndex = useCallback((index: number) => {
    const newIndex = Math.max(0, Math.min(index, items.length - 1));
    setSelectedIndexState(newIndex);
    onIndexChange?.(newIndex);
  }, [items.length, onIndexChange]);

  const prev = useCallback(() => {
    if (items.length === 0) return;

    setSelectedIndexState((current) => {
      let newIndex: number;
      if (current <= 0) {
        newIndex = wrapAround ? items.length - 1 : 0;
      } else {
        newIndex = current - 1;
      }
      onIndexChange?.(newIndex);
      return newIndex;
    });
  }, [items.length, wrapAround, onIndexChange]);

  const next = useCallback(() => {
    if (items.length === 0) return;

    setSelectedIndexState((current) => {
      let newIndex: number;
      if (current >= items.length - 1) {
        newIndex = wrapAround ? 0 : items.length - 1;
      } else {
        newIndex = current + 1;
      }
      onIndexChange?.(newIndex);
      return newIndex;
    });
  }, [items.length, wrapAround, onIndexChange]);

  const select = useCallback(() => {
    if (items.length === 0) return;
    const item = items[selectedIndex];
    if (item !== undefined) {
      onSelect?.(item, selectedIndex);
    }
  }, [items, selectedIndex, onSelect]);

  // Gamepad polling
  useEffect(() => {
    if (!enabled || items.length === 0) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const pollGamepad = () => {
      const gamepads = navigator.getGamepads();
      let gp: Gamepad | null = null;

      // Find connected gamepad
      if (gamepadIndex.current !== null) {
        gp = gamepads[gamepadIndex.current];
      }

      if (!gp) {
        for (const pad of gamepads) {
          if (pad) {
            gp = pad;
            gamepadIndex.current = pad.index;
            break;
          }
        }
      }

      setIsGamepadConnected(gp !== null);

      if (gp) {
        // Check all navigation buttons
        const allButtons = [...prevButtons, ...nextButtons, ...selectButtons];

        for (const btnIdx of allButtons) {
          const pressed = gp.buttons[btnIdx]?.pressed ?? false;
          const wasPressed = prevButtonStates.current[btnIdx] ?? false;

          // Edge detection - only trigger on press, not hold
          if (pressed && !wasPressed) {
            if (prevButtons.includes(btnIdx)) {
              prev();
            } else if (nextButtons.includes(btnIdx)) {
              next();
            } else if (selectButtons.includes(btnIdx)) {
              select();
            }
          }

          prevButtonStates.current[btnIdx] = pressed;
        }
      }

      animationFrameRef.current = requestAnimationFrame(pollGamepad);
    };

    animationFrameRef.current = requestAnimationFrame(pollGamepad);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enabled, items.length, prevButtons, nextButtons, selectButtons, prev, next, select]);

  const selectedItem = items.length > 0 ? items[selectedIndex] ?? null : null;

  return {
    selectedIndex,
    selectedItem,
    isGamepadConnected,
    setSelectedIndex,
    prev,
    next,
    select,
  };
}

export default useGamepadNavigation;
