# Interface: NetworkStats

Defined in: [types.ts:60](https://github.com/samconsidine/adamo/blob/ced1c9615dde5e00b0c31d8285a76b1c073d1481/packages/core/src/types.ts#L60)

Network statistics from WebRTC connection

## Properties

### availableBandwidth

> **availableBandwidth**: `number`

Defined in: [types.ts:66](https://github.com/samconsidine/adamo/blob/ced1c9615dde5e00b0c31d8285a76b1c073d1481/packages/core/src/types.ts#L66)

Available downlink bandwidth in bits per second

***

### jitter

> **jitter**: `number`

Defined in: [types.ts:68](https://github.com/samconsidine/adamo/blob/ced1c9615dde5e00b0c31d8285a76b1c073d1481/packages/core/src/types.ts#L68)

Jitter in milliseconds

***

### packetLoss

> **packetLoss**: `number`

Defined in: [types.ts:64](https://github.com/samconsidine/adamo/blob/ced1c9615dde5e00b0c31d8285a76b1c073d1481/packages/core/src/types.ts#L64)

Packet loss percentage (0-100)

***

### rtt

> **rtt**: `number`

Defined in: [types.ts:62](https://github.com/samconsidine/adamo/blob/ced1c9615dde5e00b0c31d8285a76b1c073d1481/packages/core/src/types.ts#L62)

Round-trip time in milliseconds

***

### timestamp

> **timestamp**: `number`

Defined in: [types.ts:70](https://github.com/samconsidine/adamo/blob/ced1c9615dde5e00b0c31d8285a76b1c073d1481/packages/core/src/types.ts#L70)

Timestamp of when these stats were collected
