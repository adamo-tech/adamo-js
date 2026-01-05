# Interface: EncoderStats

Defined in: [types.ts:497](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L497)

Encoder statistics from the server (per-track)
Sent via LiveKit data channel on topic "stats/encoder"

## Properties

### encodeTimeMs

> **encodeTimeMs**: `number`

Defined in: [types.ts:501](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L501)

Time to encode a frame in milliseconds

***

### fps

> **fps**: `number`

Defined in: [types.ts:509](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L509)

Current encoding FPS

***

### framesDropped

> **framesDropped**: `number`

Defined in: [types.ts:507](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L507)

Frames dropped in the stats period

***

### framesEncoded

> **framesEncoded**: `number`

Defined in: [types.ts:505](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L505)

Frames encoded in the stats period

***

### pipelineLatencyMs

> **pipelineLatencyMs**: `number`

Defined in: [types.ts:503](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L503)

Total pipeline latency (capture to encoded) in milliseconds

***

### timestamp

> **timestamp**: `number`

Defined in: [types.ts:511](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L511)

Timestamp when these stats were collected (Unix ms)

***

### trackName

> **trackName**: `string`

Defined in: [types.ts:499](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L499)

Track name (e.g., "fork", "front_low")
