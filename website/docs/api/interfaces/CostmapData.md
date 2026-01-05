# Interface: CostmapData

Defined in: [types.ts:412](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L412)

Local costmap data (robot-centered rolling window)
Values: 0=free, 100-252=inflated cost, 253=inscribed, 254=lethal

## Properties

### data

> **data**: `number`[]

Defined in: [types.ts:428](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L428)

Cost values: 0=free, 100-252=inflated, 253=inscribed, 254=lethal

***

### height

> **height**: `number`

Defined in: [types.ts:416](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L416)

Costmap height in cells

***

### origin\_x

> **origin\_x**: `number`

Defined in: [types.ts:420](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L420)

Origin X in world coordinates (moves with robot)

***

### origin\_y

> **origin\_y**: `number`

Defined in: [types.ts:422](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L422)

Origin Y in world coordinates (moves with robot)

***

### resolution

> **resolution**: `number`

Defined in: [types.ts:418](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L418)

Resolution in meters per cell

***

### robot\_x

> **robot\_x**: `number`

Defined in: [types.ts:424](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L424)

Robot X position in world frame

***

### robot\_y

> **robot\_y**: `number`

Defined in: [types.ts:426](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L426)

Robot Y position in world frame

***

### width

> **width**: `number`

Defined in: [types.ts:414](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L414)

Costmap width in cells
