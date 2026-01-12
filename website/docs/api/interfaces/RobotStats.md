# Interface: RobotStats

Defined in: [types.ts:599](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/types.ts#L599)

Robot-side statistics message
Sent periodically by the robot over the data channel

## Properties

### captureLatencyMs

> **captureLatencyMs**: `number`

Defined in: [types.ts:604](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/types.ts#L604)

Camera capture latency in milliseconds (ZED SDK internal)

***

### encoderLatencyMs

> **encoderLatencyMs**: `number`

Defined in: [types.ts:602](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/types.ts#L602)

Total encoder latency in milliseconds (capture + pipeline)

***

### framesEncoded

> **framesEncoded**: `number`

Defined in: [types.ts:608](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/types.ts#L608)

Number of frames encoded in the stats period

***

### pipelineLatencyMs

> **pipelineLatencyMs**: `number`

Defined in: [types.ts:606](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/types.ts#L606)

Pipeline processing latency in milliseconds (videoconvert, encoder, etc)

***

### timestamp

> **timestamp**: `number`

Defined in: [types.ts:610](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/types.ts#L610)

Timestamp when these stats were collected (Unix ms)

***

### type

> **type**: `"stats/robot"`

Defined in: [types.ts:600](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/types.ts#L600)
