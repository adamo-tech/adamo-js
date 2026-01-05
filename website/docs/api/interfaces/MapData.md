# Interface: MapData

Defined in: [types.ts:393](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L393)

Map data from Nav2 map_server (OccupancyGrid)

## Properties

### data

> **data**: `number`[]

Defined in: [types.ts:405](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L405)

Raw occupancy grid data: -1=unknown, 0=free, 100=occupied

***

### height

> **height**: `number`

Defined in: [types.ts:397](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L397)

Map height in cells

***

### origin\_x

> **origin\_x**: `number`

Defined in: [types.ts:401](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L401)

Origin X in world coordinates (meters)

***

### origin\_y

> **origin\_y**: `number`

Defined in: [types.ts:403](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L403)

Origin Y in world coordinates (meters)

***

### resolution

> **resolution**: `number`

Defined in: [types.ts:399](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L399)

Resolution in meters per cell

***

### width

> **width**: `number`

Defined in: [types.ts:395](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L395)

Map width in cells
