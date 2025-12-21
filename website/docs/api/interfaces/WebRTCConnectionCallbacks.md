# Interface: WebRTCConnectionCallbacks

Defined in: webrtc/types.ts:36

Callbacks for WebRTC connection events

## Extended by

- [`WebRTCConnectionConfig`](WebRTCConnectionConfig.md)

## Properties

### onConnectionStateChange()?

> `optional` **onConnectionStateChange**: (`state`) => `void`

Defined in: webrtc/types.ts:40

Called when connection state changes

#### Parameters

##### state

[`WebRTCConnectionState`](../type-aliases/WebRTCConnectionState.md)

#### Returns

`void`

***

### onDataChannelClose()?

> `optional` **onDataChannelClose**: () => `void`

Defined in: webrtc/types.ts:44

Called when the data channel closes

#### Returns

`void`

***

### onDataChannelMessage()?

> `optional` **onDataChannelMessage**: (`data`) => `void`

Defined in: webrtc/types.ts:46

Called when a message is received on the data channel

#### Parameters

##### data

`unknown`

#### Returns

`void`

***

### onDataChannelOpen()?

> `optional` **onDataChannelOpen**: () => `void`

Defined in: webrtc/types.ts:42

Called when the data channel opens

#### Returns

`void`

***

### onError()?

> `optional` **onError**: (`error`) => `void`

Defined in: webrtc/types.ts:48

Called when an error occurs

#### Parameters

##### error

`Error`

#### Returns

`void`

***

### onTrack()?

> `optional` **onTrack**: (`track`, `streams`) => `void`

Defined in: webrtc/types.ts:38

Called when a media track is received

#### Parameters

##### track

`MediaStreamTrack`

##### streams

readonly `MediaStream`[]

#### Returns

`void`
