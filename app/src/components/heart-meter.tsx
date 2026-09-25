/** Heart meter: 8-bit pixel hearts, filled over capacity. */
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
  size = 22,
}: {
  filled: number;
  capacity: number;
  size?: number;
}) {
  return (
    <span
      className="hearts"
      style={{ fontSize: size }}
      role="img"
      aria-label={`${filled} of ${capacity} hearts`}
    >
      {Array.from({ length: capacity }, (_, i) => (
        <span key={i} className={i < filled ? "heart on" : "heart"}>
          <PixelHeart />
        </span>
      ))}
    </span>
  );
}
