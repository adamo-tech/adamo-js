# Interface: HeartbeatConfig

Defined in: [types.ts:274](https://github.com/adamo-tech/adamo-js/blob/30fc620efd2236a9998d965f14e083c25e46cc18/packages/core/src/types.ts#L274)

Configuration for heartbeat monitoring

## Properties

### checkGamepad?

> `optional` **checkGamepad**: `boolean`

Defined in: [types.ts:278](https://github.com/adamo-tech/adamo-js/blob/30fc620efd2236a9998d965f14e083c25e46cc18/packages/core/src/types.ts#L278)

Whether to check for gamepad connection (default: true)

***

### checkWindowFocus?

> `optional` **checkWindowFocus**: `boolean`

Defined in: [types.ts:280](https://github.com/adamo-tech/adamo-js/blob/30fc620efd2236a9998d965f14e083c25e46cc18/packages/core/src/types.ts#L280)

Whether to check for window focus (default: true)

***

### interval?

> `optional` **interval**: `number`

Defined in: [types.ts:276](https://github.com/adamo-tech/adamo-js/blob/30fc620efd2236a9998d965f14e083c25e46cc18/packages/core/src/types.ts#L276)

How often to send heartbeat messages in ms (default: 500)
