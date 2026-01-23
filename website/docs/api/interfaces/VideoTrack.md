# Interface: VideoTrack

Defined in: [types.ts:384](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/types.ts#L384)

Video track information

## Properties

### active

> **active**: `boolean`

Defined in: [types.ts:394](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/types.ts#L394)

Whether the track is active

***

### dimensions?

> `optional` **dimensions**: `object`

Defined in: [types.ts:392](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/types.ts#L392)

Video dimensions if available

#### height

> **height**: `number`

#### width

> **width**: `number`

***

### id

> **id**: `string`

Defined in: [types.ts:386](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/types.ts#L386)

Track identifier (from WebRTC)

***

### mediaStreamTrack

> **mediaStreamTrack**: `MediaStreamTrack`

Defined in: [types.ts:390](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/types.ts#L390)

The underlying MediaStreamTrack

***

### name

> **name**: `string`

Defined in: [types.ts:388](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/types.ts#L388)

Track name/topic (e.g., 'front_camera', 'fork') - extracted from SDP or track label
