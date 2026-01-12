# Class: AdamoClient

Defined in: [client.ts:74](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/client.ts#L74)

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

Defined in: [client.ts:102](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/client.ts#L102)

#### Parameters

##### config

[`AdamoClientConfig`](../interfaces/AdamoClientConfig.md) = `{}`

#### Returns

`AdamoClient`

## Accessors

### applicationRtt

#### Get Signature

> **get** **applicationRtt**(): `number`

Defined in: [client.ts:175](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/client.ts#L175)

Get the last application-level RTT (ping/pong round-trip) in milliseconds

##### Returns

`number`

***

### connectionState

#### Get Signature

> **get** **connectionState**(): [`ConnectionState`](../type-aliases/ConnectionState.md)

Defined in: [client.ts:109](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/client.ts#L109)

Get the current connection state

##### Returns

[`ConnectionState`](../type-aliases/ConnectionState.md)

***

### dataChannelOpen

#### Get Signature

> **get** **dataChannelOpen**(): `boolean`

Defined in: [client.ts:116](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/client.ts#L116)

Check if data channel is open and ready for sending

##### Returns

`boolean`

***

### networkStats

#### Get Signature

> **get** **networkStats**(): [`NetworkStats`](../interfaces/NetworkStats.md) \| `null`

Defined in: [client.ts:139](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/client.ts#L139)

Get current network statistics

##### Returns

[`NetworkStats`](../interfaces/NetworkStats.md) \| `null`

***

### robotStats

#### Get Signature

> **get** **robotStats**(): [`RobotStats`](../interfaces/RobotStats.md) \| `null`

Defined in: [client.ts:182](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/client.ts#L182)

Get the last robot stats received (encoder latency, etc.)

##### Returns

[`RobotStats`](../interfaces/RobotStats.md) \| `null`

***

### trackStats

#### Get Signature

> **get** **trackStats**(): `Map`\<`string`, [`TrackStreamStats`](../interfaces/TrackStreamStats.md)\>

Defined in: [client.ts:146](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/client.ts#L146)

Get track streaming statistics (Map keyed by track name)

##### Returns

`Map`\<`string`, [`TrackStreamStats`](../interfaces/TrackStreamStats.md)\>

***

### useWebCodecs

#### Get Signature

> **get** **useWebCodecs**(): `boolean`

Defined in: [client.ts:168](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/client.ts#L168)

Check if WebCodecs mode is enabled

##### Returns

`boolean`

***

### videoTrack

#### Get Signature

> **get** **videoTrack**(): [`VideoTrack`](../interfaces/VideoTrack.md) \| `null`

Defined in: [client.ts:131](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/client.ts#L131)

Get a specific video track by name (for backwards compatibility)
Returns the first track if no name specified, or null if no tracks

##### Returns

[`VideoTrack`](../interfaces/VideoTrack.md) \| `null`

***

### videoTracks

#### Get Signature

> **get** **videoTracks**(): `Map`\<`string`, [`VideoTrack`](../interfaces/VideoTrack.md)\>

Defined in: [client.ts:123](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/client.ts#L123)

Get all video tracks as a Map (keyed by track name)

##### Returns

`Map`\<`string`, [`VideoTrack`](../interfaces/VideoTrack.md)\>

## Methods

### connect()

> **connect**(`signaling`): `Promise`\<`void`\>

Defined in: [client.ts:189](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/client.ts#L189)

Connect to the robot

#### Parameters

##### signaling

[`SignalingConfig`](../interfaces/SignalingConfig.md)

#### Returns

`Promise`\<`void`\>

***

### disableWebCodecs()

> **disableWebCodecs**(): `void`

Defined in: [client.ts:376](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/client.ts#L376)

Disable WebCodecs and switch back to standard video decoding

#### Returns

`void`

***

### disconnect()

> **disconnect**(): `void`

Defined in: [client.ts:222](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/client.ts#L222)

Disconnect from the robot

#### Returns

`void`

***

### enableWebCodecs()

> **enableWebCodecs**(): `void`

Defined in: [client.ts:312](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/client.ts#L312)

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

### forceConnect()

> **forceConnect**(): `void`

Defined in: [client.ts:244](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/client.ts#L244)

Force connect when robot is busy (another user connected).
Call this after receiving the 'robotBusy' event to take over the connection.

#### Returns

`void`

***

### getLastFrameTime()

> **getLastFrameTime**(`trackName?`): `number`

Defined in: [client.ts:153](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/client.ts#L153)

Get the last frame time for a specific track (for staleness checking)

#### Parameters

##### trackName?

`string`

#### Returns

`number`

***

### getPeerConnection()

> **getPeerConnection**(): `RTCPeerConnection` \| `null`

Defined in: [client.ts:465](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/client.ts#L465)

Get the underlying RTCPeerConnection (for advanced use)

#### Returns

`RTCPeerConnection` \| `null`

***

### getTrackNames()

> **getTrackNames**(): `string`[]

Defined in: [client.ts:274](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/client.ts#L274)

Get track names (topics) of all available video tracks

#### Returns

`string`[]

***

### getVideoTrack()

> **getVideoTrack**(`name?`): [`VideoTrack`](../interfaces/VideoTrack.md) \| `null`

Defined in: [client.ts:255](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/client.ts#L255)

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

Defined in: [client.ts:267](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/client.ts#L267)

Get all video tracks as an array

#### Returns

[`VideoTrack`](../interfaces/VideoTrack.md)[]

***

### isVideoFresh()

> **isVideoFresh**(`maxStalenessMs`, `trackName?`): `boolean`

Defined in: [client.ts:474](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/client.ts#L474)

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

Defined in: [client.ts:458](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/client.ts#L458)

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

Defined in: [client.ts:442](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/client.ts#L442)

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

Defined in: [client.ts:393](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/client.ts#L393)

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

Defined in: [client.ts:282](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/client.ts#L282)

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

Defined in: [client.ts:401](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/client.ts#L401)

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

Defined in: [client.ts:410](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/client.ts#L410)

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

Defined in: [client.ts:424](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/client.ts#L424)

Send a navigation goal to Nav2

#### Parameters

##### goal

[`NavGoal`](../interfaces/NavGoal.md)

Navigation goal with x, y, theta

#### Returns

`Promise`\<`void`\>

Promise that resolves when goal is sent
