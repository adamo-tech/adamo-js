# Class: AdamoClient

Defined in: [client.ts:63](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/client.ts#L63)

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

Defined in: [client.ts:85](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/client.ts#L85)

#### Parameters

##### config

[`AdamoClientConfig`](../interfaces/AdamoClientConfig.md) = `{}`

#### Returns

`AdamoClient`

## Accessors

### connectionState

#### Get Signature

> **get** **connectionState**(): [`ConnectionState`](../type-aliases/ConnectionState.md)

Defined in: [client.ts:107](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/client.ts#L107)

Get the current connection state

##### Returns

[`ConnectionState`](../type-aliases/ConnectionState.md)

***

### encoderStats

#### Get Signature

> **get** **encoderStats**(): `Map`\<`string`, [`EncoderStats`](../interfaces/EncoderStats.md)\>

Defined in: [client.ts:142](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/client.ts#L142)

Get encoder statistics from the server (per-track)

##### Returns

`Map`\<`string`, [`EncoderStats`](../interfaces/EncoderStats.md)\>

***

### lastFrameTime

#### Get Signature

> **get** **lastFrameTime**(): `Map`\<`string`, `number`\>

Defined in: [client.ts:467](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/client.ts#L467)

Get the last frame time for all tracks
Returns a map of track name to timestamp (ms) when the last frame was decoded

##### Returns

`Map`\<`string`, `number`\>

***

### liveKitRoom

#### Get Signature

> **get** **liveKitRoom**(): `Room`

Defined in: [client.ts:114](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/client.ts#L114)

Get the underlying LiveKit Room instance (for advanced use cases)

##### Returns

`Room`

***

### networkStats

#### Get Signature

> **get** **networkStats**(): [`NetworkStats`](../interfaces/NetworkStats.md) \| `null`

Defined in: [client.ts:128](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/client.ts#L128)

Get current network statistics

##### Returns

[`NetworkStats`](../interfaces/NetworkStats.md) \| `null`

***

### preferredQuality

#### Get Signature

> **get** **preferredQuality**(): [`StreamQuality`](../enumerations/StreamQuality.md)

Defined in: [client.ts:156](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/client.ts#L156)

Get the preferred quality setting

##### Returns

[`StreamQuality`](../enumerations/StreamQuality.md)

***

### serverIdentity

#### Get Signature

> **get** **serverIdentity**(): `string`

Defined in: [client.ts:121](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/client.ts#L121)

Get the server identity this client communicates with

##### Returns

`string`

***

### trackStats

#### Get Signature

> **get** **trackStats**(): `Map`\<`string`, [`TrackStreamStats`](../interfaces/TrackStreamStats.md)\>

Defined in: [client.ts:135](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/client.ts#L135)

Get statistics for all tracks

##### Returns

`Map`\<`string`, [`TrackStreamStats`](../interfaces/TrackStreamStats.md)\>

## Methods

### connect()

> **connect**(`url`, `token`): `Promise`\<`void`\>

Defined in: [client.ts:163](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/client.ts#L163)

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

Defined in: [client.ts:202](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/client.ts#L202)

Disconnect from the server

#### Returns

`void`

***

### getAvailableTracks()

> **getAvailableTracks**(): [`VideoTrack`](../interfaces/VideoTrack.md)[]

Defined in: [client.ts:218](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/client.ts#L218)

Get all available video tracks from the server

#### Returns

[`VideoTrack`](../interfaces/VideoTrack.md)[]

***

### getEncoderStats()

> **getEncoderStats**(`trackName`): [`EncoderStats`](../interfaces/EncoderStats.md) \| `undefined`

Defined in: [client.ts:149](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/client.ts#L149)

Get encoder stats for a specific track

#### Parameters

##### trackName

`string`

#### Returns

[`EncoderStats`](../interfaces/EncoderStats.md) \| `undefined`

***

### getLastFrameTime()

> **getLastFrameTime**(`trackName`): `number` \| `undefined`

Defined in: [client.ts:474](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/client.ts#L474)

Get the last frame time for a specific track

#### Parameters

##### trackName

`string`

#### Returns

`number` \| `undefined`

***

### getTrackStats()

> **getTrackStats**(`trackName`): [`TrackStreamStats`](../interfaces/TrackStreamStats.md) \| `undefined`

Defined in: [client.ts:459](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/client.ts#L459)

Get statistics for a specific track

#### Parameters

##### trackName

`string`

#### Returns

[`TrackStreamStats`](../interfaces/TrackStreamStats.md) \| `undefined`

***

### isVideoFresh()

> **isVideoFresh**(`maxStalenessMs`): `boolean`

Defined in: [client.ts:483](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/client.ts#L483)

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

Defined in: [client.ts:419](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/client.ts#L419)

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

Defined in: [client.ts:403](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/client.ts#L403)

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

Defined in: [client.ts:383](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/client.ts#L383)

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

Defined in: [client.ts:348](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/client.ts#L348)

Request the nav map from the server via RPC

#### Returns

`Promise`\<`void`\>

***

### sendHeartbeat()

> **sendHeartbeat**(`state`): `Promise`\<`void`\>

Defined in: [client.ts:328](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/client.ts#L328)

Send heartbeat to the server via RPC

#### Parameters

##### state

`number`

#### Returns

`Promise`\<`void`\>

***

### sendJoyData()

> **sendJoyData**(`axes`, `buttons`, `topic`): `Promise`\<`void`\>

Defined in: [client.ts:298](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/client.ts#L298)

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

Defined in: [client.ts:365](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/client.ts#L365)

Send a navigation goal to Nav2

#### Parameters

##### goal

[`NavGoal`](../interfaces/NavGoal.md)

#### Returns

`Promise`\<`void`\>

***

### setPreferredQuality()

> **setPreferredQuality**(`quality`): `Promise`\<`void`\>

Defined in: [client.ts:429](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/client.ts#L429)

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

Defined in: [client.ts:237](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/client.ts#L237)

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

Defined in: [client.ts:396](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/client.ts#L396)

Unregister an RPC method handler

#### Parameters

##### method

`string`

#### Returns

`void`
