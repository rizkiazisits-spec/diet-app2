export default function CalorieRing({ consumed, target, size = 160 }) {
  const pct = Math.min((consumed / (target || 1)) * 100, 100);
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const center = size / 2;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="drop-shadow-lg" style={{ filter: 'drop-shadow(0 0 12px rgba(14,165,233,0.3))' }}>
        {/* Track */}
        <circle
          cx={center} cy={center} r={r}
          fill="none"
          stroke="var(--color-outline-variant)"
          strokeWidth="10"
          opacity="0.3"
        />
        {/* Progress */}
        <circle
          cx={center} cy={center} r={r}
          fill="none"
          stroke="var(--color-primary-container)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${center} ${center})`}
          style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
        />
        {/* Center text */}
        <text x={center} y={center - 8} textAnchor="middle" fill="var(--color-on-surface)" fontSize="28" fontWeight="800" fontFamily="var(--font-sans)">
          {Math.round(consumed)}
        </text>
        <text x={center} y={center + 16} textAnchor="middle" fill="var(--color-outline)" fontSize="12" fontWeight="600" fontFamily="var(--font-sans)">
          / {target} kkal
        </text>
      </svg>
    </div>
  );
}
