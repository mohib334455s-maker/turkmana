export function Sparkline({
  points,
  color = '#14b8a6',
  className,
  fill = true,
}: {
  points: number[];
  color?: string;
  className?: string;
  fill?: boolean;
}) {
  const w = 140;
  const h = 44;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const coords = points.map((v, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - ((v - min) / span) * (h - 8) - 4;
    return { x, y };
  });
  const line = coords.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const area = `${line} L${w} ${h} L0 ${h} Z`;
  const id = color.replace('#', 's');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width="100%" height={h} aria-hidden preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill ? <path d={area} fill={`url(#${id})`} /> : null}
      <path d={line} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
