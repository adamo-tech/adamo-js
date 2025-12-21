# Interface: TrackStreamStats

Defined in: [types.ts:90](https://github.com/adamo-tech/adamo-js/blob/30fc620efd2236a9998d965f14e083c25e46cc18/packages/core/src/types.ts#L90)

Per-track streaming statistics

## Properties

### bitrate

> **bitrate**: `number`

Defined in: [types.ts:100](https://github.com/adamo-tech/adamo-js/blob/30fc620efd2236a9998d965f14e083c25e46cc18/packages/core/src/types.ts#L100)

Current bitrate in bits per second

***

### bytesReceived

> **bytesReceived**: `number`

Defined in: [types.ts:104](https://github.com/adamo-tech/adamo-js/blob/30fc620efd2236a9998d965f14e083c25e46cc18/packages/core/src/types.ts#L104)

Bytes received since last stats update

***

### decodeTimeMs

> **decodeTimeMs**: `number`

Defined in: [types.ts:114](https://github.com/adamo-tech/adamo-js/blob/30fc620efd2236a9998d965f14e083c25e46cc18/packages/core/src/types.ts#L114)

Decode time in milliseconds (time to decode each frame)

***

### fps

> **fps**: `number`

Defined in: [types.ts:98](https://github.com/adamo-tech/adamo-js/blob/30fc620efd2236a9998d965f14e083c25e46cc18/packages/core/src/types.ts#L98)

Current framerate

***

### framesDecoded

> **framesDecoded**: `number`

Defined in: [types.ts:106](https://github.com/adamo-tech/adamo-js/blob/30fc620efd2236a9998d965f14e083c25e46cc18/packages/core/src/types.ts#L106)

Frames decoded since last stats update

***

### framesDropped

> **framesDropped**: `number`

Defined in: [types.ts:108](https://github.com/adamo-tech/adamo-js/blob/30fc620efd2236a9998d965f14e083c25e46cc18/packages/core/src/types.ts#L108)

Frames dropped since last stats update

***

### height

> **height**: `number`

Defined in: [types.ts:96](https://github.com/adamo-tech/adamo-js/blob/30fc620efd2236a9998d965f14e083c25e46cc18/packages/core/src/types.ts#L96)

Current resolution height

***

### jitterBufferDelayMs

> **jitterBufferDelayMs**: `number`

Defined in: [types.ts:112](https://github.com/adamo-tech/adamo-js/blob/30fc620efd2236a9998d965f14e083c25e46cc18/packages/core/src/types.ts#L112)

Jitter buffer delay in milliseconds (time frames wait before playback)

***

### processingDelayMs

> **processingDelayMs**: `number`

Defined in: [types.ts:116](https://github.com/adamo-tech/adamo-js/blob/30fc620efd2236a9998d965f14e083c25e46cc18/packages/core/src/types.ts#L116)

Total processing delay: jitterBufferDelayMs + decodeTimeMs

***

### quality

> **quality**: [`StreamQuality`](../enumerations/StreamQuality.md)

Defined in: [types.ts:102](https://github.com/adamo-tech/adamo-js/blob/30fc620efd2236a9998d965f14e083c25e46cc18/packages/core/src/types.ts#L102)

Current quality tier

***

### timestamp

> **timestamp**: `number`

Defined in: [types.ts:110](https://github.com/adamo-tech/adamo-js/blob/30fc620efd2236a9998d965f14e083c25e46cc18/packages/core/src/types.ts#L110)

Timestamp of when these stats were collected

***

### trackName

> **trackName**: `string`

Defined in: [types.ts:92](https://github.com/adamo-tech/adamo-js/blob/30fc620efd2236a9998d965f14e083c25e46cc18/packages/core/src/types.ts#L92)

Track name/topic

***

### width

> **width**: `number`

Defined in: [types.ts:94](https://github.com/adamo-tech/adamo-js/blob/30fc620efd2236a9998d965f14e083c25e46cc18/packages/core/src/types.ts#L94)

Current resolution width
