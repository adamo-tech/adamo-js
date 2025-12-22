# Class: JoypadManager

Defined in: [joypad.ts:55](https://github.com/adamo-tech/adamo-js/blob/b6d4e18acb8b3c0e8538bb9e7eed22aae66bce61/packages/core/src/joypad.ts#L55)

JoypadManager - Manages gamepad input and sends to the server

Maps W3C Gamepad API to ROS sensor_msgs/Joy format compatible with joy_node.
Supports deadzone, autorepeat, sticky buttons, and coalescing.

## Example

```ts
const joypad = new JoypadManager(client);

joypad.onInput((msg) => {
  console.log('Joy input:', msg);
});

joypad.start();
// ... later
joypad.stop();
```

## Constructors

### Constructor

> **new JoypadManager**(`client`, `config`): `JoypadManager`

Defined in: [joypad.ts:66](https://github.com/adamo-tech/adamo-js/blob/b6d4e18acb8b3c0e8538bb9e7eed22aae66bce61/packages/core/src/joypad.ts#L66)

#### Parameters

##### client

[`AdamoClient`](AdamoClient.md)

##### config

[`JoypadConfig`](../interfaces/JoypadConfig.md) = `{}`

#### Returns

`JoypadManager`

## Methods

### getGamepad()

> **getGamepad**(): `Gamepad` \| `null`

Defined in: [joypad.ts:107](https://github.com/adamo-tech/adamo-js/blob/b6d4e18acb8b3c0e8538bb9e7eed22aae66bce61/packages/core/src/joypad.ts#L107)

Get the currently connected gamepad (if any)

#### Returns

`Gamepad` \| `null`

***

### isConnected()

> **isConnected**(): `boolean`

Defined in: [joypad.ts:122](https://github.com/adamo-tech/adamo-js/blob/b6d4e18acb8b3c0e8538bb9e7eed22aae66bce61/packages/core/src/joypad.ts#L122)

Check if a gamepad is connected

#### Returns

`boolean`

***

### onInput()

> **onInput**(`callback`): () => `void`

Defined in: [joypad.ts:97](https://github.com/adamo-tech/adamo-js/blob/b6d4e18acb8b3c0e8538bb9e7eed22aae66bce61/packages/core/src/joypad.ts#L97)

Register a callback for joy input events

#### Parameters

##### callback

(`msg`) => `void`

#### Returns

> (): `void`

##### Returns

`void`

***

### start()

> **start**(): `void`

Defined in: [joypad.ts:74](https://github.com/adamo-tech/adamo-js/blob/b6d4e18acb8b3c0e8538bb9e7eed22aae66bce61/packages/core/src/joypad.ts#L74)

Start polling gamepad and sending joy messages

#### Returns

`void`

***

### stop()

> **stop**(): `void`

Defined in: [joypad.ts:83](https://github.com/adamo-tech/adamo-js/blob/b6d4e18acb8b3c0e8538bb9e7eed22aae66bce61/packages/core/src/joypad.ts#L83)

Stop polling and sending

#### Returns

`void`
