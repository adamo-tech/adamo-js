# Function: attachWebCodecsTransform()

> **attachWebCodecsTransform**(`receiver`, `worker`): [`AttachTransformResult`](../interfaces/AttachTransformResult.md)

Defined in: [webcodecs/transform.ts:61](https://github.com/adamo-tech/adamo-js/blob/c4a403ce719a192be99a38b5f4aeddb4ecba228f/packages/core/src/webcodecs/transform.ts#L61)

Attach a WebCodecs transform to an RTCRtpReceiver

Tries RTCRtpScriptTransform first (modern API), then falls back to
Insertable Streams if available.

## Parameters

### receiver

`RTCRtpReceiver`

The RTCRtpReceiver to attach to

### worker

`Worker`

The WebCodecs decoder worker

## Returns

[`AttachTransformResult`](../interfaces/AttachTransformResult.md)

Result indicating success/failure and method used

## Example

```ts
const worker = new Worker(new URL('./decoder-worker.ts', import.meta.url), { type: 'module' });
const receiver = pc.getReceivers().find(r => r.track?.kind === 'video');

const result = attachWebCodecsTransform(receiver, worker);
if (result.success) {
  console.log('Transform attached via:', result.method);
}
```
