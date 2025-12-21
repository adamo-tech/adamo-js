# Interface: SignalingConfig

Defined in: [webrtc/types.ts:10](https://github.com/adamo-tech/adamo-js/blob/c4a403ce719a192be99a38b5f4aeddb4ecba228f/packages/core/src/webrtc/types.ts#L10)

Configuration for connecting to the signaling server

## Properties

### iceServers?

> `optional` **iceServers**: `RTCIceServer`[]

Defined in: [webrtc/types.ts:18](https://github.com/adamo-tech/adamo-js/blob/c4a403ce719a192be99a38b5f4aeddb4ecba228f/packages/core/src/webrtc/types.ts#L18)

ICE servers for STUN/TURN

***

### roomId

> **roomId**: `string`

Defined in: [webrtc/types.ts:14](https://github.com/adamo-tech/adamo-js/blob/c4a403ce719a192be99a38b5f4aeddb4ecba228f/packages/core/src/webrtc/types.ts#L14)

Room ID to join

***

### serverUrl

> **serverUrl**: `string`

Defined in: [webrtc/types.ts:12](https://github.com/adamo-tech/adamo-js/blob/c4a403ce719a192be99a38b5f4aeddb4ecba228f/packages/core/src/webrtc/types.ts#L12)

Signaling server URL (e.g., 'wss://example.com')

***

### token?

> `optional` **token**: `string`

Defined in: [webrtc/types.ts:16](https://github.com/adamo-tech/adamo-js/blob/c4a403ce719a192be99a38b5f4aeddb4ecba228f/packages/core/src/webrtc/types.ts#L16)

Authentication token (passed via WebSocket subprotocol)

***

### websocketPath?

> `optional` **websocketPath**: `string`

Defined in: [webrtc/types.ts:20](https://github.com/adamo-tech/adamo-js/blob/c4a403ce719a192be99a38b5f4aeddb4ecba228f/packages/core/src/webrtc/types.ts#L20)

Optional full WebSocket path override (e.g., from backend response)
