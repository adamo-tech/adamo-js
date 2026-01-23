# Interface: AdamoClientConfig

Defined in: [types.ts:221](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/types.ts#L221)

Configuration options for the Adamo client.

## Example

```ts
const client = new AdamoClient({
  debug: true,
  useWebCodecs: true, // Enable ultra-low-latency decoding
});

await client.connect({
  serverUrl: 'wss://relay.example.com',
  roomId: 'robot-1',
  token: 'jwt...',
});
```

## Properties

### codecProfile?

> `optional` **codecProfile**: `string`

Defined in: [types.ts:239](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/types.ts#L239)

H.264 codec profile for WebCodecs decoder

#### Default

```ts
'avc1.42001f' (Baseline Level 3.1)
```

***

### debug?

> `optional` **debug**: `boolean`

Defined in: [types.ts:226](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/types.ts#L226)

Enable debug logging

#### Default

```ts
false
```

***

### hardwareAcceleration?

> `optional` **hardwareAcceleration**: `"prefer-hardware"` \| `"prefer-software"` \| `"no-preference"`

Defined in: [types.ts:245](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/types.ts#L245)

Hardware acceleration preference for WebCodecs

#### Default

```ts
'prefer-hardware'
```

***

### useWebCodecs?

> `optional` **useWebCodecs**: `boolean`

Defined in: [types.ts:233](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/types.ts#L233)

Enable WebCodecs for ultra-low-latency video decoding (~5-17ms decode time).
When enabled, video is decoded via a Worker instead of the browser's built-in decoder.

#### Default

```ts
false
```

***

### webCodecsWorkerUrl?

> `optional` **webCodecsWorkerUrl**: `string` \| `URL` \| `Worker`

Defined in: [types.ts:270](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/types.ts#L270)

URL or Worker instance for the WebCodecs decoder worker.

Different bundlers handle workers differently. You can provide:
- A URL string pointing to the worker file
- A URL object created with your bundler's worker import syntax
- A Worker instance you've created yourself

#### Examples

```ts
// In Next.js, create the worker yourself:
const worker = new Worker(
  new URL('@adamo-tech/core/webcodecs-worker', import.meta.url)
);
const client = new AdamoClient({ webCodecsWorker: worker });
```

```ts
import WorkerUrl from '@adamo-tech/core/webcodecs-worker?worker&url';
const client = new AdamoClient({ webCodecsWorkerUrl: WorkerUrl });
```
