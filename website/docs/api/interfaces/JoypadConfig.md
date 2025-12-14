# Interface: JoypadConfig

Defined in: [types.ts:225](https://github.com/samconsidine/adamo/blob/ced1c9615dde5e00b0c31d8285a76b1c073d1481/packages/core/src/types.ts#L225)

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

Defined in: [types.ts:250](https://github.com/samconsidine/adamo/blob/ced1c9615dde5e00b0c31d8285a76b1c073d1481/packages/core/src/types.ts#L250)

Autorepeat rate in Hz for continuous input.
Set to 0 to only send on change.

#### Default

```ts
20
```

***

### coalesceIntervalMs?

> `optional` **coalesceIntervalMs**: `number`

Defined in: [types.ts:263](https://github.com/samconsidine/adamo/blob/ced1c9615dde5e00b0c31d8285a76b1c073d1481/packages/core/src/types.ts#L263)

Debounce interval in ms to coalesce rapid input changes.

#### Default

```ts
1
```

***

### deadzone?

> `optional` **deadzone**: `number`

Defined in: [types.ts:243](https://github.com/samconsidine/adamo/blob/ced1c9615dde5e00b0c31d8285a76b1c073d1481/packages/core/src/types.ts#L243)

Axis deadzone as a fraction (0.05 = 5%).
Values within the deadzone are reported as 0.

#### Default

```ts
0.05
```

***

### deviceId?

> `optional` **deviceId**: `number`

Defined in: [types.ts:230](https://github.com/samconsidine/adamo/blob/ced1c9615dde5e00b0c31d8285a76b1c073d1481/packages/core/src/types.ts#L230)

Which gamepad to use by index (0 = first connected gamepad).

#### Default

```ts
0
```

***

### deviceName?

> `optional` **deviceName**: `string`

Defined in: [types.ts:236](https://github.com/samconsidine/adamo/blob/ced1c9615dde5e00b0c31d8285a76b1c073d1481/packages/core/src/types.ts#L236)

Filter gamepad by name substring (e.g., 'Xbox', 'DualSense').
Takes precedence over `deviceId` if specified.

***

### maxVideoStalenessMs?

> `optional` **maxVideoStalenessMs**: `number`

Defined in: [types.ts:275](https://github.com/samconsidine/adamo/blob/ced1c9615dde5e00b0c31d8285a76b1c073d1481/packages/core/src/types.ts#L275)

Maximum allowed video staleness in ms before blocking commands.

Safety feature: Commands are only sent if majority of video tracks
have received a frame within this threshold. Prevents "flying blind"
when video freezes.

Set to 0 to disable this safety check.

#### Default

```ts
100
```

***

### stickyButtons?

> `optional` **stickyButtons**: `boolean`

Defined in: [types.ts:257](https://github.com/samconsidine/adamo/blob/ced1c9615dde5e00b0c31d8285a76b1c073d1481/packages/core/src/types.ts#L257)

Enable toggle mode for buttons (press to toggle on/off).
Useful for functions like headlights or horn.

#### Default

```ts
false
```

***

### topic?

> `optional` **topic**: `string`

Defined in: [types.ts:292](https://github.com/samconsidine/adamo/blob/ced1c9615dde5e00b0c31d8285a76b1c073d1481/packages/core/src/types.ts#L292)

Topic name for joy messages.

Use different topics to support multiple controllers connected to
the same computer, each controlling different robot functions.

#### Default

```ts
'joy'
```

#### Example

```ts
// Driver controls movement
{ topic: 'joy_driver' }
// Passenger controls camera/arm
{ topic: 'joy_passenger' }
```
