# Interface: RobotStats

Defined in: [types.ts:595](https://github.com/adamo-tech/adamo-js/blob/ff9361fbed7db73ed318d428fcef5a75002ea9d3/packages/core/src/types.ts#L595)

Robot-side statistics message
Sent periodically by the robot over the data channel

## Properties

### encoderLatencyMs

> **encoderLatencyMs**: `number`

Defined in: [types.ts:598](https://github.com/adamo-tech/adamo-js/blob/ff9361fbed7db73ed318d428fcef5a75002ea9d3/packages/core/src/types.ts#L598)

Average encoder latency in milliseconds (capture to encoded)

***

### framesEncoded

> **framesEncoded**: `number`

Defined in: [types.ts:600](https://github.com/adamo-tech/adamo-js/blob/ff9361fbed7db73ed318d428fcef5a75002ea9d3/packages/core/src/types.ts#L600)

Number of frames encoded in the stats period

***

### timestamp

> **timestamp**: `number`

Defined in: [types.ts:602](https://github.com/adamo-tech/adamo-js/blob/ff9361fbed7db73ed318d428fcef5a75002ea9d3/packages/core/src/types.ts#L602)

Timestamp when these stats were collected (Unix ms)

***

### type

> **type**: `"stats/robot"`

Defined in: [types.ts:596](https://github.com/adamo-tech/adamo-js/blob/ff9361fbed7db73ed318d428fcef5a75002ea9d3/packages/core/src/types.ts#L596)
