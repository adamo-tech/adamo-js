# Type Alias: ConnectionState

> **ConnectionState** = `"disconnected"` \| `"connecting"` \| `"connected"` \| `"reconnecting"` \| `"failed"`

Defined in: [types.ts:45](https://github.com/adamo-tech/adamo-js/blob/c4a403ce719a192be99a38b5f4aeddb4ecba228f/packages/core/src/types.ts#L45)

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
