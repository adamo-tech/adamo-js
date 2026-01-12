# Interface: JoypadConfig

Defined in: [types.ts:303](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/types.ts#L303)

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

Defined in: [types.ts:328](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/types.ts#L328)

Autorepeat rate in Hz for continuous input.
Set to 0 to only send on change.

#### Default

```ts
20
```

***

### coalesceIntervalMs?

> `optional` **coalesceIntervalMs**: `number`

Defined in: [types.ts:341](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/types.ts#L341)

Debounce interval in ms to coalesce rapid input changes.

#### Default

```ts
1
```

***

### deadzone?

> `optional` **deadzone**: `number`

Defined in: [types.ts:321](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/types.ts#L321)

Axis deadzone as a fraction (0.05 = 5%).
Values within the deadzone are reported as 0.

#### Default

```ts
0.05
```

***

### deviceId?

> `optional` **deviceId**: `number`

Defined in: [types.ts:308](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/types.ts#L308)

Which gamepad to use by index (0 = first connected gamepad).

#### Default

```ts
0
```

***

### deviceName?

> `optional` **deviceName**: `string`

Defined in: [types.ts:314](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/types.ts#L314)

Filter gamepad by name substring (e.g., 'Xbox', 'DualSense').
Takes precedence over `deviceId` if specified.

***

### maxVideoStalenessMs?

> `optional` **maxVideoStalenessMs**: `number`

Defined in: [types.ts:353](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/types.ts#L353)

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

Defined in: [types.ts:335](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/types.ts#L335)

Enable toggle mode for buttons (press to toggle on/off).
Useful for functions like headlights or horn.

#### Default

```ts
false
```

***

### ~~topic?~~

> `optional` **topic**: `string`

Defined in: [types.ts:358](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/types.ts#L358)

#### Deprecated

No longer used - control messages go via single data channel
