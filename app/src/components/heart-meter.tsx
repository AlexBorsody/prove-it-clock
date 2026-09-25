/** Heart meter: filled hearts over capacity. The instrument's read-out. */
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
          ♥
        </span>
      ))}
    </span>
  );
}
