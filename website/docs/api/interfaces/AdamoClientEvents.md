# Interface: AdamoClientEvents

Defined in: [types.ts:390](https://github.com/adamo-tech/adamo-js/blob/30fc620efd2236a9998d965f14e083c25e46cc18/packages/core/src/types.ts#L390)

Event callback types

## Properties

### connectionStateChanged()

> **connectionStateChanged**: (`state`) => `void`

Defined in: [types.ts:392](https://github.com/adamo-tech/adamo-js/blob/30fc620efd2236a9998d965f14e083c25e46cc18/packages/core/src/types.ts#L392)

Called when connection state changes

#### Parameters

##### state

[`ConnectionState`](../type-aliases/ConnectionState.md)

#### Returns

`void`

***

### costmapData()

> **costmapData**: (`costmap`) => `void`

Defined in: [types.ts:412](https://github.com/adamo-tech/adamo-js/blob/30fc620efd2236a9998d965f14e083c25e46cc18/packages/core/src/types.ts#L412)

Called when costmap data is received (local rolling window)

#### Parameters

##### costmap

[`CostmapData`](CostmapData.md)

#### Returns

`void`

***

### dataChannelClose()

> **dataChannelClose**: () => `void`

Defined in: [types.ts:400](https://github.com/adamo-tech/adamo-js/blob/30fc620efd2236a9998d965f14e083c25e46cc18/packages/core/src/types.ts#L400)

Called when data channel closes

#### Returns

`void`

***

### dataChannelMessage()

> **dataChannelMessage**: (`data`) => `void`

Defined in: [types.ts:402](https://github.com/adamo-tech/adamo-js/blob/30fc620efd2236a9998d965f14e083c25e46cc18/packages/core/src/types.ts#L402)

Called when data is received on data channel

#### Parameters

##### data

`unknown`

#### Returns

`void`

***

### dataChannelOpen()

> **dataChannelOpen**: () => `void`

Defined in: [types.ts:398](https://github.com/adamo-tech/adamo-js/blob/30fc620efd2236a9998d965f14e083c25e46cc18/packages/core/src/types.ts#L398)

Called when data channel opens

#### Returns

`void`

***

### decodedFrame()

> **decodedFrame**: (`frame`) => `void`

Defined in: [types.ts:406](https://github.com/adamo-tech/adamo-js/blob/30fc620efd2236a9998d965f14e083c25e46cc18/packages/core/src/types.ts#L406)

Called when a decoded frame is ready (WebCodecs mode)

#### Parameters

##### frame

[`DecodedVideoFrame`](DecodedVideoFrame.md)

#### Returns

`void`

***

### encoderStatsUpdated()

> **encoderStatsUpdated**: (`stats`) => `void`

Defined in: [types.ts:426](https://github.com/adamo-tech/adamo-js/blob/30fc620efd2236a9998d965f14e083c25e46cc18/packages/core/src/types.ts#L426)

Called when encoder stats are received from server

#### Parameters

##### stats

[`EncoderStats`](EncoderStats.md)

#### Returns

`void`

***

### error()

> **error**: (`error`) => `void`

Defined in: [types.ts:408](https://github.com/adamo-tech/adamo-js/blob/30fc620efd2236a9998d965f14e083c25e46cc18/packages/core/src/types.ts#L408)

Called on any error

#### Parameters

##### error

`Error`

#### Returns

`void`

***

### heartbeatStateChanged()

> **heartbeatStateChanged**: (`state`) => `void`

Defined in: [types.ts:404](https://github.com/adamo-tech/adamo-js/blob/30fc620efd2236a9998d965f14e083c25e46cc18/packages/core/src/types.ts#L404)

Called when heartbeat state changes

#### Parameters

##### state

[`HeartbeatState`](../enumerations/HeartbeatState.md)

#### Returns

`void`

***

### mapData()

> **mapData**: (`map`) => `void`

Defined in: [types.ts:410](https://github.com/adamo-tech/adamo-js/blob/30fc620efd2236a9998d965f14e083c25e46cc18/packages/core/src/types.ts#L410)

Called when map data is received (static or SLAM update)

#### Parameters

##### map

[`MapData`](MapData.md)

#### Returns

`void`

***

### navPath()

> **navPath**: (`path`) => `void`

Defined in: [types.ts:416](https://github.com/adamo-tech/adamo-js/blob/30fc620efd2236a9998d965f14e083c25e46cc18/packages/core/src/types.ts#L416)

Called when navigation path is updated

#### Parameters

##### path

[`NavPath`](NavPath.md)

#### Returns

`void`

***

### networkStatsUpdated()

> **networkStatsUpdated**: (`stats`) => `void`

Defined in: [types.ts:418](https://github.com/adamo-tech/adamo-js/blob/30fc620efd2236a9998d965f14e083c25e46cc18/packages/core/src/types.ts#L418)

Called when network stats are updated

#### Parameters

##### stats

[`NetworkStats`](NetworkStats.md)

#### Returns

`void`

***

### qualityChanged()

> **qualityChanged**: (`quality`) => `void`

Defined in: [types.ts:422](https://github.com/adamo-tech/adamo-js/blob/30fc620efd2236a9998d965f14e083c25e46cc18/packages/core/src/types.ts#L422)

Called when stream quality changes

#### Parameters

##### quality

[`StreamQuality`](../enumerations/StreamQuality.md)

#### Returns

`void`

***

### robotPose()

> **robotPose**: (`pose`) => `void`

Defined in: [types.ts:414](https://github.com/adamo-tech/adamo-js/blob/30fc620efd2236a9998d965f14e083c25e46cc18/packages/core/src/types.ts#L414)

Called when robot pose is updated

#### Parameters

##### pose

[`RobotPose`](RobotPose.md)

#### Returns

`void`

***

### trackStatsUpdated()

> **trackStatsUpdated**: (`stats`) => `void`

Defined in: [types.ts:420](https://github.com/adamo-tech/adamo-js/blob/30fc620efd2236a9998d965f14e083c25e46cc18/packages/core/src/types.ts#L420)

Called when track streaming stats are updated

#### Parameters

##### stats

[`TrackStreamStats`](TrackStreamStats.md)

#### Returns

`void`

***

### velocityStateChanged()

> **velocityStateChanged**: (`state`) => `void`

Defined in: [types.ts:424](https://github.com/adamo-tech/adamo-js/blob/30fc620efd2236a9998d965f14e083c25e46cc18/packages/core/src/types.ts#L424)

Called when robot velocity state is updated

#### Parameters

##### state

[`VelocityState`](VelocityState.md)

#### Returns

`void`

***

### videoTrackEnded()

> **videoTrackEnded**: (`trackId`) => `void`

Defined in: [types.ts:396](https://github.com/adamo-tech/adamo-js/blob/30fc620efd2236a9998d965f14e083c25e46cc18/packages/core/src/types.ts#L396)

Called when video track ends

#### Parameters

##### trackId

`string`

#### Returns

`void`

***

### videoTrackReceived()

> **videoTrackReceived**: (`track`) => `void`

Defined in: [types.ts:394](https://github.com/adamo-tech/adamo-js/blob/30fc620efd2236a9998d965f14e083c25e46cc18/packages/core/src/types.ts#L394)

Called when video track is received

#### Parameters

##### track

[`VideoTrack`](VideoTrack.md)

#### Returns

`void`
