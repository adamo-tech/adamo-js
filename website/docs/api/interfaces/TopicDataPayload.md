# Interface: TopicDataPayload\<T\>

Defined in: [types.ts:328](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L328)

Payload for generic topic data events

## Type Parameters

### T

`T` = `unknown`

## Properties

### data

> **data**: `T`

Defined in: [types.ts:332](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L332)

The parsed JSON data

***

### timestamp

> **timestamp**: `number`

Defined in: [types.ts:334](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L334)

Timestamp when the data was received

***

### topic

> **topic**: `string`

Defined in: [types.ts:330](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L330)

The topic name the data was received on
