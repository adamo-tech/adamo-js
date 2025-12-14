# Interface: EncoderStats

Defined in: [types.ts:483](https://github.com/samconsidine/adamo/blob/85f829926b615b1a958ba2ad502542bb762bf4a0/packages/core/src/types.ts#L483)

Encoder statistics from the server (per-track)
Sent via LiveKit data channel on topic "stats/encoder"

## Properties

### encodeTimeMs

> **encodeTimeMs**: `number`

Defined in: [types.ts:487](https://github.com/samconsidine/adamo/blob/85f829926b615b1a958ba2ad502542bb762bf4a0/packages/core/src/types.ts#L487)

Time to encode a frame in milliseconds

***

### fps

> **fps**: `number`

Defined in: [types.ts:495](https://github.com/samconsidine/adamo/blob/85f829926b615b1a958ba2ad502542bb762bf4a0/packages/core/src/types.ts#L495)

Current encoding FPS

***

### framesDropped

> **framesDropped**: `number`

Defined in: [types.ts:493](https://github.com/samconsidine/adamo/blob/85f829926b615b1a958ba2ad502542bb762bf4a0/packages/core/src/types.ts#L493)

Frames dropped in the stats period

***

### framesEncoded

> **framesEncoded**: `number`

Defined in: [types.ts:491](https://github.com/samconsidine/adamo/blob/85f829926b615b1a958ba2ad502542bb762bf4a0/packages/core/src/types.ts#L491)

Frames encoded in the stats period

***

### pipelineLatencyMs

> **pipelineLatencyMs**: `number`

Defined in: [types.ts:489](https://github.com/samconsidine/adamo/blob/85f829926b615b1a958ba2ad502542bb762bf4a0/packages/core/src/types.ts#L489)

Total pipeline latency (capture to encoded) in milliseconds

***

### timestamp

> **timestamp**: `number`

Defined in: [types.ts:497](https://github.com/samconsidine/adamo/blob/85f829926b615b1a958ba2ad502542bb762bf4a0/packages/core/src/types.ts#L497)

Timestamp when these stats were collected (Unix ms)

***

### trackName

> **trackName**: `string`

Defined in: [types.ts:485](https://github.com/samconsidine/adamo/blob/85f829926b615b1a958ba2ad502542bb762bf4a0/packages/core/src/types.ts#L485)

Track name (e.g., "fork", "front_low")
