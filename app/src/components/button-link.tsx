/**
 * ButtonLink: every tappable text CTA looks like a button.
 * Filled background, rounded corners, bold text. If it's a link
 * and not a collapsible, it should be one of these.
 */
import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: ReactNode;
  variant?: "default" | "primary";
}

export default function ButtonLink({
  href,
  children,
  variant = "default",
  className,
  ...rest
}: ButtonLinkProps) {
  const cls = ["btn", variant === "primary" ? "btn-primary" : null, className]
    .filter(Boolean)
    .join(" ");
  return (
    <Link href={href} className={cls} {...rest}>
      {children}
    </Link>
  );
}
