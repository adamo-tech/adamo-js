# Interface: VelocityState

Defined in: [types.ts:476](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L476)

Robot velocity state from /odom topic
Used for safety interlocks (e.g., prevent mode switching while moving)

## Properties

### angularZ

> **angularZ**: `number`

Defined in: [types.ts:482](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L482)

Rotational velocity in rad/s

***

### isMoving

> **isMoving**: `boolean`

Defined in: [types.ts:484](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L484)

Whether the robot is currently in motion

***

### linearX

> **linearX**: `number`

Defined in: [types.ts:478](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L478)

Forward/backward velocity in m/s

***

### linearY

> **linearY**: `number`

Defined in: [types.ts:480](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L480)

Left/right velocity in m/s (usually 0 for non-holonomic robots)

***

### timestamp

> **timestamp**: `number`

Defined in: [types.ts:486](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L486)

Timestamp when this state was recorded (Unix ms)
