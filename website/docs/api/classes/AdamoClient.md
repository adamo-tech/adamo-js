# Class: AdamoClient

Defined in: [client.ts:71](https://github.com/adamo-tech/adamo-js/blob/b375ddc8180651bb03b2378e0404c9955fd57e67/packages/core/src/client.ts#L71)

Adamo Client - Core class for teleoperation via WebRTC

Provides a simple API for:
- Connecting to a robot
- Receiving video streams
- Sending control data (gamepad)
- Heartbeat monitoring

## Example

```ts
const client = new AdamoClient({ debug: true });

client.on('videoTrackReceived', (track) => {
  videoElement.srcObject = new MediaStream([track.mediaStreamTrack]);
});

client.on('dataChannelOpen', () => {
  console.log('Ready to send controls!');
});

await client.connect({
  serverUrl: 'wss://relay.example.com',
  roomId: 'robot-1',
  token: 'jwt...',
});

// Send control data
client.sendControl({
  controller1: { axes: [0, 0.5], buttons: [0, 1] },
  timestamp: Date.now(),
});
```

## Constructors

### Constructor

> **new AdamoClient**(`config`): `AdamoClient`

Defined in: [client.ts:92](https://github.com/adamo-tech/adamo-js/blob/b375ddc8180651bb03b2378e0404c9955fd57e67/packages/core/src/client.ts#L92)

#### Parameters

##### config

[`AdamoClientConfig`](../interfaces/AdamoClientConfig.md) = `{}`

#### Returns

`AdamoClient`

## Accessors

### connectionState

#### Get Signature

> **get** **connectionState**(): [`ConnectionState`](../type-aliases/ConnectionState.md)

Defined in: [client.ts:99](https://github.com/adamo-tech/adamo-js/blob/b375ddc8180651bb03b2378e0404c9955fd57e67/packages/core/src/client.ts#L99)

Get the current connection state

##### Returns

[`ConnectionState`](../type-aliases/ConnectionState.md)

***

### dataChannelOpen

#### Get Signature

> **get** **dataChannelOpen**(): `boolean`

Defined in: [client.ts:106](https://github.com/adamo-tech/adamo-js/blob/b375ddc8180651bb03b2378e0404c9955fd57e67/packages/core/src/client.ts#L106)

Check if data channel is open and ready for sending

##### Returns

`boolean`

***

### networkStats

#### Get Signature

> **get** **networkStats**(): [`NetworkStats`](../interfaces/NetworkStats.md) \| `null`

Defined in: [client.ts:129](https://github.com/adamo-tech/adamo-js/blob/b375ddc8180651bb03b2378e0404c9955fd57e67/packages/core/src/client.ts#L129)

Get current network statistics

##### Returns

[`NetworkStats`](../interfaces/NetworkStats.md) \| `null`

***

### trackStats

#### Get Signature

> **get** **trackStats**(): `Map`\<`string`, [`TrackStreamStats`](../interfaces/TrackStreamStats.md)\>

Defined in: [client.ts:136](https://github.com/adamo-tech/adamo-js/blob/b375ddc8180651bb03b2378e0404c9955fd57e67/packages/core/src/client.ts#L136)

Get track streaming statistics (Map keyed by track name)

##### Returns

`Map`\<`string`, [`TrackStreamStats`](../interfaces/TrackStreamStats.md)\>

***

### useWebCodecs

#### Get Signature

> **get** **useWebCodecs**(): `boolean`

Defined in: [client.ts:158](https://github.com/adamo-tech/adamo-js/blob/b375ddc8180651bb03b2378e0404c9955fd57e67/packages/core/src/client.ts#L158)

Check if WebCodecs mode is enabled

##### Returns

`boolean`

***

### videoTrack

#### Get Signature

> **get** **videoTrack**(): [`VideoTrack`](../interfaces/VideoTrack.md) \| `null`

Defined in: [client.ts:121](https://github.com/adamo-tech/adamo-js/blob/b375ddc8180651bb03b2378e0404c9955fd57e67/packages/core/src/client.ts#L121)

Get a specific video track by name (for backwards compatibility)
Returns the first track if no name specified, or null if no tracks

##### Returns

[`VideoTrack`](../interfaces/VideoTrack.md) \| `null`

***

### videoTracks

#### Get Signature

> **get** **videoTracks**(): `Map`\<`string`, [`VideoTrack`](../interfaces/VideoTrack.md)\>

Defined in: [client.ts:113](https://github.com/adamo-tech/adamo-js/blob/b375ddc8180651bb03b2378e0404c9955fd57e67/packages/core/src/client.ts#L113)

Get all video tracks as a Map (keyed by track name)

##### Returns

`Map`\<`string`, [`VideoTrack`](../interfaces/VideoTrack.md)\>

## Methods

### connect()

> **connect**(`signaling`): `Promise`\<`void`\>

Defined in: [client.ts:165](https://github.com/adamo-tech/adamo-js/blob/b375ddc8180651bb03b2378e0404c9955fd57e67/packages/core/src/client.ts#L165)

Connect to the robot

#### Parameters

##### signaling

[`SignalingConfig`](../interfaces/SignalingConfig.md)

#### Returns

`Promise`\<`void`\>

***

### disableWebCodecs()

> **disableWebCodecs**(): `void`

Defined in: [client.ts:341](https://github.com/adamo-tech/adamo-js/blob/b375ddc8180651bb03b2378e0404c9955fd57e67/packages/core/src/client.ts#L341)

Disable WebCodecs and switch back to standard video decoding

#### Returns

`void`

***

### disconnect()

> **disconnect**(): `void`

Defined in: [client.ts:197](https://github.com/adamo-tech/adamo-js/blob/b375ddc8180651bb03b2378e0404c9955fd57e67/packages/core/src/client.ts#L197)

Disconnect from the robot

#### Returns

`void`

***

### enableWebCodecs()

> **enableWebCodecs**(): `void`

Defined in: [client.ts:277](https://github.com/adamo-tech/adamo-js/blob/b375ddc8180651bb03b2378e0404c9955fd57e67/packages/core/src/client.ts#L277)

Enable WebCodecs ultra-low-latency decoding.

The worker can be provided via config.webCodecsWorkerUrl as:
- A Worker instance (recommended for bundler compatibility)
- A URL or string URL pointing to the worker file

If no worker is provided, this will throw an error.

#### Returns

`void`

#### Example

```ts
// Create worker with your bundler's syntax
const worker = new Worker(
  new URL('@adamo-tech/core/dist/webcodecs/decoder-worker.mjs', import.meta.url),
  { type: 'module' }
);
const client = new AdamoClient({ webCodecsWorkerUrl: worker });
client.enableWebCodecs();
```

***

### getLastFrameTime()

> **getLastFrameTime**(`trackName?`): `number`

Defined in: [client.ts:143](https://github.com/adamo-tech/adamo-js/blob/b375ddc8180651bb03b2378e0404c9955fd57e67/packages/core/src/client.ts#L143)

Get the last frame time for a specific track (for staleness checking)

#### Parameters

##### trackName?

`string`

#### Returns

`number`

***

### getPeerConnection()

> **getPeerConnection**(): `RTCPeerConnection` \| `null`

Defined in: [client.ts:430](https://github.com/adamo-tech/adamo-js/blob/b375ddc8180651bb03b2378e0404c9955fd57e67/packages/core/src/client.ts#L430)

Get the underlying RTCPeerConnection (for advanced use)

#### Returns

`RTCPeerConnection` \| `null`

***

### getTrackNames()

> **getTrackNames**(): `string`[]

Defined in: [client.ts:239](https://github.com/adamo-tech/adamo-js/blob/b375ddc8180651bb03b2378e0404c9955fd57e67/packages/core/src/client.ts#L239)

Get track names (topics) of all available video tracks

#### Returns

`string`[]

***

### getVideoTrack()

> **getVideoTrack**(`name?`): [`VideoTrack`](../interfaces/VideoTrack.md) \| `null`

Defined in: [client.ts:220](https://github.com/adamo-tech/adamo-js/blob/b375ddc8180651bb03b2378e0404c9955fd57e67/packages/core/src/client.ts#L220)

Get a video track by name

#### Parameters

##### name?

`string`

Track name/topic (e.g., 'front_camera')

#### Returns

[`VideoTrack`](../interfaces/VideoTrack.md) \| `null`

The video track or null if not found

***

### getVideoTracks()

> **getVideoTracks**(): [`VideoTrack`](../interfaces/VideoTrack.md)[]

Defined in: [client.ts:232](https://github.com/adamo-tech/adamo-js/blob/b375ddc8180651bb03b2378e0404c9955fd57e67/packages/core/src/client.ts#L232)

Get all video tracks as an array

#### Returns

[`VideoTrack`](../interfaces/VideoTrack.md)[]

***

### isVideoFresh()

> **isVideoFresh**(`maxStalenessMs`, `trackName?`): `boolean`

Defined in: [client.ts:439](https://github.com/adamo-tech/adamo-js/blob/b375ddc8180651bb03b2378e0404c9955fd57e67/packages/core/src/client.ts#L439)

Check if video is fresh (frames received recently)

#### Parameters

##### maxStalenessMs

`number` = `100`

Maximum allowed time since last frame

##### trackName?

`string`

Optional track name to check specific track

#### Returns

`boolean`

***

### off()

> **off**\<`K`\>(`event`, `handler`): `void`

Defined in: [client.ts:423](https://github.com/adamo-tech/adamo-js/blob/b375ddc8180651bb03b2378e0404c9955fd57e67/packages/core/src/client.ts#L423)

Remove an event listener

#### Type Parameters

##### K

`K` *extends* keyof [`AdamoClientEvents`](../interfaces/AdamoClientEvents.md)

#### Parameters

##### event

`K`

##### handler

[`AdamoClientEvents`](../interfaces/AdamoClientEvents.md)\[`K`\]

#### Returns

`void`

***

### on()

> **on**\<`K`\>(`event`, `handler`): () => `void`

Defined in: [client.ts:407](https://github.com/adamo-tech/adamo-js/blob/b375ddc8180651bb03b2378e0404c9955fd57e67/packages/core/src/client.ts#L407)

Add an event listener

#### Type Parameters

##### K

`K` *extends* keyof [`AdamoClientEvents`](../interfaces/AdamoClientEvents.md)

#### Parameters

##### event

`K`

##### handler

[`AdamoClientEvents`](../interfaces/AdamoClientEvents.md)\[`K`\]

#### Returns

Unsubscribe function

> (): `void`

##### Returns

`void`

***

### onDecodedFrame()

> **onDecodedFrame**(`callback`): () => `void`

Defined in: [client.ts:358](https://github.com/adamo-tech/adamo-js/blob/b375ddc8180651bb03b2378e0404c9955fd57e67/packages/core/src/client.ts#L358)

Register a callback for decoded frames (WebCodecs mode)

#### Parameters

##### callback

(`frame`) => `void`

#### Returns

Unsubscribe function

> (): `void`

##### Returns

`void`

***

### onVideoTrack()

> **onVideoTrack**(`callback`): () => `void`

Defined in: [client.ts:247](https://github.com/adamo-tech/adamo-js/blob/b375ddc8180651bb03b2378e0404c9955fd57e67/packages/core/src/client.ts#L247)

Register a callback for when video track becomes available

#### Parameters

##### callback

(`track`) => `void`

#### Returns

Unsubscribe function

> (): `void`

##### Returns

`void`

***

### sendControl()

> **sendControl**(`data`): `boolean`

Defined in: [client.ts:366](https://github.com/adamo-tech/adamo-js/blob/b375ddc8180651bb03b2378e0404c9955fd57e67/packages/core/src/client.ts#L366)

Send control data to the robot

#### Parameters

##### data

[`ControlMessage`](../interfaces/ControlMessage.md)

#### Returns

`boolean`

true if sent, false if data channel not open

***

### sendHeartbeat()

> **sendHeartbeat**(`state`): `boolean`

Defined in: [client.ts:375](https://github.com/adamo-tech/adamo-js/blob/b375ddc8180651bb03b2378e0404c9955fd57e67/packages/core/src/client.ts#L375)

Send heartbeat state to the robot

#### Parameters

##### state

[`HeartbeatState`](../enumerations/HeartbeatState.md)

#### Returns

`boolean`

true if sent, false if data channel not open

***

### sendNavGoal()

> **sendNavGoal**(`goal`): `Promise`\<`void`\>

Defined in: [client.ts:389](https://github.com/adamo-tech/adamo-js/blob/b375ddc8180651bb03b2378e0404c9955fd57e67/packages/core/src/client.ts#L389)

Send a navigation goal to Nav2

#### Parameters

##### goal

[`NavGoal`](../interfaces/NavGoal.md)

Navigation goal with x, y, theta

#### Returns

`Promise`\<`void`\>

Promise that resolves when goal is sent
