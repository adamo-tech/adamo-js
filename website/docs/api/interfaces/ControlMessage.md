# Interface: ControlMessage

Defined in: [types.ts:178](https://github.com/adamo-tech/adamo-js/blob/c4a403ce719a192be99a38b5f4aeddb4ecba228f/packages/core/src/types.ts#L178)

Control message sent over data channel

## Properties

### controller1?

> `optional` **controller1**: [`ControllerState`](ControllerState.md)

Defined in: [types.ts:180](https://github.com/adamo-tech/adamo-js/blob/c4a403ce719a192be99a38b5f4aeddb4ecba228f/packages/core/src/types.ts#L180)

First controller state (e.g., left hand or primary gamepad)

***

### controller2?

> `optional` **controller2**: [`ControllerState`](ControllerState.md)

Defined in: [types.ts:182](https://github.com/adamo-tech/adamo-js/blob/c4a403ce719a192be99a38b5f4aeddb4ecba228f/packages/core/src/types.ts#L182)

Second controller state (e.g., right hand or secondary gamepad)

***

### timestamp

> **timestamp**: `number`

Defined in: [types.ts:184](https://github.com/adamo-tech/adamo-js/blob/c4a403ce719a192be99a38b5f4aeddb4ecba228f/packages/core/src/types.ts#L184)

Message timestamp
