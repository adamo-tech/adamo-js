# Interface: TopicMessage

Defined in: [types.ts:647](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/types.ts#L647)

Topic message received from the robot via data channel

The backend streams configured topics as JSON messages with this envelope.

## Properties

### data

> **data**: `unknown`

Defined in: [types.ts:653](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/types.ts#L653)

The message data, structure depends on the message type

***

### topic

> **topic**: `string`

Defined in: [types.ts:649](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/types.ts#L649)

The topic name (e.g., "/robot/status")

***

### type

> **type**: `string`

Defined in: [types.ts:651](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/types.ts#L651)

The message type (e.g., "std_msgs/String")
