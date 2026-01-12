# Interface: WebRTCConnectionConfig

Defined in: [webrtc/types.ts:56](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/webrtc/types.ts#L56)

Configuration for WebRTC connection

## Extends

- [`WebRTCConnectionCallbacks`](WebRTCConnectionCallbacks.md)

## Properties

### debug?

> `optional` **debug**: `boolean`

Defined in: [webrtc/types.ts:60](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/webrtc/types.ts#L60)

Enable debug logging

***

### onConnectionStateChange()?

> `optional` **onConnectionStateChange**: (`state`) => `void`

Defined in: [webrtc/types.ts:40](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/webrtc/types.ts#L40)

Called when connection state changes

#### Parameters

##### state

[`WebRTCConnectionState`](../type-aliases/WebRTCConnectionState.md)

#### Returns

`void`

#### Inherited from

[`WebRTCConnectionCallbacks`](WebRTCConnectionCallbacks.md).[`onConnectionStateChange`](WebRTCConnectionCallbacks.md#onconnectionstatechange)

***

### onDataChannelClose()?

> `optional` **onDataChannelClose**: () => `void`

Defined in: [webrtc/types.ts:44](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/webrtc/types.ts#L44)

Called when the data channel closes

#### Returns

`void`

#### Inherited from

[`WebRTCConnectionCallbacks`](WebRTCConnectionCallbacks.md).[`onDataChannelClose`](WebRTCConnectionCallbacks.md#ondatachannelclose)

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

#### Inherited from

[`WebRTCConnectionCallbacks`](WebRTCConnectionCallbacks.md).[`onDataChannelMessage`](WebRTCConnectionCallbacks.md#ondatachannelmessage)

***

### onDataChannelOpen()?

> `optional` **onDataChannelOpen**: () => `void`

Defined in: [webrtc/types.ts:42](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/webrtc/types.ts#L42)

Called when the data channel opens

#### Returns

`void`

#### Inherited from

[`WebRTCConnectionCallbacks`](WebRTCConnectionCallbacks.md).[`onDataChannelOpen`](WebRTCConnectionCallbacks.md#ondatachannelopen)

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

#### Inherited from

[`WebRTCConnectionCallbacks`](WebRTCConnectionCallbacks.md).[`onError`](WebRTCConnectionCallbacks.md#onerror)

***

### onRobotBusy()?

> `optional` **onRobotBusy**: () => `void`

Defined in: [webrtc/types.ts:50](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/webrtc/types.ts#L50)

Called when robot is busy (another user connected). Call forceConnect() to take over.

#### Returns

`void`

#### Inherited from

[`WebRTCConnectionCallbacks`](WebRTCConnectionCallbacks.md).[`onRobotBusy`](WebRTCConnectionCallbacks.md#onrobotbusy)

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

#### Inherited from

[`WebRTCConnectionCallbacks`](WebRTCConnectionCallbacks.md).[`onTrack`](WebRTCConnectionCallbacks.md#ontrack)

***

### signaling

> **signaling**: [`SignalingConfig`](SignalingConfig.md)

Defined in: [webrtc/types.ts:58](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/webrtc/types.ts#L58)

Signaling configuration
