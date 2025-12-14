# Interface: CostmapData

Defined in: [types.ts:398](https://github.com/samconsidine/adamo/blob/85f829926b615b1a958ba2ad502542bb762bf4a0/packages/core/src/types.ts#L398)

Local costmap data (robot-centered rolling window)
Values: 0=free, 100-252=inflated cost, 253=inscribed, 254=lethal

## Properties

### data

> **data**: `number`[]

Defined in: [types.ts:414](https://github.com/samconsidine/adamo/blob/85f829926b615b1a958ba2ad502542bb762bf4a0/packages/core/src/types.ts#L414)

Cost values: 0=free, 100-252=inflated, 253=inscribed, 254=lethal

***

### height

> **height**: `number`

Defined in: [types.ts:402](https://github.com/samconsidine/adamo/blob/85f829926b615b1a958ba2ad502542bb762bf4a0/packages/core/src/types.ts#L402)

Costmap height in cells

***

### origin\_x

> **origin\_x**: `number`

Defined in: [types.ts:406](https://github.com/samconsidine/adamo/blob/85f829926b615b1a958ba2ad502542bb762bf4a0/packages/core/src/types.ts#L406)

Origin X in world coordinates (moves with robot)

***

### origin\_y

> **origin\_y**: `number`

Defined in: [types.ts:408](https://github.com/samconsidine/adamo/blob/85f829926b615b1a958ba2ad502542bb762bf4a0/packages/core/src/types.ts#L408)

Origin Y in world coordinates (moves with robot)

***

### resolution

> **resolution**: `number`

Defined in: [types.ts:404](https://github.com/samconsidine/adamo/blob/85f829926b615b1a958ba2ad502542bb762bf4a0/packages/core/src/types.ts#L404)

Resolution in meters per cell

***

### robot\_x

> **robot\_x**: `number`

Defined in: [types.ts:410](https://github.com/samconsidine/adamo/blob/85f829926b615b1a958ba2ad502542bb762bf4a0/packages/core/src/types.ts#L410)

Robot X position in world frame

***

### robot\_y

> **robot\_y**: `number`

Defined in: [types.ts:412](https://github.com/samconsidine/adamo/blob/85f829926b615b1a958ba2ad502542bb762bf4a0/packages/core/src/types.ts#L412)

Robot Y position in world frame

***

### width

> **width**: `number`

Defined in: [types.ts:400](https://github.com/samconsidine/adamo/blob/85f829926b615b1a958ba2ad502542bb762bf4a0/packages/core/src/types.ts#L400)

Costmap width in cells
