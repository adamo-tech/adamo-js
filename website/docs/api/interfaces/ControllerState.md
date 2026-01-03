# Interface: ControllerState

Defined in: [types.ts:162](https://github.com/adamo-tech/adamo-js/blob/ff9361fbed7db73ed318d428fcef5a75002ea9d3/packages/core/src/types.ts#L162)

Controller state for a single controller

## Properties

### axes

> **axes**: `number`[]

Defined in: [types.ts:164](https://github.com/adamo-tech/adamo-js/blob/ff9361fbed7db73ed318d428fcef5a75002ea9d3/packages/core/src/types.ts#L164)

Analog axes values (-1 to 1)

***

### buttons

> **buttons**: `number`[]

Defined in: [types.ts:166](https://github.com/adamo-tech/adamo-js/blob/ff9361fbed7db73ed318d428fcef5a75002ea9d3/packages/core/src/types.ts#L166)

Button states (0 or 1)

***

### handedness?

> `optional` **handedness**: `"left"` \| `"right"`

Defined in: [types.ts:172](https://github.com/adamo-tech/adamo-js/blob/ff9361fbed7db73ed318d428fcef5a75002ea9d3/packages/core/src/types.ts#L172)

Controller handedness (optional)

***

### position?

> `optional` **position**: \[`number`, `number`, `number`\]

Defined in: [types.ts:168](https://github.com/adamo-tech/adamo-js/blob/ff9361fbed7db73ed318d428fcef5a75002ea9d3/packages/core/src/types.ts#L168)

XR controller position [x, y, z] (optional)

***

### quaternion?

> `optional` **quaternion**: \[`number`, `number`, `number`, `number`\]

Defined in: [types.ts:170](https://github.com/adamo-tech/adamo-js/blob/ff9361fbed7db73ed318d428fcef5a75002ea9d3/packages/core/src/types.ts#L170)

XR controller quaternion [w, x, y, z] (optional)
