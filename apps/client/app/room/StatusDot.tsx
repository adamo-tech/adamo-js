type Tone = 'success' | 'warning' | 'danger' | 'neutral';
type Size = 'sm' | 'md';

const TONE_BG: Record<Tone, string> = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  neutral: 'bg-white/20',
};

const SIZE_PX: Record<Size, string> = {
  sm: 'h-1.5 w-1.5',
  md: 'h-2 w-2',
};

type StatusDotProps = {
  tone: Tone;
  /** If true, adds an animated ping halo around the dot */
  pulse?: boolean;
  size?: Size;
};

/**
 * StatusDot — colored dot with optional animated ping halo.
 * Used for online/offline indicators, connection state, safety state, etc.
 */
export function StatusDot({ tone, pulse = false, size = 'sm' }: StatusDotProps) {
  const bg = TONE_BG[tone];
  const sizeCls = SIZE_PX[size];
  return (
    <span className={`relative flex ${sizeCls}`}>
      {pulse && tone !== 'neutral' && (
        <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${bg} opacity-60`} />
      )}
      <span className={`relative inline-flex ${sizeCls} rounded-full ${bg}`} />
    </span>
  );
}
