# Enumeration: StreamQuality

Defined in: [types.ts:46](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L46)

Quality tier for adaptive streaming
Matches server-side quality tiers from the NVENC encoder

## Enumeration Members

### AUTO

> **AUTO**: `"auto"`

Defined in: [types.ts:54](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L54)

Auto: Let server decide based on network conditions

***

### HIGH

> **HIGH**: `"high"`

Defined in: [types.ts:52](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L52)

High quality: 1920x1080 @ 3-6 Mbps

***

### LOW

> **LOW**: `"low"`

Defined in: [types.ts:48](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L48)

Low quality: 640x480 @ 0.5-1 Mbps

***

### MEDIUM

> **MEDIUM**: `"medium"`

Defined in: [types.ts:50](https://github.com/adamo-tech/adamo-js/blob/d8972d435fb7c91c1a84d66ef07259e210b24f3e/packages/core/src/types.ts#L50)

Medium quality: 1280x720 @ 1.5-2.5 Mbps
