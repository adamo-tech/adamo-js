# Interface: MapData

Defined in: [types.ts:379](https://github.com/samconsidine/adamo/blob/85f829926b615b1a958ba2ad502542bb762bf4a0/packages/core/src/types.ts#L379)

Map data from Nav2 map_server (OccupancyGrid)

## Properties

### data

> **data**: `number`[]

Defined in: [types.ts:391](https://github.com/samconsidine/adamo/blob/85f829926b615b1a958ba2ad502542bb762bf4a0/packages/core/src/types.ts#L391)

Raw occupancy grid data: -1=unknown, 0=free, 100=occupied

***

### height

> **height**: `number`

Defined in: [types.ts:383](https://github.com/samconsidine/adamo/blob/85f829926b615b1a958ba2ad502542bb762bf4a0/packages/core/src/types.ts#L383)

Map height in cells

***

### origin\_x

> **origin\_x**: `number`

Defined in: [types.ts:387](https://github.com/samconsidine/adamo/blob/85f829926b615b1a958ba2ad502542bb762bf4a0/packages/core/src/types.ts#L387)

Origin X in world coordinates (meters)

***

### origin\_y

> **origin\_y**: `number`

Defined in: [types.ts:389](https://github.com/samconsidine/adamo/blob/85f829926b615b1a958ba2ad502542bb762bf4a0/packages/core/src/types.ts#L389)

Origin Y in world coordinates (meters)

***

### resolution

> **resolution**: `number`

Defined in: [types.ts:385](https://github.com/samconsidine/adamo/blob/85f829926b615b1a958ba2ad502542bb762bf4a0/packages/core/src/types.ts#L385)

Resolution in meters per cell

***

### width

> **width**: `number`

Defined in: [types.ts:381](https://github.com/samconsidine/adamo/blob/85f829926b615b1a958ba2ad502542bb762bf4a0/packages/core/src/types.ts#L381)

Map width in cells
