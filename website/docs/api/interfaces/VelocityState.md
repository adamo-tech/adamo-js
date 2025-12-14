# Interface: VelocityState

Defined in: [types.ts:462](https://github.com/samconsidine/adamo/blob/ced1c9615dde5e00b0c31d8285a76b1c073d1481/packages/core/src/types.ts#L462)

Robot velocity state from /odom topic
Used for safety interlocks (e.g., prevent mode switching while moving)

## Properties

### angularZ

> **angularZ**: `number`

Defined in: [types.ts:468](https://github.com/samconsidine/adamo/blob/ced1c9615dde5e00b0c31d8285a76b1c073d1481/packages/core/src/types.ts#L468)

Rotational velocity in rad/s

***

### isMoving

> **isMoving**: `boolean`

Defined in: [types.ts:470](https://github.com/samconsidine/adamo/blob/ced1c9615dde5e00b0c31d8285a76b1c073d1481/packages/core/src/types.ts#L470)

Whether the robot is currently in motion

***

### linearX

> **linearX**: `number`

Defined in: [types.ts:464](https://github.com/samconsidine/adamo/blob/ced1c9615dde5e00b0c31d8285a76b1c073d1481/packages/core/src/types.ts#L464)

Forward/backward velocity in m/s

***

### linearY

> **linearY**: `number`

Defined in: [types.ts:466](https://github.com/samconsidine/adamo/blob/ced1c9615dde5e00b0c31d8285a76b1c073d1481/packages/core/src/types.ts#L466)

Left/right velocity in m/s (usually 0 for non-holonomic robots)

***

### timestamp

> **timestamp**: `number`

Defined in: [types.ts:472](https://github.com/samconsidine/adamo/blob/ced1c9615dde5e00b0c31d8285a76b1c073d1481/packages/core/src/types.ts#L472)

Timestamp when this state was recorded (Unix ms)
