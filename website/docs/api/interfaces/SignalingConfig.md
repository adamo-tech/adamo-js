# Interface: SignalingConfig

Defined in: webrtc/types.ts:10

Configuration for connecting to the signaling server

## Properties

### iceServers?

> `optional` **iceServers**: `RTCIceServer`[]

Defined in: webrtc/types.ts:18

ICE servers for STUN/TURN

***

### roomId

> **roomId**: `string`

Defined in: webrtc/types.ts:14

Room ID to join

***

### serverUrl

> **serverUrl**: `string`

Defined in: webrtc/types.ts:12

Signaling server URL (e.g., 'wss://example.com')

***

### token?

> `optional` **token**: `string`

Defined in: webrtc/types.ts:16

Authentication token (passed via WebSocket subprotocol)

***

### websocketPath?

> `optional` **websocketPath**: `string`

Defined in: webrtc/types.ts:20

Optional full WebSocket path override (e.g., from backend response)
