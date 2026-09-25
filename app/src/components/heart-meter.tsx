/** Heart meter: 8-bit pixel hearts, filled over capacity.
 *  Earned hearts render green; allowance ("free") hearts render muted grey;
 *  the rest render empty. Earned hearts come first, then allowance. */
const ROWS = [
  ".XX.XX.",
  "XXXXXXX",
  "XXXXXXX",
  ".XXXXX.",
  "..XXX..",
  "...X...",
];

function PixelHeart() {
  const rects: Array<React.ReactNode> = [];
  ROWS.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      if (row[x] === "X") rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} />);
    }
  });
  return (
    <svg viewBox="0 0 7 6" className="px-heart" aria-hidden="true">
      {rects}
    </svg>
  );
}

export default function HeartMeter({
  filled,
  capacity,
  allowance = 0,
  size = 22,
}: {
  filled: number;
  capacity: number;
  allowance?: number;
  size?: number;
}) {
  const free = Math.max(0, Math.min(allowance, filled));
  const earned = filled - free;
  return (
    <span
      className="hearts"
      style={{ fontSize: size }}
      role="img"
      aria-label={`${filled} of ${capacity} hearts (${earned} earned, ${free} allowance)`}
    >
      {Array.from({ length: capacity }, (_, i) => {
        const isAllowance = i >= earned && i < filled;
        return (
          <span
            key={i}
            className={i < earned ? "heart on" : isAllowance ? "heart allowance" : "heart"}
            style={isAllowance ? { color: "var(--text-dim)" } : undefined}
          >
            <PixelHeart />
          </span>
        );
      })}
    </span>
  );
}
