# Interface: LatencyBreakdown

Defined in: [types.ts:625](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/types.ts#L625)

Comprehensive end-to-end latency breakdown
Combines measurements from robot, network, and client

## Properties

### applicationLatency

> **applicationLatency**: `number`

Defined in: [types.ts:629](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/types.ts#L629)

One-way application latency (applicationRtt / 2) in ms

***

### applicationRtt

> **applicationRtt**: `number`

Defined in: [types.ts:627](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/types.ts#L627)

Application-level round-trip time (ping/pong) in ms

***

### captureLatency

> **captureLatency**: `number`

Defined in: [types.ts:633](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/types.ts#L633)

Camera capture latency on robot (ZED SDK internal) in ms

***

### decodeTime

> **decodeTime**: `number`

Defined in: [types.ts:639](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/types.ts#L639)

Video decode time on client in ms

***

### encoderLatency

> **encoderLatency**: `number`

Defined in: [types.ts:631](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/types.ts#L631)

Encoder latency on robot (capture to encoded) in ms

***

### jitterBufferDelay

> **jitterBufferDelay**: `number`

Defined in: [types.ts:637](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/types.ts#L637)

Jitter buffer delay on client in ms

***

### pipelineLatency

> **pipelineLatency**: `number`

Defined in: [types.ts:635](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/types.ts#L635)

Pipeline processing latency on robot (videoconvert, encoder, etc) in ms

***

### timestamp

> **timestamp**: `number`

Defined in: [types.ts:643](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/types.ts#L643)

Timestamp when this breakdown was computed (Unix ms)

***

### totalLatency

> **totalLatency**: `number`

Defined in: [types.ts:641](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/types.ts#L641)

Total estimated glass-to-glass latency in ms
