# Interface: RobotStats

Defined in: [types.ts:607](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/types.ts#L607)

Robot-side statistics message
Sent periodically by the robot over the data channel

## Properties

### captureLatencyMs

> **captureLatencyMs**: `number`

Defined in: [types.ts:612](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/types.ts#L612)

Camera capture latency in milliseconds (ZED SDK internal)

***

### encoderLatencyMs

> **encoderLatencyMs**: `number`

Defined in: [types.ts:610](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/types.ts#L610)

Total encoder latency in milliseconds (capture + pipeline)

***

### framesEncoded

> **framesEncoded**: `number`

Defined in: [types.ts:616](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/types.ts#L616)

Number of frames encoded in the stats period

***

### pipelineLatencyMs

> **pipelineLatencyMs**: `number`

Defined in: [types.ts:614](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/types.ts#L614)

Pipeline processing latency in milliseconds (videoconvert, encoder, etc)

***

### timestamp

> **timestamp**: `number`

Defined in: [types.ts:618](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/types.ts#L618)

Timestamp when these stats were collected (Unix ms)

***

### type

> **type**: `"stats/robot"`

Defined in: [types.ts:608](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/types.ts#L608)
