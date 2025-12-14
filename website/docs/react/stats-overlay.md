---
sidebar_position: 6
---

# StatsOverlay

Real-time latency and status display for debugging.

## Usage

```tsx
import { StatsOverlay } from '@adamo/adamo-react';

<StatsOverlay />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right'` | `'bottom-left'` | Screen position |
| `defaultExpanded` | `boolean` | `false` | Start expanded |
| `thresholds` | `StatsOverlayThresholds` | see below | Color thresholds |

## Thresholds

```tsx
<StatsOverlay
  thresholds={{
    warning: 50,        // Yellow at 50ms
    critical: 100,      // Red at 100ms
    totalWarning: 100,  // Total latency warning
    totalCritical: 150, // Total latency critical
  }}
/>
```

## What It Shows

**Collapsed:** Total end-to-end latency

**Expanded:**
- Encode time (server)
- Network latency (RTT/2)
- Jitter buffer delay
- Decode time (client)
- Network stats (RTT, packet loss, jitter, bandwidth)
- Safety state
- Gamepad connection
- Per-track breakdown
