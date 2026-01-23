# Class: WebRTCConnection

Defined in: [webrtc/connection.ts:37](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/webrtc/connection.ts#L37)

WebRTC connection class for robot teleoperation

Manages:
- WebSocket signaling with the relay server
- RTCPeerConnection setup and ICE handling
- Data channel for control messages (unreliable/unordered for low latency)
- Video track reception

## Example

```ts
const connection = new WebRTCConnection({
  signaling: { serverUrl: 'wss://relay.example.com', roomId: 'robot-1', token: 'jwt...' },
  onTrack: (track) => { videoEl.srcObject = new MediaStream([track]); },
  onDataChannelOpen: () => { console.log('Ready to send controls'); },
});

await connection.connect();
connection.sendControl({ controller1: { axes: [0, 0], buttons: [0] } });
```

## Constructors

### Constructor

> **new WebRTCConnection**(`config`): `WebRTCConnection`

Defined in: [webrtc/connection.ts:58](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/webrtc/connection.ts#L58)

#### Parameters

##### config

[`WebRTCConnectionConfig`](../interfaces/WebRTCConnectionConfig.md)

#### Returns

`WebRTCConnection`

## Accessors

### connectionState

#### Get Signature

> **get** **connectionState**(): [`WebRTCConnectionState`](../type-aliases/WebRTCConnectionState.md)

Defined in: [webrtc/connection.ts:90](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/webrtc/connection.ts#L90)

Get the current connection state

##### Returns

[`WebRTCConnectionState`](../type-aliases/WebRTCConnectionState.md)

***

### trackMetadata

#### Get Signature

> **get** **trackMetadata**(): `TrackMetadata`[]

Defined in: [webrtc/connection.ts:83](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/webrtc/connection.ts#L83)

Get all track metadata from the offer

##### Returns

`TrackMetadata`[]

## Methods

### connect()

> **connect**(): `Promise`\<`void`\>

Defined in: [webrtc/connection.ts:130](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/webrtc/connection.ts#L130)

Connect to signaling server and establish WebRTC connection

#### Returns

`Promise`\<`void`\>

***

### disconnect()

> **disconnect**(): `void`

Defined in: [webrtc/connection.ts:151](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/webrtc/connection.ts#L151)

Disconnect and cleanup

#### Returns

`void`

***

### forceConnect()

> **forceConnect**(): `void`

Defined in: [webrtc/connection.ts:122](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/webrtc/connection.ts#L122)

Force connect when robot is busy (another user connected).
Call this after receiving onRobotBusy callback to take over the connection.

#### Returns

`void`

***

### getNextTrackName()

> **getNextTrackName**(): `string`

Defined in: [webrtc/connection.ts:75](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/webrtc/connection.ts#L75)

Get next track name (called when tracks arrive)
Uses metadata if available, otherwise generates name

#### Returns

`string`

***

### getPeerConnection()

> **getPeerConnection**(): `RTCPeerConnection` \| `null`

Defined in: [webrtc/connection.ts:159](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/webrtc/connection.ts#L159)

Get the RTCPeerConnection for advanced usage (e.g., attaching WebCodecs transform)

#### Returns

`RTCPeerConnection` \| `null`

***

### getStats()

> **getStats**(): `Promise`\<`RTCStatsReport` \| `null`\>

Defined in: [webrtc/connection.ts:166](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/webrtc/connection.ts#L166)

Get WebRTC statistics

#### Returns

`Promise`\<`RTCStatsReport` \| `null`\>

***

### getTrackName()

> **getTrackName**(`index`): `string`

Defined in: [webrtc/connection.ts:66](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/webrtc/connection.ts#L66)

Get track name by index (from offer metadata)
Falls back to 'video_N' if not found

#### Parameters

##### index

`number`

#### Returns

`string`

***

### getVideoReceivers()

> **getVideoReceivers**(): `RTCRtpReceiver`[]

Defined in: [webrtc/connection.ts:174](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/webrtc/connection.ts#L174)

Get all video receivers for WebCodecs integration

#### Returns

`RTCRtpReceiver`[]

***

### isDataChannelOpen()

> **isDataChannelOpen**(): `boolean`

Defined in: [webrtc/connection.ts:114](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/webrtc/connection.ts#L114)

Check if the data channel is open and ready

#### Returns

`boolean`

***

### sendControl()

> **sendControl**(`data`): `boolean`

Defined in: [webrtc/connection.ts:98](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/webrtc/connection.ts#L98)

Send control data over the data channel
Returns false if the channel is not open

#### Parameters

##### data

`object`

#### Returns

`boolean`
