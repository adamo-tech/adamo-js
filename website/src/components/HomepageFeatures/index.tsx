import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Low Latency Video',
    description: (
      <>
        Stream multiple camera feeds with aggressive jitter buffer optimization.
        H.264 hardware acceleration and configurable playout delay for
        sub-100ms glass-to-glass latency.
      </>
    ),
  },
  {
    title: 'Gamepad to ROS',
    description: (
      <>
        Map W3C Gamepad API inputs to <code>sensor_msgs/Joy</code> messages.
        Supports deadzone, autorepeat, sticky buttons, and multi-controller
        setups with configurable topics.
      </>
    ),
  },
  {
    title: 'Safety First',
    description: (
      <>
        Built-in heartbeat monitoring tracks window focus, latency, controller
        status, and video staleness. Automatic safety states protect your robot
        when something goes wrong.
      </>
    ),
  },
];

function Feature({title, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
