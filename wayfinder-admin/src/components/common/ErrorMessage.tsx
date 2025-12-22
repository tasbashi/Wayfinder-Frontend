import { HTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";
import { AlertCircle, RefreshCw, X } from "lucide-react";
import { Button } from "./Button";

interface ErrorMessageProps extends HTMLAttributes<HTMLDivElement> {
  message: string;
  title?: string;
  variant?: "default" | "inline";
  onRetry?: () => void;
  onClose?: () => void;
}

export function ErrorMessage({
  message,
  title,
  variant = "default",
  onRetry,
  onClose,
  className,
  ...props
}: ErrorMessageProps) {
  if (variant === "inline") {
    return (
      <div
        className={clsx("flex items-center gap-2 text-red-600 text-sm", className)}
        {...props}
      >
        <AlertCircle className="w-4 h-4" />
        <span className="flex-1">{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="p-0.5 hover:bg-red-100 rounded transition-colors"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "bg-red-50 border border-red-200 rounded-lg p-4 relative",
        className
      )}
      {...props}
    >
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded transition-colors"
          aria-label="Dismiss error"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 pr-6">
          {title && (
            <h3 className="text-sm font-medium text-red-800 mb-1">{title}</h3>
          )}
          <p className="text-sm text-red-700">{message}</p>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="mt-3"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

