# Interface: VideoTrack

Defined in: [types.ts:374](https://github.com/adamo-tech/adamo-js/blob/b375ddc8180651bb03b2378e0404c9955fd57e67/packages/core/src/types.ts#L374)

Video track information

## Properties

### active

> **active**: `boolean`

Defined in: [types.ts:384](https://github.com/adamo-tech/adamo-js/blob/b375ddc8180651bb03b2378e0404c9955fd57e67/packages/core/src/types.ts#L384)

Whether the track is active

***

### dimensions?

> `optional` **dimensions**: `object`

Defined in: [types.ts:382](https://github.com/adamo-tech/adamo-js/blob/b375ddc8180651bb03b2378e0404c9955fd57e67/packages/core/src/types.ts#L382)

Video dimensions if available

#### height

> **height**: `number`

#### width

> **width**: `number`

***

### id

> **id**: `string`

Defined in: [types.ts:376](https://github.com/adamo-tech/adamo-js/blob/b375ddc8180651bb03b2378e0404c9955fd57e67/packages/core/src/types.ts#L376)

Track identifier (from WebRTC)

***

### mediaStreamTrack

> **mediaStreamTrack**: `MediaStreamTrack`

Defined in: [types.ts:380](https://github.com/adamo-tech/adamo-js/blob/b375ddc8180651bb03b2378e0404c9955fd57e67/packages/core/src/types.ts#L380)

The underlying MediaStreamTrack

***

### name

> **name**: `string`

Defined in: [types.ts:378](https://github.com/adamo-tech/adamo-js/blob/b375ddc8180651bb03b2378e0404c9955fd57e67/packages/core/src/types.ts#L378)

Track name/topic (e.g., 'front_camera', 'fork') - extracted from SDP or track label
