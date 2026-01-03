# Interface: LatencyBreakdown

Defined in: [types.ts:609](https://github.com/adamo-tech/adamo-js/blob/ff9361fbed7db73ed318d428fcef5a75002ea9d3/packages/core/src/types.ts#L609)

Comprehensive end-to-end latency breakdown
Combines measurements from robot, network, and client

## Properties

### applicationLatency

> **applicationLatency**: `number`

Defined in: [types.ts:613](https://github.com/adamo-tech/adamo-js/blob/ff9361fbed7db73ed318d428fcef5a75002ea9d3/packages/core/src/types.ts#L613)

One-way application latency (applicationRtt / 2) in ms

***

### applicationRtt

> **applicationRtt**: `number`

Defined in: [types.ts:611](https://github.com/adamo-tech/adamo-js/blob/ff9361fbed7db73ed318d428fcef5a75002ea9d3/packages/core/src/types.ts#L611)

Application-level round-trip time (ping/pong) in ms

***

### decodeTime

> **decodeTime**: `number`

Defined in: [types.ts:619](https://github.com/adamo-tech/adamo-js/blob/ff9361fbed7db73ed318d428fcef5a75002ea9d3/packages/core/src/types.ts#L619)

Video decode time on client in ms

***

### encoderLatency

> **encoderLatency**: `number`

Defined in: [types.ts:615](https://github.com/adamo-tech/adamo-js/blob/ff9361fbed7db73ed318d428fcef5a75002ea9d3/packages/core/src/types.ts#L615)

Encoder latency on robot (capture to encoded) in ms

***

### jitterBufferDelay

> **jitterBufferDelay**: `number`

Defined in: [types.ts:617](https://github.com/adamo-tech/adamo-js/blob/ff9361fbed7db73ed318d428fcef5a75002ea9d3/packages/core/src/types.ts#L617)

Jitter buffer delay on client in ms

***

### timestamp

> **timestamp**: `number`

Defined in: [types.ts:623](https://github.com/adamo-tech/adamo-js/blob/ff9361fbed7db73ed318d428fcef5a75002ea9d3/packages/core/src/types.ts#L623)

Timestamp when this breakdown was computed (Unix ms)

***

### totalLatency

> **totalLatency**: `number`

Defined in: [types.ts:621](https://github.com/adamo-tech/adamo-js/blob/ff9361fbed7db73ed318d428fcef5a75002ea9d3/packages/core/src/types.ts#L621)

Total estimated glass-to-glass latency in ms
