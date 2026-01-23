# Interface: TopicMessage

Defined in: [types.ts:655](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/types.ts#L655)

Topic message received from the robot via data channel

The backend streams configured topics as JSON messages with this envelope.

## Properties

### data

> **data**: `unknown`

Defined in: [types.ts:661](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/types.ts#L661)

The message data, structure depends on the message type

***

### topic

> **topic**: `string`

Defined in: [types.ts:657](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/types.ts#L657)

The topic name (e.g., "/robot/status")

***

### type

> **type**: `string`

Defined in: [types.ts:659](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/types.ts#L659)

The message type (e.g., "std_msgs/String")
