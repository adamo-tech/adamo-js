# Interface: JoypadConfig

Defined in: [types.ts:301](https://github.com/adamo-tech/adamo-js/blob/c4a403ce719a192be99a38b5f4aeddb4ecba228f/packages/core/src/types.ts#L301)

Joypad (gamepad) configuration matching ROS joy_node parameters.

Maps W3C Gamepad API to ROS `sensor_msgs/Joy` format.

## Example

```tsx
// Single controller (default)
<GamepadController />

// Multiple controllers with different topics
<GamepadController config={{ deviceId: 0, topic: 'joy_driver' }} />
<GamepadController config={{ deviceId: 1, topic: 'joy_passenger' }} />

// Select controller by name
<GamepadController config={{ deviceName: 'Xbox', deadzone: 0.1 }} />
```

## Properties

### autorepeatRate?

> `optional` **autorepeatRate**: `number`

Defined in: [types.ts:326](https://github.com/adamo-tech/adamo-js/blob/c4a403ce719a192be99a38b5f4aeddb4ecba228f/packages/core/src/types.ts#L326)

Autorepeat rate in Hz for continuous input.
Set to 0 to only send on change.

#### Default

```ts
20
```

***

### coalesceIntervalMs?

> `optional` **coalesceIntervalMs**: `number`

Defined in: [types.ts:339](https://github.com/adamo-tech/adamo-js/blob/c4a403ce719a192be99a38b5f4aeddb4ecba228f/packages/core/src/types.ts#L339)

Debounce interval in ms to coalesce rapid input changes.

#### Default

```ts
1
```

***

### deadzone?

> `optional` **deadzone**: `number`

Defined in: [types.ts:319](https://github.com/adamo-tech/adamo-js/blob/c4a403ce719a192be99a38b5f4aeddb4ecba228f/packages/core/src/types.ts#L319)

Axis deadzone as a fraction (0.05 = 5%).
Values within the deadzone are reported as 0.

#### Default

```ts
0.05
```

***

### deviceId?

> `optional` **deviceId**: `number`

Defined in: [types.ts:306](https://github.com/adamo-tech/adamo-js/blob/c4a403ce719a192be99a38b5f4aeddb4ecba228f/packages/core/src/types.ts#L306)

Which gamepad to use by index (0 = first connected gamepad).

#### Default

```ts
0
```

***

### deviceName?

> `optional` **deviceName**: `string`

Defined in: [types.ts:312](https://github.com/adamo-tech/adamo-js/blob/c4a403ce719a192be99a38b5f4aeddb4ecba228f/packages/core/src/types.ts#L312)

Filter gamepad by name substring (e.g., 'Xbox', 'DualSense').
Takes precedence over `deviceId` if specified.

***

### maxVideoStalenessMs?

> `optional` **maxVideoStalenessMs**: `number`

Defined in: [types.ts:351](https://github.com/adamo-tech/adamo-js/blob/c4a403ce719a192be99a38b5f4aeddb4ecba228f/packages/core/src/types.ts#L351)

Maximum allowed video staleness in ms before blocking commands.

Safety feature: Commands are only sent if video track
has received a frame within this threshold. Prevents "flying blind"
when video freezes.

Set to 0 to disable this safety check.

#### Default

```ts
100
```

***

### stickyButtons?

> `optional` **stickyButtons**: `boolean`

Defined in: [types.ts:333](https://github.com/adamo-tech/adamo-js/blob/c4a403ce719a192be99a38b5f4aeddb4ecba228f/packages/core/src/types.ts#L333)

Enable toggle mode for buttons (press to toggle on/off).
Useful for functions like headlights or horn.

#### Default

```ts
false
```

***

### ~~topic?~~

> `optional` **topic**: `string`

Defined in: [types.ts:356](https://github.com/adamo-tech/adamo-js/blob/c4a403ce719a192be99a38b5f4aeddb4ecba228f/packages/core/src/types.ts#L356)

#### Deprecated

No longer used - control messages go via single data channel
