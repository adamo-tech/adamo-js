# Interface: WebCodecsConfig

Defined in: webcodecs/types.ts:10

Configuration for the WebCodecs video decoder

## Properties

### codec?

> `optional` **codec**: `string`

Defined in: webcodecs/types.ts:12

H.264 codec profile (e.g., 'avc1.42001f' for Baseline Level 3.1)

***

### hardwareAcceleration?

> `optional` **hardwareAcceleration**: `"prefer-hardware"` \| `"prefer-software"` \| `"no-preference"`

Defined in: webcodecs/types.ts:20

Hardware acceleration preference

***

### height?

> `optional` **height**: `number`

Defined in: webcodecs/types.ts:16

Video height

***

### optimizeForLatency?

> `optional` **optimizeForLatency**: `boolean`

Defined in: webcodecs/types.ts:18

Optimize for low latency decoding

***

### width?

> `optional` **width**: `number`

Defined in: webcodecs/types.ts:14

Video width
