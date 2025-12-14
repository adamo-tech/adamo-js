---
sidebar_position: 3
---

# VideoFeed

Displays a video stream from a camera topic.

## Usage

```tsx
import { VideoFeed } from '@adamo-tech/react';

<VideoFeed topic="front_camera" />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `topic` | `string` | required | Camera topic name |
| `style` | `CSSProperties` | - | Container styles |
| `className` | `string` | - | CSS class name |
| `mirror` | `boolean` | `false` | Flip video horizontally |
| `onPlay` | `() => void` | - | Called when video starts |
| `onResize` | `(width, height) => void` | - | Called on resolution change |

## Styling

```tsx
<VideoFeed
  topic="front"
  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
/>
```

## Grid Layout

```tsx
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
  <VideoFeed topic="left" />
  <VideoFeed topic="front" />
  <VideoFeed topic="right" />
  <VideoFeed topic="rear" />
</div>
```
