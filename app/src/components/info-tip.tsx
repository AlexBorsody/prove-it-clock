"use client";

import { useState } from "react";
import Icon from "@/components/chrome-icons";

/**
 * InfoTip: a tap/click-to-reveal tooltip for the ⓘ icons.
 * Native `title` tooltips never fire on mobile tap, so this toggles
 * a small bubble instead. Works on hover via :focus-within too.
 */
export default function InfoTip({
  text,
  size = 14,
  align = "left",
}: {
  text: string;
  size?: number;
  /** Which edge of the icon the bubble aligns to. Use "right" when the icon sits at the right edge. */
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  return (
    <span className="info-tip">
      <button
        type="button"
        className="info-tip-btn"
        aria-label={text}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setOpen(false)}
      >
        <Icon name="info" size={size} />
      </button>
      {open && (
        <span className={`info-tip-text align-${align}`} role="tooltip">
          {text}
        </span>
      )}
    </span>
  );
}
