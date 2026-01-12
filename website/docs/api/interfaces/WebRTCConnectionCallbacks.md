# Interface: WebRTCConnectionCallbacks

Defined in: [webrtc/types.ts:36](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/webrtc/types.ts#L36)

Callbacks for WebRTC connection events

## Extended by

- [`WebRTCConnectionConfig`](WebRTCConnectionConfig.md)

## Properties

### onConnectionStateChange()?

> `optional` **onConnectionStateChange**: (`state`) => `void`

Defined in: [webrtc/types.ts:40](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/webrtc/types.ts#L40)

Called when connection state changes

#### Parameters

##### state

[`WebRTCConnectionState`](../type-aliases/WebRTCConnectionState.md)

#### Returns

`void`

***

### onDataChannelClose()?

> `optional` **onDataChannelClose**: () => `void`

Defined in: [webrtc/types.ts:44](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/webrtc/types.ts#L44)

Called when the data channel closes

#### Returns

`void`

***

### onDataChannelMessage()?

> `optional` **onDataChannelMessage**: (`data`) => `void`

Defined in: [webrtc/types.ts:46](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/webrtc/types.ts#L46)

Called when a message is received on the data channel

#### Parameters

##### data

`unknown`

#### Returns

`void`

***

### onDataChannelOpen()?

> `optional` **onDataChannelOpen**: () => `void`

Defined in: [webrtc/types.ts:42](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/webrtc/types.ts#L42)

Called when the data channel opens

#### Returns

`void`

***

### onError()?

> `optional` **onError**: (`error`) => `void`

Defined in: [webrtc/types.ts:48](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/webrtc/types.ts#L48)

Called when an error occurs

#### Parameters

##### error

`Error`

#### Returns

`void`

***

### onRobotBusy()?

> `optional` **onRobotBusy**: () => `void`

Defined in: [webrtc/types.ts:50](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/webrtc/types.ts#L50)

Called when robot is busy (another user connected). Call forceConnect() to take over.

#### Returns

`void`

***

### onTrack()?

> `optional` **onTrack**: (`track`, `streams`) => `void`

Defined in: [webrtc/types.ts:38](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/webrtc/types.ts#L38)

Called when a media track is received

#### Parameters

##### track

`MediaStreamTrack`

##### streams

readonly `MediaStream`[]

#### Returns

`void`
