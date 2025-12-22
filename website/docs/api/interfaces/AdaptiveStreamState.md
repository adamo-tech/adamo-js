# Interface: AdaptiveStreamState

Defined in: [types.ts:122](https://github.com/adamo-tech/adamo-js/blob/b6d4e18acb8b3c0e8538bb9e7eed22aae66bce61/packages/core/src/types.ts#L122)

Aggregated adaptive streaming state

## Properties

### currentQuality

> **currentQuality**: [`StreamQuality`](../enumerations/StreamQuality.md)

Defined in: [types.ts:128](https://github.com/adamo-tech/adamo-js/blob/b6d4e18acb8b3c0e8538bb9e7eed22aae66bce61/packages/core/src/types.ts#L128)

Current actual quality being received

***

### enabled

> **enabled**: `boolean`

Defined in: [types.ts:124](https://github.com/adamo-tech/adamo-js/blob/b6d4e18acb8b3c0e8538bb9e7eed22aae66bce61/packages/core/src/types.ts#L124)

Whether adaptive streaming is enabled

***

### isAdapting

> **isAdapting**: `boolean`

Defined in: [types.ts:134](https://github.com/adamo-tech/adamo-js/blob/b6d4e18acb8b3c0e8538bb9e7eed22aae66bce61/packages/core/src/types.ts#L134)

Whether quality is currently being adapted

***

### networkStats

> **networkStats**: [`NetworkStats`](NetworkStats.md) \| `null`

Defined in: [types.ts:130](https://github.com/adamo-tech/adamo-js/blob/b6d4e18acb8b3c0e8538bb9e7eed22aae66bce61/packages/core/src/types.ts#L130)

Network statistics

***

### preferredQuality

> **preferredQuality**: [`StreamQuality`](../enumerations/StreamQuality.md)

Defined in: [types.ts:126](https://github.com/adamo-tech/adamo-js/blob/b6d4e18acb8b3c0e8538bb9e7eed22aae66bce61/packages/core/src/types.ts#L126)

Current preferred quality (user preference)

***

### qualityReason

> **qualityReason**: `string`

Defined in: [types.ts:136](https://github.com/adamo-tech/adamo-js/blob/b6d4e18acb8b3c0e8538bb9e7eed22aae66bce61/packages/core/src/types.ts#L136)

Reason for current quality level

***

### trackStats

> **trackStats**: `Map`\<`string`, [`TrackStreamStats`](TrackStreamStats.md)\>

Defined in: [types.ts:132](https://github.com/adamo-tech/adamo-js/blob/b6d4e18acb8b3c0e8538bb9e7eed22aae66bce61/packages/core/src/types.ts#L132)

Per-track statistics
