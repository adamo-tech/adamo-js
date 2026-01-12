# Interface: VelocityState

Defined in: [types.ts:529](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/types.ts#L529)

Robot velocity state from /odom topic
Used for safety interlocks (e.g., prevent mode switching while moving)

## Properties

### angularZ

> **angularZ**: `number`

Defined in: [types.ts:535](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/types.ts#L535)

Rotational velocity in rad/s

***

### isMoving

> **isMoving**: `boolean`

Defined in: [types.ts:537](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/types.ts#L537)

Whether the robot is currently in motion

***

### linearX

> **linearX**: `number`

Defined in: [types.ts:531](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/types.ts#L531)

Forward/backward velocity in m/s

***

### linearY

> **linearY**: `number`

Defined in: [types.ts:533](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/types.ts#L533)

Left/right velocity in m/s (usually 0 for non-holonomic robots)

***

### timestamp

> **timestamp**: `number`

Defined in: [types.ts:539](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/types.ts#L539)

Timestamp when this state was recorded (Unix ms)
