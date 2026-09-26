/** Heart meter: 8-bit pixel hearts, filled over capacity.
 *  Earned hearts render green; the rest render empty. Every heart was
 *  earned by keeping a promise: no allowance, no free hearts. */
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
      aria-label={
        free > 0
          ? `${filled} of ${capacity} hearts (${earned} earned, ${free} allowance)`
          : `${filled} of ${capacity} hearts, ${earned} earned`
      }
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

/**
 * BrandMark: the 8-bit pixel heart on a filled green circle.
 * Header home button.
 */
export function BrandMark({ size = 36 }: { size?: number }) {
  const S = 4; // pixel size inside a 48x48 viewBox
  const OX = (48 - 7 * S) / 2;
  const OY = (48 - 6 * S) / 2;
  const rects: Array<React.ReactNode> = [];
  ROWS.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      if (row[x] === "X")
        rects.push(
          <rect
            key={`${x}-${y}`}
            x={OX + x * S}
            y={OY + y * S}
            width={S}
            height={S}
          />
        );
    }
  });
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <circle cx="24" cy="24" r="24" fill="var(--green)" />
      <g fill="#101012" style={{ shapeRendering: "crispEdges" }}>
        {rects}
      </g>
    </svg>
  );
}

/**
 * CompactHearts: a 10-slot proportional meter for tight spaces (mobile
 * cards). Never renders every empty heart; the exact count rides alongside
 * as earned/capacity text.
 */
export function CompactHearts({ earned, capacity }: { earned: number; capacity: number }) {
  const SLOTS = 10;
  const filled = capacity > 0 ? Math.round((earned / capacity) * SLOTS) : 0;
  return (
    <span className="compact-hearts" aria-hidden="true">
      {Array.from({ length: SLOTS }, (_, i) => (
        <span key={i} className={i < filled ? "ch filled" : "ch"}>
          <PixelHeart />
        </span>
      ))}
    </span>
  );
}
