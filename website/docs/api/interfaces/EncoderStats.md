# Interface: EncoderStats

Defined in: [types.ts:540](https://github.com/adamo-tech/adamo-js/blob/c4a403ce719a192be99a38b5f4aeddb4ecba228f/packages/core/src/types.ts#L540)

Encoder statistics from the server (per-track)
Sent via data channel on topic "stats/encoder"

## Properties

### encodeTimeMs

> **encodeTimeMs**: `number`

Defined in: [types.ts:544](https://github.com/adamo-tech/adamo-js/blob/c4a403ce719a192be99a38b5f4aeddb4ecba228f/packages/core/src/types.ts#L544)

Time to encode a frame in milliseconds

***

### fps

> **fps**: `number`

Defined in: [types.ts:552](https://github.com/adamo-tech/adamo-js/blob/c4a403ce719a192be99a38b5f4aeddb4ecba228f/packages/core/src/types.ts#L552)

Current encoding FPS

***

### framesDropped

> **framesDropped**: `number`

Defined in: [types.ts:550](https://github.com/adamo-tech/adamo-js/blob/c4a403ce719a192be99a38b5f4aeddb4ecba228f/packages/core/src/types.ts#L550)

Frames dropped in the stats period

***

### framesEncoded

> **framesEncoded**: `number`

Defined in: [types.ts:548](https://github.com/adamo-tech/adamo-js/blob/c4a403ce719a192be99a38b5f4aeddb4ecba228f/packages/core/src/types.ts#L548)

Frames encoded in the stats period

***

### pipelineLatencyMs

> **pipelineLatencyMs**: `number`

Defined in: [types.ts:546](https://github.com/adamo-tech/adamo-js/blob/c4a403ce719a192be99a38b5f4aeddb4ecba228f/packages/core/src/types.ts#L546)

Total pipeline latency (capture to encoded) in milliseconds

***

### timestamp

> **timestamp**: `number`

Defined in: [types.ts:554](https://github.com/adamo-tech/adamo-js/blob/c4a403ce719a192be99a38b5f4aeddb4ecba228f/packages/core/src/types.ts#L554)

Timestamp when these stats were collected (Unix ms)

***

### trackName

> **trackName**: `string`

Defined in: [types.ts:542](https://github.com/adamo-tech/adamo-js/blob/c4a403ce719a192be99a38b5f4aeddb4ecba228f/packages/core/src/types.ts#L542)

Track name (e.g., "fork", "front_low")
