# Enumeration: StreamQuality

Defined in: [types.ts:46](https://github.com/samconsidine/adamo/blob/ced1c9615dde5e00b0c31d8285a76b1c073d1481/packages/core/src/types.ts#L46)

Quality tier for adaptive streaming
Matches server-side quality tiers from the NVENC encoder

## Enumeration Members

### AUTO

> **AUTO**: `"auto"`

Defined in: [types.ts:54](https://github.com/samconsidine/adamo/blob/ced1c9615dde5e00b0c31d8285a76b1c073d1481/packages/core/src/types.ts#L54)

Auto: Let server decide based on network conditions

***

### HIGH

> **HIGH**: `"high"`

Defined in: [types.ts:52](https://github.com/samconsidine/adamo/blob/ced1c9615dde5e00b0c31d8285a76b1c073d1481/packages/core/src/types.ts#L52)

High quality: 1920x1080 @ 3-6 Mbps

***

### LOW

> **LOW**: `"low"`

Defined in: [types.ts:48](https://github.com/samconsidine/adamo/blob/ced1c9615dde5e00b0c31d8285a76b1c073d1481/packages/core/src/types.ts#L48)

Low quality: 640x480 @ 0.5-1 Mbps

***

### MEDIUM

> **MEDIUM**: `"medium"`

Defined in: [types.ts:50](https://github.com/samconsidine/adamo/blob/ced1c9615dde5e00b0c31d8285a76b1c073d1481/packages/core/src/types.ts#L50)

Medium quality: 1280x720 @ 1.5-2.5 Mbps
