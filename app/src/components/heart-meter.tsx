import { useId } from "react";

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

function PixelHeart({ genesis = false }: { genesis?: boolean }) {
  const patternId = useId();
  const rects: Array<React.ReactNode> = [];
  ROWS.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      if (row[x] === "X") rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} style={genesis ? { fill: `url(#${patternId})` } : undefined} />);
    }
  });
  return (
    <svg viewBox="0 0 7 6" className="px-heart" aria-hidden="true">
      {genesis && <defs>
        <radialGradient id={patternId} gradientUnits="userSpaceOnUse" cx="2" cy="2" r="6" gradientTransform="rotate(25 2 2) scale(1 .8)">
          <stop offset="0" stopColor="#fef08a" />
          <stop offset=".18" stopColor="#fb923c" />
          <stop offset=".32" stopColor="#f472b6" />
          <stop offset=".46" stopColor="#c084fc" />
          <stop offset=".6" stopColor="#38bdf8" />
          <stop offset=".74" stopColor="#4ade80" />
          <stop offset=".87" stopColor="#fde047" />
          <stop offset="1" stopColor="#f472b6" />
        </radialGradient>
      </defs>}
      {rects}
    </svg>
  );
}

export default function HeartMeter({
  filled,
  capacity,
  size = 22,
  genesis = false,
  color,
}: {
  filled: number;
  capacity: number;
  size?: number;
  genesis?: boolean;
  /** Optional categorical hue; empty hearts keep their neutral treatment. */
  color?: string;
}) {
  const earned = Math.max(0, Math.min(filled, capacity));
  return (
    <span
      className="hearts"
      style={{ fontSize: size }}
      role="img"
      aria-label={`${earned} of ${capacity} promises kept`}
    >
      {Array.from({ length: capacity }, (_, i) => {
        return (
          <span key={i} className={i < earned ? "heart on" : "heart"} style={i < earned && color ? { color } : undefined}>
            <PixelHeart genesis={genesis && i < earned} />
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
