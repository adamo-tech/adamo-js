---
sidebar_position: 5
---

# MultiModeLayout

Configurable camera grid with gamepad-driven mode switching.

## Usage

```tsx
import { MultiModeLayout, type LayoutMode } from '@adamo-tech/react';

const MODES: LayoutMode[] = [
  {
    name: 'travel',
    label: 'Travel',
    grid: [
      ['left', 'front', 'right'],
      [null, 'rear', null],
    ],
  },
  {
    name: 'dock',
    label: 'Docking',
    grid: [
      ['rear', 'rear', 'rear'],
      ['left', 'front', 'right'],
    ],
  },
];

<MultiModeLayout modes={MODES} />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modes` | `LayoutMode[]` | required | Available layout modes |
| `initialMode` | `number` | `0` | Starting mode index |
| `modeButtons` | `{ prev, next }` | `{ prev: 9, next: 10 }` | LB/RB button indices |
| `canSwitchMode` | `() => boolean` | - | Guard function |
| `onModeBlocked` | `() => void` | - | Called when switch blocked |
| `onModeChange` | `(mode, index) => void` | - | Called on mode change |
| `renderCell` | `(topic, mode, row, col) => ReactNode` | - | Custom cell renderer |
| `gap` | `number` | `8` | Gap between cells (px) |
| `showModeBar` | `boolean` | `true` | Show mode tabs at bottom |
| `showHint` | `boolean` | `true` | Show LB/RB hint |
| `blockedWarning` | `string` | `'Cannot switch modes'` | Warning message |

## Safety Interlock

Block mode switching while robot is moving:

```tsx
import { useVelocity } from '@adamo-tech/react';

function Layout() {
  const { isMoving } = useVelocity();

  return (
    <MultiModeLayout
      modes={MODES}
      canSwitchMode={() => !isMoving}
      blockedWarning="Cannot switch modes while moving"
    />
  );
}
```

## Custom Cell Rendering

```tsx
<MultiModeLayout
  modes={MODES}
  renderCell={(topic, mode, row, col) => {
    if (topic === null) {
      return <div className="placeholder">--</div>;
    }
    return (
      <>
        <VideoFeed topic={topic} />
        <div className="label">{topic}</div>
      </>
    );
  }}
/>
```
