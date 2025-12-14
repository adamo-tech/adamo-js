---
sidebar_position: 3
---

# Multi-Controller Setup

Adamo supports multiple gamepads connected to the same computer, each publishing to different ROS topics.

## Use Cases

- **Driver/Passenger**: One controller for driving, another for camera/arm control
- **Training**: Instructor can take over control
- **Specialized Input**: Different controllers for different functions

## Configuration

Use the `topic` option to specify different ROS topics for each controller:

```tsx
import { GamepadController } from '@adamo-tech/react';

function DualControllerSetup() {
  return (
    <>
      {/* First controller (index 0) → joy_driver topic */}
      <GamepadController
        config={{
          deviceId: 0,
          topic: 'joy_driver',
        }}
      />

      {/* Second controller (index 1) → joy_passenger topic */}
      <GamepadController
        config={{
          deviceId: 1,
          topic: 'joy_passenger',
        }}
      />
    </>
  );
}
```

## Selecting Controller by Name

If controller indices are unreliable, select by name:

```tsx
<GamepadController
  config={{
    deviceName: 'Xbox',      // Matches any controller with "Xbox" in name
    topic: 'joy_driver',
  }}
/>

<GamepadController
  config={{
    deviceName: 'DualSense', // PlayStation 5 controller
    topic: 'joy_passenger',
  }}
/>
```

## Robot-Side Configuration

On your robot, subscribe to the different topics:

```python
# ROS 2 example
from sensor_msgs.msg import Joy

class DualJoySubscriber(Node):
    def __init__(self):
        super().__init__('dual_joy')

        # Driver controls movement
        self.driver_sub = self.create_subscription(
            Joy, 'joy_driver', self.driver_callback, 10
        )

        # Passenger controls camera
        self.passenger_sub = self.create_subscription(
            Joy, 'joy_passenger', self.passenger_callback, 10
        )

    def driver_callback(self, msg):
        # Handle driving input
        linear = msg.axes[1]  # Left stick Y
        angular = msg.axes[0]  # Left stick X
        self.drive(linear, angular)

    def passenger_callback(self, msg):
        # Handle camera input
        pan = msg.axes[2]   # Right stick X
        tilt = msg.axes[3]  # Right stick Y
        self.move_camera(pan, tilt)
```

## Independent Button Handling

Each controller can have its own button handlers:

```tsx
<GamepadController
  config={{ deviceId: 0, topic: 'joy_driver' }}
  onButtonDown={(btn) => {
    if (btn === 0) emergencyStop();  // A button = e-stop
  }}
/>

<GamepadController
  config={{ deviceId: 1, topic: 'joy_passenger' }}
  onButtonDown={(btn) => {
    if (btn === 10) switchCamera();  // RB = next camera
  }}
/>
```

## Monitoring Connection Status

```tsx
function ControllerStatus() {
  const [driver, setDriver] = useState(false);
  const [passenger, setPassenger] = useState(false);

  return (
    <>
      <GamepadController
        config={{ deviceId: 0, topic: 'joy_driver' }}
        onConnectionChange={setDriver}
      />
      <GamepadController
        config={{ deviceId: 1, topic: 'joy_passenger' }}
        onConnectionChange={setPassenger}
      />

      <div>
        Driver: {driver ? '✅' : '❌'}
        Passenger: {passenger ? '✅' : '❌'}
      </div>
    </>
  );
}
```
