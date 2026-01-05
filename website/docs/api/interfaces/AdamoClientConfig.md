# Interface: AdamoClientConfig

Defined in: [types.ts:153](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L153)

Configuration options for the Adamo client.

## Example

```ts
const client = new AdamoClient({
  serverIdentity: 'forklift-01',
  videoCodec: 'h264',
  playoutDelay: -0.1, // Minimum buffering for low latency
});
```

## Properties

### adaptiveStream?

> `optional` **adaptiveStream**: `boolean`

Defined in: [types.ts:165](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L165)

Enable adaptive streaming for automatic quality adjustment based on network conditions.

#### Default

```ts
true
```

***

### dynacast?

> `optional` **dynacast**: `boolean`

Defined in: [types.ts:172](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L172)

Enable dynacast to only send video when someone is subscribed.
Improves efficiency in multi-participant scenarios.

#### Default

```ts
true
```

***

### playoutDelay?

> `optional` **playoutDelay**: `number`

Defined in: [types.ts:192](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L192)

Playout delay in seconds for video tracks.
Controls the jitter buffer size:
- `0`: Default browser behavior
- Negative (e.g., `-0.1`): Request minimum buffering for lowest latency
- Positive: Add extra buffer for smoother playback

#### Default

```ts
-0.1
```

***

### serverIdentity?

> `optional` **serverIdentity**: `string`

Defined in: [types.ts:159](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L159)

Server participant identity to communicate with.
This should match the identity of the robot's LiveKit participant.

#### Default

```ts
'python-bot'
```

***

### videoCodec?

> `optional` **videoCodec**: `"h264"` \| `"vp8"` \| `"vp9"` \| `"av1"`

Defined in: [types.ts:182](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L182)

Video codec preference for encoding/decoding.
- `h264`: Best compatibility, hardware acceleration common
- `vp8`: Open codec, good quality
- `vp9`: Better compression than VP8
- `av1`: Best compression, but higher CPU usage

#### Default

```ts
'h264'
```
