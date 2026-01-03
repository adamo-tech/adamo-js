# Interface: CostmapData

Defined in: [types.ts:461](https://github.com/adamo-tech/adamo-js/blob/ff9361fbed7db73ed318d428fcef5a75002ea9d3/packages/core/src/types.ts#L461)

Local costmap data (robot-centered rolling window)
Values: 0=free, 100-252=inflated cost, 253=inscribed, 254=lethal

## Properties

### data

> **data**: `number`[]

Defined in: [types.ts:477](https://github.com/adamo-tech/adamo-js/blob/ff9361fbed7db73ed318d428fcef5a75002ea9d3/packages/core/src/types.ts#L477)

Cost values: 0=free, 100-252=inflated, 253=inscribed, 254=lethal

***

### height

> **height**: `number`

Defined in: [types.ts:465](https://github.com/adamo-tech/adamo-js/blob/ff9361fbed7db73ed318d428fcef5a75002ea9d3/packages/core/src/types.ts#L465)

Costmap height in cells

***

### origin\_x

> **origin\_x**: `number`

Defined in: [types.ts:469](https://github.com/adamo-tech/adamo-js/blob/ff9361fbed7db73ed318d428fcef5a75002ea9d3/packages/core/src/types.ts#L469)

Origin X in world coordinates (moves with robot)

***

### origin\_y

> **origin\_y**: `number`

Defined in: [types.ts:471](https://github.com/adamo-tech/adamo-js/blob/ff9361fbed7db73ed318d428fcef5a75002ea9d3/packages/core/src/types.ts#L471)

Origin Y in world coordinates (moves with robot)

***

### resolution

> **resolution**: `number`

Defined in: [types.ts:467](https://github.com/adamo-tech/adamo-js/blob/ff9361fbed7db73ed318d428fcef5a75002ea9d3/packages/core/src/types.ts#L467)

Resolution in meters per cell

***

### robot\_x

> **robot\_x**: `number`

Defined in: [types.ts:473](https://github.com/adamo-tech/adamo-js/blob/ff9361fbed7db73ed318d428fcef5a75002ea9d3/packages/core/src/types.ts#L473)

Robot X position in world frame

***

### robot\_y

> **robot\_y**: `number`

Defined in: [types.ts:475](https://github.com/adamo-tech/adamo-js/blob/ff9361fbed7db73ed318d428fcef5a75002ea9d3/packages/core/src/types.ts#L475)

Robot Y position in world frame

***

### width

> **width**: `number`

Defined in: [types.ts:463](https://github.com/adamo-tech/adamo-js/blob/ff9361fbed7db73ed318d428fcef5a75002ea9d3/packages/core/src/types.ts#L463)

Costmap width in cells
