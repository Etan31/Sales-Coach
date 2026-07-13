import { useMemo } from "react";
import styles from "./Chart.module.css";

const WIDTH = 320;
const PADDING = 24;
const AXIS_LABEL_OFFSET = 14;
const MAX_TICK_LABELS = 6;
// Rough average glyph width at the 9px tick font (see Chart.module.css .tick), tuned
// generously wide on purpose: better to under-show labels than let them collide again.
const APPROX_CHAR_WIDTH = 5;
const TICK_LABEL_GAP = 1.15;

/** Evenly samples `maxLabels` indices across [0, count-1], always including both ends. */
function pickTickIndices(count, maxLabels) {
  if (count <= maxLabels) return new Set(Array.from({ length: count }, (_, i) => i));
  if (maxLabels <= 1) return new Set([count - 1]);
  const indices = new Set();
  for (let i = 0; i < maxLabels; i++) {
    indices.add(Math.round((i * (count - 1)) / (maxLabels - 1)));
  }
  return indices;
}

function summarize(type, data) {
  if (data.length === 0) return `${type} chart, no data`;
  const values = data.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const first = data[0]?.label;
  const last = data[data.length - 1]?.label;
  const span = first && last && first !== last ? ` from ${first} to ${last}` : "";
  const noun = type === "line" ? "Trend" : "Comparison";
  return `${noun} chart${span}, ${data.length} point${data.length === 1 ? "" : "s"}, ranging ${min} to ${max}.`;
}

/** Hand-rolled responsive SVG chart (no external lib). type: 'line' | 'bar'. data: [{label,value}]. */
function Chart({ type = "line", data = [], max, height = 160, ariaLabel }) {
  const computedMax = useMemo(() => {
    if (max) return max;
    const values = data.map((point) => point.value);
    return values.length > 0 ? Math.max(...values, 1) : 1;
  }, [data, max]);

  const innerWidth = WIDTH - PADDING * 2;
  const innerHeight = height - PADDING * 2 - AXIS_LABEL_OFFSET;

  const points = useMemo(
    () =>
      data.map((point, index) => {
        const x =
          data.length > 1
            ? PADDING + (index / (data.length - 1)) * innerWidth
            : PADDING + innerWidth / 2;
        const ratio = computedMax > 0 ? point.value / computedMax : 0;
        const y = PADDING + innerHeight - ratio * innerHeight;
        return { ...point, x, y };
      }),
    [data, computedMax, innerWidth, innerHeight],
  );

  if (data.length === 0) {
    return <p className={styles.empty}>No data yet.</p>;
  }

  const barWidth = innerWidth / data.length / 1.6;
  const axisY = PADDING + innerHeight;
  // Thin labels so they never collide, regardless of point count: cap how many labels
  // fit by their estimated pixel width against the available axis width, then evenly
  // sample that many indices (always keeping the first and last point labeled).
  const longestLabelChars = Math.max(0, ...points.map((point) => (point.label ?? "").length));
  const maxLabelsByWidth =
    longestLabelChars > 0
      ? Math.max(1, Math.floor(innerWidth / (longestLabelChars * APPROX_CHAR_WIDTH * TICK_LABEL_GAP)))
      : MAX_TICK_LABELS;
  const tickIndices = pickTickIndices(points.length, Math.min(MAX_TICK_LABELS, maxLabelsByWidth));

  return (
    <svg
      className={styles.chart}
      viewBox={`0 0 ${WIDTH} ${height}`}
      role="img"
      aria-label={ariaLabel || summarize(type, data)}
      preserveAspectRatio="xMidYMid meet"
    >
      <line x1={PADDING} y1={axisY} x2={WIDTH - PADDING} y2={axisY} className={styles.axis} />
      {type === "bar" &&
        points.map((point, index) => (
          <rect
            key={`${point.label ?? "point"}-${index}`}
            x={point.x - barWidth / 2}
            y={point.y}
            width={barWidth}
            height={Math.max(0, axisY - point.y)}
            className={styles.bar}
          />
        ))}
      {type === "line" && (
        <polyline
          className={styles.line}
          points={points.map((point) => `${point.x},${point.y}`).join(" ")}
        />
      )}
      {type === "line" &&
        points.map((point, index) => (
          <circle
            key={`${point.label ?? "point"}-${index}`}
            cx={point.x}
            cy={point.y}
            r={3}
            className={styles.dot}
          />
        ))}
      {points.map((point, index) => {
        if (!point.label || !tickIndices.has(index)) return null;
        const isLast = index === points.length - 1;
        return (
          <text
            key={`label-${point.label}-${index}`}
            x={point.x}
            y={axisY + AXIS_LABEL_OFFSET}
            textAnchor={isLast ? "end" : index === 0 ? "start" : "middle"}
            className={styles.tick}
          >
            {point.label}
          </text>
        );
      })}
    </svg>
  );
}

export default Chart;
