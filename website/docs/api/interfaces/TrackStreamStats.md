# Interface: TrackStreamStats

Defined in: [types.ts:76](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L76)

Per-track streaming statistics

## Properties

### bitrate

> **bitrate**: `number`

Defined in: [types.ts:86](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L86)

Current bitrate in bits per second

***

### bytesReceived

> **bytesReceived**: `number`

Defined in: [types.ts:90](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L90)

Bytes received since last stats update

***

### decodeTimeMs

> **decodeTimeMs**: `number`

Defined in: [types.ts:100](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L100)

Decode time in milliseconds (time to decode each frame)

***

### fps

> **fps**: `number`

Defined in: [types.ts:84](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L84)

Current framerate

***

### framesDecoded

> **framesDecoded**: `number`

Defined in: [types.ts:92](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L92)

Frames decoded since last stats update

***

### framesDropped

> **framesDropped**: `number`

Defined in: [types.ts:94](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L94)

Frames dropped since last stats update

***

### height

> **height**: `number`

Defined in: [types.ts:82](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L82)

Current resolution height

***

### jitterBufferDelayMs

> **jitterBufferDelayMs**: `number`

Defined in: [types.ts:98](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L98)

Jitter buffer delay in milliseconds (time frames wait before playback)

***

### processingDelayMs

> **processingDelayMs**: `number`

Defined in: [types.ts:102](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L102)

Total processing delay: jitterBufferDelayMs + decodeTimeMs

***

### quality

> **quality**: [`StreamQuality`](../enumerations/StreamQuality.md)

Defined in: [types.ts:88](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L88)

Current quality tier

***

### timestamp

> **timestamp**: `number`

Defined in: [types.ts:96](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L96)

Timestamp of when these stats were collected

***

### trackName

> **trackName**: `string`

Defined in: [types.ts:78](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L78)

Track name/topic

***

### width

> **width**: `number`

Defined in: [types.ts:80](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L80)

Current resolution width
