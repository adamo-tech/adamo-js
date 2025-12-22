# Interface: MapData

Defined in: [types.ts:436](https://github.com/adamo-tech/adamo-js/blob/03ecf08079e3bcaaf4e4ba8556a675a38aa12768/packages/core/src/types.ts#L436)

Map data from Nav2 map_server (OccupancyGrid)

## Properties

### data

> **data**: `number`[]

Defined in: [types.ts:448](https://github.com/adamo-tech/adamo-js/blob/03ecf08079e3bcaaf4e4ba8556a675a38aa12768/packages/core/src/types.ts#L448)

Raw occupancy grid data: -1=unknown, 0=free, 100=occupied

***

### height

> **height**: `number`

Defined in: [types.ts:440](https://github.com/adamo-tech/adamo-js/blob/03ecf08079e3bcaaf4e4ba8556a675a38aa12768/packages/core/src/types.ts#L440)

Map height in cells

***

### origin\_x

> **origin\_x**: `number`

Defined in: [types.ts:444](https://github.com/adamo-tech/adamo-js/blob/03ecf08079e3bcaaf4e4ba8556a675a38aa12768/packages/core/src/types.ts#L444)

Origin X in world coordinates (meters)

***

### origin\_y

> **origin\_y**: `number`

Defined in: [types.ts:446](https://github.com/adamo-tech/adamo-js/blob/03ecf08079e3bcaaf4e4ba8556a675a38aa12768/packages/core/src/types.ts#L446)

Origin Y in world coordinates (meters)

***

### resolution

> **resolution**: `number`

Defined in: [types.ts:442](https://github.com/adamo-tech/adamo-js/blob/03ecf08079e3bcaaf4e4ba8556a675a38aa12768/packages/core/src/types.ts#L442)

Resolution in meters per cell

***

### width

> **width**: `number`

Defined in: [types.ts:438](https://github.com/adamo-tech/adamo-js/blob/03ecf08079e3bcaaf4e4ba8556a675a38aa12768/packages/core/src/types.ts#L438)

Map width in cells
