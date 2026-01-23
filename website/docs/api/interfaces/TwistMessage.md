# Interface: TwistMessage

Defined in: [types.ts:694](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/types.ts#L694)

Twist message for velocity commands
Compatible with geometry_msgs/msg/Twist

## Example

```ts
const twist: TwistMessage = {
  linear: { x: 0.5, y: 0, z: 0 },   // Move forward at 0.5 m/s
  angular: { x: 0, y: 0, z: 0.1 },  // Rotate at 0.1 rad/s
};
await client.sendTwist(twist);
```

## Properties

### angular

> **angular**: [`Vector3`](Vector3.md)

Defined in: [types.ts:698](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/types.ts#L698)

Angular velocity in rad/s

***

### linear

> **linear**: [`Vector3`](Vector3.md)

Defined in: [types.ts:696](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/types.ts#L696)

Linear velocity in m/s
