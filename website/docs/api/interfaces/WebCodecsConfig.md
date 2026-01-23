# Interface: WebCodecsConfig

Defined in: [webcodecs/types.ts:10](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/webcodecs/types.ts#L10)

Configuration for the WebCodecs video decoder

## Properties

### codec?

> `optional` **codec**: `string`

Defined in: [webcodecs/types.ts:12](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/webcodecs/types.ts#L12)

H.264 codec profile (e.g., 'avc1.42001f' for Baseline Level 3.1)

***

### hardwareAcceleration?

> `optional` **hardwareAcceleration**: `"prefer-hardware"` \| `"prefer-software"` \| `"no-preference"`

Defined in: [webcodecs/types.ts:20](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/webcodecs/types.ts#L20)

Hardware acceleration preference

***

### height?

> `optional` **height**: `number`

Defined in: [webcodecs/types.ts:16](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/webcodecs/types.ts#L16)

Video height

***

### optimizeForLatency?

> `optional` **optimizeForLatency**: `boolean`

Defined in: [webcodecs/types.ts:18](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/webcodecs/types.ts#L18)

Optimize for low latency decoding

***

### width?

> `optional` **width**: `number`

Defined in: [webcodecs/types.ts:14](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/webcodecs/types.ts#L14)

Video width
