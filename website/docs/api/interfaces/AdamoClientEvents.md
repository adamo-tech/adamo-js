# Interface: AdamoClientEvents

Defined in: [types.ts:340](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L340)

Event callback types

## Properties

### connectionStateChanged()

> **connectionStateChanged**: (`state`) => `void`

Defined in: [types.ts:342](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L342)

Called when connection state changes

#### Parameters

##### state

[`ConnectionState`](../type-aliases/ConnectionState.md)

#### Returns

`void`

***

### costmapData()

> **costmapData**: (`costmap`) => `void`

Defined in: [types.ts:358](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L358)

Called when costmap data is received (local rolling window)

#### Parameters

##### costmap

[`CostmapData`](CostmapData.md)

#### Returns

`void`

***

### encoderStatsUpdated()

> **encoderStatsUpdated**: (`stats`) => `void`

Defined in: [types.ts:372](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L372)

Called when encoder stats are received from server

#### Parameters

##### stats

[`EncoderStats`](EncoderStats.md)

#### Returns

`void`

***

### error()

> **error**: (`error`) => `void`

Defined in: [types.ts:354](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L354)

Called on any error

#### Parameters

##### error

`Error`

#### Returns

`void`

***

### heartbeatStateChanged()

> **heartbeatStateChanged**: (`state`) => `void`

Defined in: [types.ts:352](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L352)

Called when heartbeat state changes

#### Parameters

##### state

[`HeartbeatState`](../enumerations/HeartbeatState.md)

#### Returns

`void`

***

### mapData()

> **mapData**: (`map`) => `void`

Defined in: [types.ts:356](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L356)

Called when map data is received (static or SLAM update)

#### Parameters

##### map

[`MapData`](MapData.md)

#### Returns

`void`

***

### navPath()

> **navPath**: (`path`) => `void`

Defined in: [types.ts:362](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L362)

Called when navigation path is updated

#### Parameters

##### path

[`NavPath`](NavPath.md)

#### Returns

`void`

***

### networkStatsUpdated()

> **networkStatsUpdated**: (`stats`) => `void`

Defined in: [types.ts:364](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L364)

Called when network stats are updated

#### Parameters

##### stats

[`NetworkStats`](NetworkStats.md)

#### Returns

`void`

***

### qualityChanged()

> **qualityChanged**: (`quality`, `trackName?`) => `void`

Defined in: [types.ts:368](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L368)

Called when stream quality changes

#### Parameters

##### quality

[`StreamQuality`](../enumerations/StreamQuality.md)

##### trackName?

`string`

#### Returns

`void`

***

### robotPose()

> **robotPose**: (`pose`) => `void`

Defined in: [types.ts:360](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L360)

Called when robot pose is updated

#### Parameters

##### pose

[`RobotPose`](RobotPose.md)

#### Returns

`void`

***

### topicData()

> **topicData**: (`payload`) => `void`

Defined in: [types.ts:374](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L374)

Called when any JSON data is received on a topic (generic handler)

#### Parameters

##### payload

[`TopicDataPayload`](TopicDataPayload.md)

#### Returns

`void`

***

### trackAvailable()

> **trackAvailable**: (`track`) => `void`

Defined in: [types.ts:344](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L344)

Called when a new video track is available

#### Parameters

##### track

[`VideoTrack`](VideoTrack.md)

#### Returns

`void`

***

### trackRemoved()

> **trackRemoved**: (`trackName`) => `void`

Defined in: [types.ts:346](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L346)

Called when a track is removed

#### Parameters

##### trackName

`string`

#### Returns

`void`

***

### trackStatsUpdated()

> **trackStatsUpdated**: (`stats`) => `void`

Defined in: [types.ts:366](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L366)

Called when track streaming stats are updated

#### Parameters

##### stats

[`TrackStreamStats`](TrackStreamStats.md)

#### Returns

`void`

***

### trackSubscribed()

> **trackSubscribed**: (`track`) => `void`

Defined in: [types.ts:348](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L348)

Called when a track's subscription state changes

#### Parameters

##### track

[`VideoTrack`](VideoTrack.md)

#### Returns

`void`

***

### trackUnsubscribed()

> **trackUnsubscribed**: (`trackName`) => `void`

Defined in: [types.ts:350](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L350)

Called when a track is unsubscribed

#### Parameters

##### trackName

`string`

#### Returns

`void`

***

### velocityStateChanged()

> **velocityStateChanged**: (`state`) => `void`

Defined in: [types.ts:370](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L370)

Called when robot velocity state is updated

#### Parameters

##### state

[`VelocityState`](VelocityState.md)

#### Returns

`void`
