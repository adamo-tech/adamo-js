# Interface: HeartbeatConfig

Defined in: [types.ts:198](https://github.com/samconsidine/adamo/blob/ced1c9615dde5e00b0c31d8285a76b1c073d1481/packages/core/src/types.ts#L198)

Configuration for heartbeat monitoring

## Properties

### checkGamepad?

> `optional` **checkGamepad**: `boolean`

Defined in: [types.ts:202](https://github.com/samconsidine/adamo/blob/ced1c9615dde5e00b0c31d8285a76b1c073d1481/packages/core/src/types.ts#L202)

Whether to check for gamepad connection (default: true)

***

### checkWindowFocus?

> `optional` **checkWindowFocus**: `boolean`

Defined in: [types.ts:204](https://github.com/samconsidine/adamo/blob/ced1c9615dde5e00b0c31d8285a76b1c073d1481/packages/core/src/types.ts#L204)

Whether to check for window focus (default: true)

***

### interval?

> `optional` **interval**: `number`

Defined in: [types.ts:200](https://github.com/samconsidine/adamo/blob/ced1c9615dde5e00b0c31d8285a76b1c073d1481/packages/core/src/types.ts#L200)

How often to send heartbeat messages in ms (default: 500)
