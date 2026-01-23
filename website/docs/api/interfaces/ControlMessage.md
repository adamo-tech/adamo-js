# Interface: ControlMessage

Defined in: [types.ts:178](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/types.ts#L178)

Control message sent over data channel

## Indexable

\[`key`: `` `controller${number}` ``\]: [`ControllerState`](ControllerState.md) \| `undefined`

Additional controllers (controller3, controller4, etc.)

## Properties

### controller1?

> `optional` **controller1**: [`ControllerState`](ControllerState.md)

Defined in: [types.ts:180](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/types.ts#L180)

First controller state (e.g., left hand or primary gamepad)

***

### controller2?

> `optional` **controller2**: [`ControllerState`](ControllerState.md)

Defined in: [types.ts:182](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/types.ts#L182)

Second controller state (e.g., right hand or secondary gamepad)

***

### timestamp

> **timestamp**: `number`

Defined in: [types.ts:186](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/types.ts#L186)

Message timestamp
