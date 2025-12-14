# Class: AdamoClient

Defined in: [client.ts:62](https://github.com/samconsidine/adamo/blob/95231b85d86552725697aaef7eeb461ebd99bfa1/packages/core/src/client.ts#L62)

Adamo Client - Core class for teleoperation via LiveKit

Abstracts LiveKit connection and provides a simple API for:
- Connecting to a room
- Subscribing to video topics (camera feeds)
- Sending control data (joypad)
- Heartbeat monitoring

## Example

```ts
const client = new AdamoClient();

client.on('trackAvailable', (track) => {
  console.log('New track:', track.name);
});

await client.connect('ws://localhost:7880', token);
await client.subscribe('fork', (track) => {
  videoElement.srcObject = new MediaStream([track.mediaStreamTrack]);
});
```

## Constructors

### Constructor

> **new AdamoClient**(`config`): `AdamoClient`

Defined in: [client.ts:84](https://github.com/samconsidine/adamo/blob/95231b85d86552725697aaef7eeb461ebd99bfa1/packages/core/src/client.ts#L84)

#### Parameters

##### config

[`AdamoClientConfig`](../interfaces/AdamoClientConfig.md) = `{}`

#### Returns

`AdamoClient`

## Accessors

### connectionState

#### Get Signature

> **get** **connectionState**(): [`ConnectionState`](../type-aliases/ConnectionState.md)

Defined in: [client.ts:106](https://github.com/samconsidine/adamo/blob/95231b85d86552725697aaef7eeb461ebd99bfa1/packages/core/src/client.ts#L106)

Get the current connection state

##### Returns

[`ConnectionState`](../type-aliases/ConnectionState.md)

***

### encoderStats

#### Get Signature

> **get** **encoderStats**(): `Map`\<`string`, [`EncoderStats`](../interfaces/EncoderStats.md)\>

Defined in: [client.ts:141](https://github.com/samconsidine/adamo/blob/95231b85d86552725697aaef7eeb461ebd99bfa1/packages/core/src/client.ts#L141)

Get encoder statistics from the server (per-track)

##### Returns

`Map`\<`string`, [`EncoderStats`](../interfaces/EncoderStats.md)\>

***

### lastFrameTime

#### Get Signature

> **get** **lastFrameTime**(): `Map`\<`string`, `number`\>

Defined in: [client.ts:466](https://github.com/samconsidine/adamo/blob/95231b85d86552725697aaef7eeb461ebd99bfa1/packages/core/src/client.ts#L466)

Get the last frame time for all tracks
Returns a map of track name to timestamp (ms) when the last frame was decoded

##### Returns

`Map`\<`string`, `number`\>

***

### liveKitRoom

#### Get Signature

> **get** **liveKitRoom**(): `Room`

Defined in: [client.ts:113](https://github.com/samconsidine/adamo/blob/95231b85d86552725697aaef7eeb461ebd99bfa1/packages/core/src/client.ts#L113)

Get the underlying LiveKit Room instance (for advanced use cases)

##### Returns

`Room`

***

### networkStats

#### Get Signature

> **get** **networkStats**(): [`NetworkStats`](../interfaces/NetworkStats.md) \| `null`

Defined in: [client.ts:127](https://github.com/samconsidine/adamo/blob/95231b85d86552725697aaef7eeb461ebd99bfa1/packages/core/src/client.ts#L127)

Get current network statistics

##### Returns

[`NetworkStats`](../interfaces/NetworkStats.md) \| `null`

***

### preferredQuality

#### Get Signature

> **get** **preferredQuality**(): [`StreamQuality`](../enumerations/StreamQuality.md)

Defined in: [client.ts:155](https://github.com/samconsidine/adamo/blob/95231b85d86552725697aaef7eeb461ebd99bfa1/packages/core/src/client.ts#L155)

Get the preferred quality setting

##### Returns

[`StreamQuality`](../enumerations/StreamQuality.md)

***

### serverIdentity

#### Get Signature

> **get** **serverIdentity**(): `string`

Defined in: [client.ts:120](https://github.com/samconsidine/adamo/blob/95231b85d86552725697aaef7eeb461ebd99bfa1/packages/core/src/client.ts#L120)

Get the server identity this client communicates with

##### Returns

`string`

***

### trackStats

#### Get Signature

> **get** **trackStats**(): `Map`\<`string`, [`TrackStreamStats`](../interfaces/TrackStreamStats.md)\>

Defined in: [client.ts:134](https://github.com/samconsidine/adamo/blob/95231b85d86552725697aaef7eeb461ebd99bfa1/packages/core/src/client.ts#L134)

Get statistics for all tracks

##### Returns

`Map`\<`string`, [`TrackStreamStats`](../interfaces/TrackStreamStats.md)\>

## Methods

### connect()

> **connect**(`url`, `token`): `Promise`\<`void`\>

Defined in: [client.ts:162](https://github.com/samconsidine/adamo/blob/95231b85d86552725697aaef7eeb461ebd99bfa1/packages/core/src/client.ts#L162)

Connect to the Adamo server

#### Parameters

##### url

`string`

##### token

`string`

#### Returns

`Promise`\<`void`\>

***

### disconnect()

> **disconnect**(): `void`

Defined in: [client.ts:201](https://github.com/samconsidine/adamo/blob/95231b85d86552725697aaef7eeb461ebd99bfa1/packages/core/src/client.ts#L201)

Disconnect from the server

#### Returns

`void`

***

### getAvailableTracks()

> **getAvailableTracks**(): [`VideoTrack`](../interfaces/VideoTrack.md)[]

Defined in: [client.ts:217](https://github.com/samconsidine/adamo/blob/95231b85d86552725697aaef7eeb461ebd99bfa1/packages/core/src/client.ts#L217)

Get all available video tracks from the server

#### Returns

[`VideoTrack`](../interfaces/VideoTrack.md)[]

***

### getEncoderStats()

> **getEncoderStats**(`trackName`): [`EncoderStats`](../interfaces/EncoderStats.md) \| `undefined`

Defined in: [client.ts:148](https://github.com/samconsidine/adamo/blob/95231b85d86552725697aaef7eeb461ebd99bfa1/packages/core/src/client.ts#L148)

Get encoder stats for a specific track

#### Parameters

##### trackName

`string`

#### Returns

[`EncoderStats`](../interfaces/EncoderStats.md) \| `undefined`

***

### getLastFrameTime()

> **getLastFrameTime**(`trackName`): `number` \| `undefined`

Defined in: [client.ts:473](https://github.com/samconsidine/adamo/blob/95231b85d86552725697aaef7eeb461ebd99bfa1/packages/core/src/client.ts#L473)

Get the last frame time for a specific track

#### Parameters

##### trackName

`string`

#### Returns

`number` \| `undefined`

***

### getTrackStats()

> **getTrackStats**(`trackName`): [`TrackStreamStats`](../interfaces/TrackStreamStats.md) \| `undefined`

Defined in: [client.ts:458](https://github.com/samconsidine/adamo/blob/95231b85d86552725697aaef7eeb461ebd99bfa1/packages/core/src/client.ts#L458)

Get statistics for a specific track

#### Parameters

##### trackName

`string`

#### Returns

[`TrackStreamStats`](../interfaces/TrackStreamStats.md) \| `undefined`

***

### isVideoFresh()

> **isVideoFresh**(`maxStalenessMs`): `boolean`

Defined in: [client.ts:482](https://github.com/samconsidine/adamo/blob/95231b85d86552725697aaef7eeb461ebd99bfa1/packages/core/src/client.ts#L482)

Check if video feeds are fresh (majority have received frames within threshold)

#### Parameters

##### maxStalenessMs

`number` = `100`

Maximum allowed time since last frame (default: 100ms)

#### Returns

`boolean`

true if majority of tracks are fresh, false otherwise

***

### off()

> **off**\<`K`\>(`event`, `handler`): `void`

Defined in: [client.ts:418](https://github.com/samconsidine/adamo/blob/95231b85d86552725697aaef7eeb461ebd99bfa1/packages/core/src/client.ts#L418)

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

Defined in: [client.ts:402](https://github.com/samconsidine/adamo/blob/95231b85d86552725697aaef7eeb461ebd99bfa1/packages/core/src/client.ts#L402)

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

> (): `void`

##### Returns

`void`

***

### registerRpcMethod()

> **registerRpcMethod**(`method`, `handler`): `void`

Defined in: [client.ts:382](https://github.com/samconsidine/adamo/blob/95231b85d86552725697aaef7eeb461ebd99bfa1/packages/core/src/client.ts#L382)

Register an RPC method handler

#### Parameters

##### method

`string`

##### handler

(`payload`) => `string` \| `Promise`\<`string`\>

#### Returns

`void`

***

### requestNavMap()

> **requestNavMap**(): `Promise`\<`void`\>

Defined in: [client.ts:347](https://github.com/samconsidine/adamo/blob/95231b85d86552725697aaef7eeb461ebd99bfa1/packages/core/src/client.ts#L347)

Request the nav map from the server via RPC

#### Returns

`Promise`\<`void`\>

***

### sendHeartbeat()

> **sendHeartbeat**(`state`): `Promise`\<`void`\>

Defined in: [client.ts:327](https://github.com/samconsidine/adamo/blob/95231b85d86552725697aaef7eeb461ebd99bfa1/packages/core/src/client.ts#L327)

Send heartbeat to the server via RPC

#### Parameters

##### state

`number`

#### Returns

`Promise`\<`void`\>

***

### sendJoyData()

> **sendJoyData**(`axes`, `buttons`, `topic`): `Promise`\<`void`\>

Defined in: [client.ts:297](https://github.com/samconsidine/adamo/blob/95231b85d86552725697aaef7eeb461ebd99bfa1/packages/core/src/client.ts#L297)

Send joypad data to the server (fire-and-forget, lossy for low latency)

#### Parameters

##### axes

`number`[]

Axis values from the gamepad

##### buttons

`number`[]

Button states from the gamepad

##### topic

`string` = `'joy'`

Topic name to publish on (default: 'joy')

#### Returns

`Promise`\<`void`\>

***

### sendNavGoal()

> **sendNavGoal**(`goal`): `Promise`\<`void`\>

Defined in: [client.ts:364](https://github.com/samconsidine/adamo/blob/95231b85d86552725697aaef7eeb461ebd99bfa1/packages/core/src/client.ts#L364)

Send a navigation goal to Nav2

#### Parameters

##### goal

[`NavGoal`](../interfaces/NavGoal.md)

#### Returns

`Promise`\<`void`\>

***

### setPreferredQuality()

> **setPreferredQuality**(`quality`): `Promise`\<`void`\>

Defined in: [client.ts:428](https://github.com/samconsidine/adamo/blob/95231b85d86552725697aaef7eeb461ebd99bfa1/packages/core/src/client.ts#L428)

Set the preferred streaming quality
This sends a preference to the server which will adapt the stream accordingly

#### Parameters

##### quality

[`StreamQuality`](../enumerations/StreamQuality.md)

The desired quality level (LOW, MEDIUM, HIGH, or AUTO)

#### Returns

`Promise`\<`void`\>

***

### subscribe()

> **subscribe**(`topicName`, `callback`): () => `void`

Defined in: [client.ts:236](https://github.com/samconsidine/adamo/blob/95231b85d86552725697aaef7eeb461ebd99bfa1/packages/core/src/client.ts#L236)

Subscribe to a video topic by name

#### Parameters

##### topicName

`string`

The topic name (e.g., 'fork', 'front', 'left')

##### callback

(`track`) => `void`

Called when the track becomes available with video data

#### Returns

Unsubscribe function

> (): `void`

##### Returns

`void`

***

### unregisterRpcMethod()

> **unregisterRpcMethod**(`method`): `void`

Defined in: [client.ts:395](https://github.com/samconsidine/adamo/blob/95231b85d86552725697aaef7eeb461ebd99bfa1/packages/core/src/client.ts#L395)

Unregister an RPC method handler

#### Parameters

##### method

`string`

#### Returns

`void`
