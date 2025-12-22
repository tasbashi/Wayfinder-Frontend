"use client";

import { useState } from "react";
import { Trash2, Download, Edit, X } from "lucide-react";
import { Button } from "./Button";
import { Card } from "./Card";
import { clsx } from "clsx";

export interface BulkAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: "primary" | "danger" | "outline";
  onClick: (selectedIds: string[]) => void | Promise<void>;
}

interface BulkActionsProps {
  selectedIds: string[];
  actions: BulkAction[];
  onClearSelection: () => void;
  className?: string;
}

export function BulkActions({
  selectedIds,
  actions,
  onClearSelection,
  className,
}: BulkActionsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (selectedIds.length === 0) {
    return null;
  }

  return (
    <Card
      className={clsx(
        "fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 shadow-2xl border-2 border-blue-500",
        className
      )}
    >
      <div className="flex items-center gap-4 p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-sm font-semibold text-blue-600">
              {selectedIds.length}
            </span>
          </div>
          <span className="text-sm font-medium text-gray-900">
            {selectedIds.length} item{selectedIds.length !== 1 ? "s" : ""}{" "}
            selected
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!isExpanded ? (
            <>
              {actions.slice(0, 2).map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.id}
                    variant={action.variant || "outline"}
                    size="sm"
                    onClick={() => action.onClick(selectedIds)}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {action.label}
                  </Button>
                );
              })}
              {actions.length > 2 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsExpanded(true)}
                >
                  More ({actions.length - 2})
                </Button>
              )}
            </>
          ) : (
            <div className="flex flex-wrap gap-2">
              {actions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.id}
                    variant={action.variant || "outline"}
                    size="sm"
                    onClick={() => action.onClick(selectedIds)}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {action.label}
                  </Button>
                );
              })}
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onClearSelection}
            className="ml-2"
          >
            <X className="w-4 h-4" />
            Clear
          </Button>
        </div>
      </div>
    </Card>
  );
}

