# Enumeration: HeartbeatState

Defined in: [types.ts:128](https://github.com/samconsidine/adamo/blob/12cf5b68ee340be1307cf2bbd5c8a53ceb3cee35/packages/core/src/types.ts#L128)

Heartbeat safety states matching the server-side SafetyState enum

## Enumeration Members

### CONTROLLER\_DISCONNECTED

> **CONTROLLER\_DISCONNECTED**: `3`

Defined in: [types.ts:136](https://github.com/samconsidine/adamo/blob/12cf5b68ee340be1307cf2bbd5c8a53ceb3cee35/packages/core/src/types.ts#L136)

No gamepad detected

***

### HEARTBEAT\_MISSING

> **HEARTBEAT\_MISSING**: `4`

Defined in: [types.ts:138](https://github.com/samconsidine/adamo/blob/12cf5b68ee340be1307cf2bbd5c8a53ceb3cee35/packages/core/src/types.ts#L138)

Heartbeat messages stopped (server-side only)

***

### HIGH\_LATENCY

> **HIGH\_LATENCY**: `2`

Defined in: [types.ts:134](https://github.com/samconsidine/adamo/blob/12cf5b68ee340be1307cf2bbd5c8a53ceb3cee35/packages/core/src/types.ts#L134)

Network round-trip time exceeds threshold

***

### OK

> **OK**: `0`

Defined in: [types.ts:130](https://github.com/samconsidine/adamo/blob/12cf5b68ee340be1307cf2bbd5c8a53ceb3cee35/packages/core/src/types.ts#L130)

All checks pass - system operating normally

***

### WINDOW\_UNFOCUSED

> **WINDOW\_UNFOCUSED**: `1`

Defined in: [types.ts:132](https://github.com/samconsidine/adamo/blob/12cf5b68ee340be1307cf2bbd5c8a53ceb3cee35/packages/core/src/types.ts#L132)

Browser window is not focused
