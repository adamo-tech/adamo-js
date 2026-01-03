# Class: WebRTCConnection

Defined in: [webrtc/connection.ts:37](https://github.com/adamo-tech/adamo-js/blob/ff9361fbed7db73ed318d428fcef5a75002ea9d3/packages/core/src/webrtc/connection.ts#L37)

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

Defined in: [webrtc/connection.ts:56](https://github.com/adamo-tech/adamo-js/blob/ff9361fbed7db73ed318d428fcef5a75002ea9d3/packages/core/src/webrtc/connection.ts#L56)

#### Parameters

##### config

[`WebRTCConnectionConfig`](../interfaces/WebRTCConnectionConfig.md)

#### Returns

`WebRTCConnection`

## Accessors

### connectionState

#### Get Signature

> **get** **connectionState**(): [`WebRTCConnectionState`](../type-aliases/WebRTCConnectionState.md)

Defined in: [webrtc/connection.ts:88](https://github.com/adamo-tech/adamo-js/blob/ff9361fbed7db73ed318d428fcef5a75002ea9d3/packages/core/src/webrtc/connection.ts#L88)

Get the current connection state

##### Returns

[`WebRTCConnectionState`](../type-aliases/WebRTCConnectionState.md)

***

### trackMetadata

#### Get Signature

> **get** **trackMetadata**(): `TrackMetadata`[]

Defined in: [webrtc/connection.ts:81](https://github.com/adamo-tech/adamo-js/blob/ff9361fbed7db73ed318d428fcef5a75002ea9d3/packages/core/src/webrtc/connection.ts#L81)

Get all track metadata from the offer

##### Returns

`TrackMetadata`[]

## Methods

### connect()

> **connect**(): `Promise`\<`void`\>

Defined in: [webrtc/connection.ts:119](https://github.com/adamo-tech/adamo-js/blob/ff9361fbed7db73ed318d428fcef5a75002ea9d3/packages/core/src/webrtc/connection.ts#L119)

Connect to signaling server and establish WebRTC connection

#### Returns

`Promise`\<`void`\>

***

### disconnect()

> **disconnect**(): `void`

Defined in: [webrtc/connection.ts:140](https://github.com/adamo-tech/adamo-js/blob/ff9361fbed7db73ed318d428fcef5a75002ea9d3/packages/core/src/webrtc/connection.ts#L140)

Disconnect and cleanup

#### Returns

`void`

***

### getNextTrackName()

> **getNextTrackName**(): `string`

Defined in: [webrtc/connection.ts:73](https://github.com/adamo-tech/adamo-js/blob/ff9361fbed7db73ed318d428fcef5a75002ea9d3/packages/core/src/webrtc/connection.ts#L73)

Get next track name (called when tracks arrive)
Uses metadata if available, otherwise generates name

#### Returns

`string`

***

### getPeerConnection()

> **getPeerConnection**(): `RTCPeerConnection` \| `null`

Defined in: [webrtc/connection.ts:148](https://github.com/adamo-tech/adamo-js/blob/ff9361fbed7db73ed318d428fcef5a75002ea9d3/packages/core/src/webrtc/connection.ts#L148)

Get the RTCPeerConnection for advanced usage (e.g., attaching WebCodecs transform)

#### Returns

`RTCPeerConnection` \| `null`

***

### getStats()

> **getStats**(): `Promise`\<`RTCStatsReport` \| `null`\>

Defined in: [webrtc/connection.ts:155](https://github.com/adamo-tech/adamo-js/blob/ff9361fbed7db73ed318d428fcef5a75002ea9d3/packages/core/src/webrtc/connection.ts#L155)

Get WebRTC statistics

#### Returns

`Promise`\<`RTCStatsReport` \| `null`\>

***

### getTrackName()

> **getTrackName**(`index`): `string`

Defined in: [webrtc/connection.ts:64](https://github.com/adamo-tech/adamo-js/blob/ff9361fbed7db73ed318d428fcef5a75002ea9d3/packages/core/src/webrtc/connection.ts#L64)

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

Defined in: [webrtc/connection.ts:163](https://github.com/adamo-tech/adamo-js/blob/ff9361fbed7db73ed318d428fcef5a75002ea9d3/packages/core/src/webrtc/connection.ts#L163)

Get all video receivers for WebCodecs integration

#### Returns

`RTCRtpReceiver`[]

***

### isDataChannelOpen()

> **isDataChannelOpen**(): `boolean`

Defined in: [webrtc/connection.ts:112](https://github.com/adamo-tech/adamo-js/blob/ff9361fbed7db73ed318d428fcef5a75002ea9d3/packages/core/src/webrtc/connection.ts#L112)

Check if the data channel is open and ready

#### Returns

`boolean`

***

### sendControl()

> **sendControl**(`data`): `boolean`

Defined in: [webrtc/connection.ts:96](https://github.com/adamo-tech/adamo-js/blob/ff9361fbed7db73ed318d428fcef5a75002ea9d3/packages/core/src/webrtc/connection.ts#L96)

Send control data over the data channel
Returns false if the channel is not open

#### Parameters

##### data

`object`

#### Returns

`boolean`
