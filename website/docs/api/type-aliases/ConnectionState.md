# Type Alias: ConnectionState

> **ConnectionState** = `"disconnected"` \| `"connecting"` \| `"connected"` \| `"reconnecting"` \| `"failed"`

Defined in: [types.ts:45](https://github.com/adamo-tech/adamo-js/blob/03ecf08079e3bcaaf4e4ba8556a675a38aa12768/packages/core/src/types.ts#L45)

Connection state for the Adamo client.

State transitions:
- `disconnected` → `connecting` (on connect call)
- `connecting` → `connected` (on successful connection)
- `connected` → `reconnecting` (on network interruption)
- `reconnecting` → `connected` (on successful reconnection)
- Any state → `disconnected` (on disconnect call or fatal error)
- Any state → `failed` (on unrecoverable error)

## Example

```ts
client.on('connectionStateChanged', (state: ConnectionState) => {
  if (state === 'connected') {
    console.log('Ready to stream!');
  }
});
```
