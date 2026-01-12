# Interface: TopicMessage

Defined in: [types.ts:645](https://github.com/adamo-tech/adamo-js/blob/974791bc026342b71f3328303c240604853e07fc/packages/core/src/types.ts#L645)

Topic message received from the robot via data channel

The backend streams configured topics as JSON messages with this envelope.

## Properties

### data

> **data**: `unknown`

Defined in: [types.ts:651](https://github.com/adamo-tech/adamo-js/blob/974791bc026342b71f3328303c240604853e07fc/packages/core/src/types.ts#L651)

The message data, structure depends on the message type

***

### topic

> **topic**: `string`

Defined in: [types.ts:647](https://github.com/adamo-tech/adamo-js/blob/974791bc026342b71f3328303c240604853e07fc/packages/core/src/types.ts#L647)

The topic name (e.g., "/robot/status")

***

### type

> **type**: `string`

Defined in: [types.ts:649](https://github.com/adamo-tech/adamo-js/blob/974791bc026342b71f3328303c240604853e07fc/packages/core/src/types.ts#L649)

The message type (e.g., "std_msgs/String")
