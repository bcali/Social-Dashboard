interface SparklineProps {
  data: (number | null)[];
  color: string;
  width?: number;
  height?: number;
}

export function Sparkline({ data, color, width = 80, height = 24 }: SparklineProps) {
  const valid = data.filter((v): v is number => v !== null && v !== undefined);
  if (valid.length < 2) return null;

  const min = Math.min(...valid);
  const max = Math.max(...valid);
  const range = max - min || 1;
  const padding = 1;
  const drawH = height - padding * 2;
  const drawW = width - padding * 2;

  const points = valid
    .map((v, i) => `${padding + (i / (valid.length - 1)) * drawW},${padding + drawH - ((v - min) / range) * drawH}`)
    .join(" ");

  return (
    <svg width={width} height={height} className="inline-block" aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {valid.length > 0 && (
        <circle
          cx={padding + drawW}
          cy={padding + drawH - ((valid[valid.length - 1] - min) / range) * drawH}
          r="2"
          fill={color}
        />
      )}
    </svg>
  );
}
