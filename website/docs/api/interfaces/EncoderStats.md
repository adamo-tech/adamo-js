# Interface: EncoderStats

Defined in: [types.ts:546](https://github.com/adamo-tech/adamo-js/blob/ff9361fbed7db73ed318d428fcef5a75002ea9d3/packages/core/src/types.ts#L546)

Encoder statistics from the server (per-track)
Sent via data channel on topic "stats/encoder"

## Properties

### encodeTimeMs

> **encodeTimeMs**: `number`

Defined in: [types.ts:550](https://github.com/adamo-tech/adamo-js/blob/ff9361fbed7db73ed318d428fcef5a75002ea9d3/packages/core/src/types.ts#L550)

Time to encode a frame in milliseconds

***

### fps

> **fps**: `number`

Defined in: [types.ts:558](https://github.com/adamo-tech/adamo-js/blob/ff9361fbed7db73ed318d428fcef5a75002ea9d3/packages/core/src/types.ts#L558)

Current encoding FPS

***

### framesDropped

> **framesDropped**: `number`

Defined in: [types.ts:556](https://github.com/adamo-tech/adamo-js/blob/ff9361fbed7db73ed318d428fcef5a75002ea9d3/packages/core/src/types.ts#L556)

Frames dropped in the stats period

***

### framesEncoded

> **framesEncoded**: `number`

Defined in: [types.ts:554](https://github.com/adamo-tech/adamo-js/blob/ff9361fbed7db73ed318d428fcef5a75002ea9d3/packages/core/src/types.ts#L554)

Frames encoded in the stats period

***

### pipelineLatencyMs

> **pipelineLatencyMs**: `number`

Defined in: [types.ts:552](https://github.com/adamo-tech/adamo-js/blob/ff9361fbed7db73ed318d428fcef5a75002ea9d3/packages/core/src/types.ts#L552)

Total pipeline latency (capture to encoded) in milliseconds

***

### timestamp

> **timestamp**: `number`

Defined in: [types.ts:560](https://github.com/adamo-tech/adamo-js/blob/ff9361fbed7db73ed318d428fcef5a75002ea9d3/packages/core/src/types.ts#L560)

Timestamp when these stats were collected (Unix ms)

***

### trackName

> **trackName**: `string`

Defined in: [types.ts:548](https://github.com/adamo-tech/adamo-js/blob/ff9361fbed7db73ed318d428fcef5a75002ea9d3/packages/core/src/types.ts#L548)

Track name (e.g., "fork", "front_low")
