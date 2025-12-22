# Enumeration: HeartbeatState

Defined in: [types.ts:142](https://github.com/adamo-tech/adamo-js/blob/b375ddc8180651bb03b2378e0404c9955fd57e67/packages/core/src/types.ts#L142)

Heartbeat safety states matching the server-side SafetyState enum

## Enumeration Members

### CONTROLLER\_DISCONNECTED

> **CONTROLLER\_DISCONNECTED**: `3`

Defined in: [types.ts:150](https://github.com/adamo-tech/adamo-js/blob/b375ddc8180651bb03b2378e0404c9955fd57e67/packages/core/src/types.ts#L150)

No gamepad detected

***

### HEARTBEAT\_MISSING

> **HEARTBEAT\_MISSING**: `4`

Defined in: [types.ts:152](https://github.com/adamo-tech/adamo-js/blob/b375ddc8180651bb03b2378e0404c9955fd57e67/packages/core/src/types.ts#L152)

Heartbeat messages stopped (server-side only)

***

### HIGH\_LATENCY

> **HIGH\_LATENCY**: `2`

Defined in: [types.ts:148](https://github.com/adamo-tech/adamo-js/blob/b375ddc8180651bb03b2378e0404c9955fd57e67/packages/core/src/types.ts#L148)

Network round-trip time exceeds threshold

***

### OK

> **OK**: `0`

Defined in: [types.ts:144](https://github.com/adamo-tech/adamo-js/blob/b375ddc8180651bb03b2378e0404c9955fd57e67/packages/core/src/types.ts#L144)

All checks pass - system operating normally

***

### WINDOW\_UNFOCUSED

> **WINDOW\_UNFOCUSED**: `1`

Defined in: [types.ts:146](https://github.com/adamo-tech/adamo-js/blob/b375ddc8180651bb03b2378e0404c9955fd57e67/packages/core/src/types.ts#L146)

Browser window is not focused
