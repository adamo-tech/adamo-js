# Type Alias: ConnectionState

> **ConnectionState** = `"disconnected"` \| `"connecting"` \| `"connected"` \| `"reconnecting"`

Defined in: [types.ts:36](https://github.com/samconsidine/adamo/blob/12cf5b68ee340be1307cf2bbd5c8a53ceb3cee35/packages/core/src/types.ts#L36)

Connection state for the Adamo client.

State transitions:
- `disconnected` → `connecting` (on connect call)
- `connecting` → `connected` (on successful connection)
- `connected` → `reconnecting` (on network interruption)
- `reconnecting` → `connected` (on successful reconnection)
- Any state → `disconnected` (on disconnect call or fatal error)

## Example

```ts
client.on('connectionStateChanged', (state: ConnectionState) => {
  if (state === 'connected') {
    console.log('Ready to stream!');
  }
});
```
