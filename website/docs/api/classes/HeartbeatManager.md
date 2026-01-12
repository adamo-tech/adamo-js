# Class: HeartbeatManager

Defined in: [heartbeat.ts:30](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/heartbeat.ts#L30)

HeartbeatManager - Manages heartbeat monitoring and sending to the server

Automatically monitors client health including:
- Gamepad connection status
- Window focus state

## Example

```ts
const heartbeat = new HeartbeatManager(client);

heartbeat.onStateChange((state) => {
  console.log('Heartbeat state:', HeartbeatState[state]);
});

heartbeat.start();
// ... later
heartbeat.stop();
```

## Constructors

### Constructor

> **new HeartbeatManager**(`client`, `config`): `HeartbeatManager`

Defined in: [heartbeat.ts:37](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/heartbeat.ts#L37)

#### Parameters

##### client

[`AdamoClient`](AdamoClient.md)

##### config

[`HeartbeatConfig`](../interfaces/HeartbeatConfig.md) = `{}`

#### Returns

`HeartbeatManager`

## Accessors

### state

#### Get Signature

> **get** **state**(): [`HeartbeatState`](../enumerations/HeartbeatState.md)

Defined in: [heartbeat.ts:45](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/heartbeat.ts#L45)

Get the current heartbeat state

##### Returns

[`HeartbeatState`](../enumerations/HeartbeatState.md)

## Methods

### onStateChange()

> **onStateChange**(`callback`): () => `void`

Defined in: [heartbeat.ts:77](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/heartbeat.ts#L77)

Register a callback for state changes

#### Parameters

##### callback

(`state`) => `void`

#### Returns

> (): `void`

##### Returns

`void`

***

### start()

> **start**(): `void`

Defined in: [heartbeat.ts:52](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/heartbeat.ts#L52)

Start sending heartbeats

#### Returns

`void`

***

### stop()

> **stop**(): `void`

Defined in: [heartbeat.ts:67](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/heartbeat.ts#L67)

Stop sending heartbeats

#### Returns

`void`
