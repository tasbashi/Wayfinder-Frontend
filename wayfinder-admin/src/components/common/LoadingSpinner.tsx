import { HTMLAttributes } from "react";
import { clsx } from "clsx";

interface LoadingSpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  text?: string;
}

export function LoadingSpinner({
  size = "md",
  text,
  className,
  ...props
}: LoadingSpinnerProps) {
  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center",
        className
      )}
      {...props}
    >
      <div
        className={clsx(
          "border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin",
          {
            "w-4 h-4": size === "sm",
            "w-8 h-8": size === "md",
            "w-12 h-12": size === "lg",
          }
        )}
      />
      {text && (
        <p className={clsx("mt-2 text-gray-600", {
          "text-sm": size === "sm",
          "text-base": size === "md",
          "text-lg": size === "lg",
        })}>
          {text}
        </p>
      )}
    </div>
  );
}

