# Interface: CostmapData

Defined in: [types.ts:473](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/types.ts#L473)

Local costmap data (robot-centered rolling window)
Values: 0=free, 100-252=inflated cost, 253=inscribed, 254=lethal

## Properties

### data

> **data**: `number`[]

Defined in: [types.ts:489](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/types.ts#L489)

Cost values: 0=free, 100-252=inflated, 253=inscribed, 254=lethal

***

### height

> **height**: `number`

Defined in: [types.ts:477](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/types.ts#L477)

Costmap height in cells

***

### origin\_x

> **origin\_x**: `number`

Defined in: [types.ts:481](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/types.ts#L481)

Origin X in world coordinates (moves with robot)

***

### origin\_y

> **origin\_y**: `number`

Defined in: [types.ts:483](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/types.ts#L483)

Origin Y in world coordinates (moves with robot)

***

### resolution

> **resolution**: `number`

Defined in: [types.ts:479](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/types.ts#L479)

Resolution in meters per cell

***

### robot\_x

> **robot\_x**: `number`

Defined in: [types.ts:485](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/types.ts#L485)

Robot X position in world frame

***

### robot\_y

> **robot\_y**: `number`

Defined in: [types.ts:487](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/types.ts#L487)

Robot Y position in world frame

***

### width

> **width**: `number`

Defined in: [types.ts:475](https://github.com/adamo-tech/adamo-js/blob/57cd465b4d8c1beff7ea801e7484f54bd1514b37/packages/core/src/types.ts#L475)

Costmap width in cells
