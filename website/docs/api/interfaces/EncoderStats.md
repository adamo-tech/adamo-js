# Interface: EncoderStats

Defined in: [types.ts:550](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/types.ts#L550)

Encoder statistics from the server (per-track)
Sent via data channel on topic "stats/encoder"

## Properties

### encodeTimeMs

> **encodeTimeMs**: `number`

Defined in: [types.ts:554](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/types.ts#L554)

Time to encode a frame in milliseconds

***

### fps

> **fps**: `number`

Defined in: [types.ts:562](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/types.ts#L562)

Current encoding FPS

***

### framesDropped

> **framesDropped**: `number`

Defined in: [types.ts:560](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/types.ts#L560)

Frames dropped in the stats period

***

### framesEncoded

> **framesEncoded**: `number`

Defined in: [types.ts:558](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/types.ts#L558)

Frames encoded in the stats period

***

### pipelineLatencyMs

> **pipelineLatencyMs**: `number`

Defined in: [types.ts:556](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/types.ts#L556)

Total pipeline latency (capture to encoded) in milliseconds

***

### timestamp

> **timestamp**: `number`

Defined in: [types.ts:564](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/types.ts#L564)

Timestamp when these stats were collected (Unix ms)

***

### trackName

> **trackName**: `string`

Defined in: [types.ts:552](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/types.ts#L552)

Track name (e.g., "fork", "front_low")
