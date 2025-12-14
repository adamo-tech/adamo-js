---
sidebar_position: 2
---

# Teleoperate

Context provider that creates and manages the Adamo client instance.

## Usage

```tsx
import { Teleoperate } from '@adamo-tech/react';

function App() {
  return (
    <Teleoperate
      config={{ serverIdentity: 'robot-01' }}
      autoConnect={{ url: 'wss://your-server.com', token }}
    >
      <YourApp />
    </Teleoperate>
  );
}
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `config` | `AdamoClientConfig` | Client configuration options |
| `autoConnect` | `{ url: string; token: string }` | Auto-connect on mount |
| `children` | `ReactNode` | Child components |

## Manual Connection

```tsx
import { Teleoperate, useAdamo } from '@adamo-tech/react';

function ConnectButton() {
  const { connect, disconnect, connectionState } = useAdamo();

  if (connectionState === 'connected') {
    return <button onClick={disconnect}>Disconnect</button>;
  }

  return (
    <button onClick={() => connect('wss://server.com', token)}>
      Connect
    </button>
  );
}

function App() {
  return (
    <Teleoperate config={{ serverIdentity: 'robot-01' }}>
      <ConnectButton />
    </Teleoperate>
  );
}
```
