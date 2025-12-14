# Interface: VideoTrack

Defined in: [types.ts:310](https://github.com/samconsidine/adamo/blob/95231b85d86552725697aaef7eeb461ebd99bfa1/packages/core/src/types.ts#L310)

Video track information

## Properties

### dimensions?

> `optional` **dimensions**: `object`

Defined in: [types.ts:320](https://github.com/samconsidine/adamo/blob/95231b85d86552725697aaef7eeb461ebd99bfa1/packages/core/src/types.ts#L320)

Video dimensions if available

#### height

> **height**: `number`

#### width

> **width**: `number`

***

### mediaStreamTrack?

> `optional` **mediaStreamTrack**: `MediaStreamTrack`

Defined in: [types.ts:322](https://github.com/samconsidine/adamo/blob/95231b85d86552725697aaef7eeb461ebd99bfa1/packages/core/src/types.ts#L322)

The underlying MediaStreamTrack

***

### muted

> **muted**: `boolean`

Defined in: [types.ts:318](https://github.com/samconsidine/adamo/blob/95231b85d86552725697aaef7eeb461ebd99bfa1/packages/core/src/types.ts#L318)

Whether the track is muted

***

### name

> **name**: `string`

Defined in: [types.ts:312](https://github.com/samconsidine/adamo/blob/95231b85d86552725697aaef7eeb461ebd99bfa1/packages/core/src/types.ts#L312)

Track name (matches ROS topic name without slashes)

***

### sid

> **sid**: `string`

Defined in: [types.ts:314](https://github.com/samconsidine/adamo/blob/95231b85d86552725697aaef7eeb461ebd99bfa1/packages/core/src/types.ts#L314)

Track SID

***

### subscribed

> **subscribed**: `boolean`

Defined in: [types.ts:316](https://github.com/samconsidine/adamo/blob/95231b85d86552725697aaef7eeb461ebd99bfa1/packages/core/src/types.ts#L316)

Whether the track is subscribed
