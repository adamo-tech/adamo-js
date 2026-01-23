# Class: JoypadManager

Defined in: [joypad.ts:84](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/joypad.ts#L84)

JoypadManager - Manages gamepad input and sends to the server

Maps W3C Gamepad API to ROS sensor_msgs/Joy format compatible with game_controller_node.
Uses the standardized button/axis mapping from ros-drivers/joystick_drivers.
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

Defined in: [joypad.ts:100](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/joypad.ts#L100)

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

Defined in: [joypad.ts:195](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/joypad.ts#L195)

Get the currently connected gamepad (if any)

#### Returns

`Gamepad` \| `null`

***

### isConnected()

> **isConnected**(): `boolean`

Defined in: [joypad.ts:210](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/joypad.ts#L210)

Check if a gamepad is connected

#### Returns

`boolean`

***

### onConnectionChange()

> **onConnectionChange**(`callback`): () => `void`

Defined in: [joypad.ts:185](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/joypad.ts#L185)

Register a callback for gamepad connection changes

#### Parameters

##### callback

(`connected`, `gamepad?`) => `void`

#### Returns

> (): `void`

##### Returns

`void`

***

### onInput()

> **onInput**(`callback`): () => `void`

Defined in: [joypad.ts:175](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/joypad.ts#L175)

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

Defined in: [joypad.ts:108](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/joypad.ts#L108)

Start polling gamepad and sending joy messages

#### Returns

`void`

***

### stop()

> **stop**(): `void`

Defined in: [joypad.ts:149](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/joypad.ts#L149)

Stop polling and sending

#### Returns

`void`
