import { ReactNode, HTMLAttributes } from "react";
import { clsx } from "clsx";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: "sm" | "md" | "lg" | "none";
  shadow?: boolean;
}

export function Card({
  children,
  padding = "md",
  shadow = true,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={clsx(
        "bg-white rounded-lg border border-gray-200",
        {
          "p-2": padding === "sm",
          "p-4": padding === "md",
          "p-6": padding === "lg",
          "p-0": padding === "none",
          "shadow-md": shadow,
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

