# Interface: AdaptiveStreamState

Defined in: [types.ts:108](https://github.com/adamo-tech/adamo-js/blob/2b7a4ae6c7345a05c380c1931c7621562e83adba/packages/core/src/types.ts#L108)

Aggregated adaptive streaming state

## Properties

### currentQuality

> **currentQuality**: [`StreamQuality`](../enumerations/StreamQuality.md)

Defined in: [types.ts:114](https://github.com/adamo-tech/adamo-js/blob/2b7a4ae6c7345a05c380c1931c7621562e83adba/packages/core/src/types.ts#L114)

Current actual quality being received

***

### enabled

> **enabled**: `boolean`

Defined in: [types.ts:110](https://github.com/adamo-tech/adamo-js/blob/2b7a4ae6c7345a05c380c1931c7621562e83adba/packages/core/src/types.ts#L110)

Whether adaptive streaming is enabled

***

### isAdapting

> **isAdapting**: `boolean`

Defined in: [types.ts:120](https://github.com/adamo-tech/adamo-js/blob/2b7a4ae6c7345a05c380c1931c7621562e83adba/packages/core/src/types.ts#L120)

Whether quality is currently being adapted

***

### networkStats

> **networkStats**: [`NetworkStats`](NetworkStats.md) \| `null`

Defined in: [types.ts:116](https://github.com/adamo-tech/adamo-js/blob/2b7a4ae6c7345a05c380c1931c7621562e83adba/packages/core/src/types.ts#L116)

Network statistics

***

### preferredQuality

> **preferredQuality**: [`StreamQuality`](../enumerations/StreamQuality.md)

Defined in: [types.ts:112](https://github.com/adamo-tech/adamo-js/blob/2b7a4ae6c7345a05c380c1931c7621562e83adba/packages/core/src/types.ts#L112)

Current preferred quality (user preference)

***

### qualityReason

> **qualityReason**: `string`

Defined in: [types.ts:122](https://github.com/adamo-tech/adamo-js/blob/2b7a4ae6c7345a05c380c1931c7621562e83adba/packages/core/src/types.ts#L122)

Reason for current quality level

***

### trackStats

> **trackStats**: `Map`\<`string`, [`TrackStreamStats`](TrackStreamStats.md)\>

Defined in: [types.ts:118](https://github.com/adamo-tech/adamo-js/blob/2b7a4ae6c7345a05c380c1931c7621562e83adba/packages/core/src/types.ts#L118)

Per-track statistics
