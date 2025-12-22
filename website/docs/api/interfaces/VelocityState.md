# Interface: VelocityState

Defined in: [types.ts:519](https://github.com/adamo-tech/adamo-js/blob/03ecf08079e3bcaaf4e4ba8556a675a38aa12768/packages/core/src/types.ts#L519)

Robot velocity state from /odom topic
Used for safety interlocks (e.g., prevent mode switching while moving)

## Properties

### angularZ

> **angularZ**: `number`

Defined in: [types.ts:525](https://github.com/adamo-tech/adamo-js/blob/03ecf08079e3bcaaf4e4ba8556a675a38aa12768/packages/core/src/types.ts#L525)

Rotational velocity in rad/s

***

### isMoving

> **isMoving**: `boolean`

Defined in: [types.ts:527](https://github.com/adamo-tech/adamo-js/blob/03ecf08079e3bcaaf4e4ba8556a675a38aa12768/packages/core/src/types.ts#L527)

Whether the robot is currently in motion

***

### linearX

> **linearX**: `number`

Defined in: [types.ts:521](https://github.com/adamo-tech/adamo-js/blob/03ecf08079e3bcaaf4e4ba8556a675a38aa12768/packages/core/src/types.ts#L521)

Forward/backward velocity in m/s

***

### linearY

> **linearY**: `number`

Defined in: [types.ts:523](https://github.com/adamo-tech/adamo-js/blob/03ecf08079e3bcaaf4e4ba8556a675a38aa12768/packages/core/src/types.ts#L523)

Left/right velocity in m/s (usually 0 for non-holonomic robots)

***

### timestamp

> **timestamp**: `number`

Defined in: [types.ts:529](https://github.com/adamo-tech/adamo-js/blob/03ecf08079e3bcaaf4e4ba8556a675a38aa12768/packages/core/src/types.ts#L529)

Timestamp when this state was recorded (Unix ms)
