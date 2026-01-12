# Interface: LatencyBreakdown

Defined in: [types.ts:617](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/types.ts#L617)

Comprehensive end-to-end latency breakdown
Combines measurements from robot, network, and client

## Properties

### applicationLatency

> **applicationLatency**: `number`

Defined in: [types.ts:621](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/types.ts#L621)

One-way application latency (applicationRtt / 2) in ms

***

### applicationRtt

> **applicationRtt**: `number`

Defined in: [types.ts:619](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/types.ts#L619)

Application-level round-trip time (ping/pong) in ms

***

### captureLatency

> **captureLatency**: `number`

Defined in: [types.ts:625](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/types.ts#L625)

Camera capture latency on robot (ZED SDK internal) in ms

***

### decodeTime

> **decodeTime**: `number`

Defined in: [types.ts:631](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/types.ts#L631)

Video decode time on client in ms

***

### encoderLatency

> **encoderLatency**: `number`

Defined in: [types.ts:623](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/types.ts#L623)

Encoder latency on robot (capture to encoded) in ms

***

### jitterBufferDelay

> **jitterBufferDelay**: `number`

Defined in: [types.ts:629](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/types.ts#L629)

Jitter buffer delay on client in ms

***

### pipelineLatency

> **pipelineLatency**: `number`

Defined in: [types.ts:627](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/types.ts#L627)

Pipeline processing latency on robot (videoconvert, encoder, etc) in ms

***

### timestamp

> **timestamp**: `number`

Defined in: [types.ts:635](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/types.ts#L635)

Timestamp when this breakdown was computed (Unix ms)

***

### totalLatency

> **totalLatency**: `number`

Defined in: [types.ts:633](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/types.ts#L633)

Total estimated glass-to-glass latency in ms
