# Interface: MapData

Defined in: [types.ts:446](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/types.ts#L446)

Map data from Nav2 map_server (OccupancyGrid)

## Properties

### data

> **data**: `number`[]

Defined in: [types.ts:458](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/types.ts#L458)

Raw occupancy grid data: -1=unknown, 0=free, 100=occupied

***

### height

> **height**: `number`

Defined in: [types.ts:450](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/types.ts#L450)

Map height in cells

***

### origin\_x

> **origin\_x**: `number`

Defined in: [types.ts:454](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/types.ts#L454)

Origin X in world coordinates (meters)

***

### origin\_y

> **origin\_y**: `number`

Defined in: [types.ts:456](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/types.ts#L456)

Origin Y in world coordinates (meters)

***

### resolution

> **resolution**: `number`

Defined in: [types.ts:452](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/types.ts#L452)

Resolution in meters per cell

***

### width

> **width**: `number`

Defined in: [types.ts:448](https://github.com/adamo-tech/adamo-js/blob/71c1822329b262f5ae59496f274e89fc5f907ee8/packages/core/src/types.ts#L448)

Map width in cells
