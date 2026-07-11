import { useMemo } from 'react';
import styles from './Chart.module.css';

const WIDTH = 320;
const PADDING = 24;

/** Hand-rolled responsive SVG chart (no external lib). type: 'line' | 'bar'. data: [{label,value}]. */
function Chart({ type = 'line', data = [], max, height = 160 }) {
  const computedMax = useMemo(() => {
    if (max) return max;
    const values = data.map((point) => point.value);
    return values.length > 0 ? Math.max(...values, 1) : 1;
  }, [data, max]);

  const innerWidth = WIDTH - PADDING * 2;
  const innerHeight = height - PADDING * 2;

  const points = useMemo(
    () =>
      data.map((point, index) => {
        const x = data.length > 1 ? PADDING + (index / (data.length - 1)) * innerWidth : PADDING + innerWidth / 2;
        const ratio = computedMax > 0 ? point.value / computedMax : 0;
        const y = PADDING + innerHeight - ratio * innerHeight;
        return { ...point, x, y };
      }),
    [data, computedMax, innerWidth, innerHeight]
  );

  if (data.length === 0) {
    return <p className={styles.empty}>No data yet.</p>;
  }

  const barWidth = innerWidth / data.length / 1.6;

  return (
    <svg
      className={styles.chart}
      viewBox={`0 0 ${WIDTH} ${height}`}
      role="img"
      aria-label={`${type} chart`}
      preserveAspectRatio="xMidYMid meet"
    >
      <line x1={PADDING} y1={PADDING + innerHeight} x2={WIDTH - PADDING} y2={PADDING + innerHeight} className={styles.axis} />
      {type === 'bar' &&
        points.map((point) => (
          <rect
            key={point.label}
            x={point.x - barWidth / 2}
            y={point.y}
            width={barWidth}
            height={Math.max(0, PADDING + innerHeight - point.y)}
            className={styles.bar}
          />
        ))}
      {type === 'line' && (
        <polyline className={styles.line} points={points.map((point) => `${point.x},${point.y}`).join(' ')} />
      )}
      {type === 'line' && points.map((point) => <circle key={point.label} cx={point.x} cy={point.y} r={3} className={styles.dot} />)}
    </svg>
  );
}

export default Chart;
