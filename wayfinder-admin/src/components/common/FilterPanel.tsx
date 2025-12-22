"use client";

import { useState } from "react";
import { X, Filter, Save } from "lucide-react";
import { Button } from "./Button";
import { Card } from "./Card";
import { Input } from "./Input";
import { clsx } from "clsx";

export interface FilterPreset {
  id: string;
  name: string;
  filters: Record<string, any>;
}

export interface FilterOption {
  key: string;
  label: string;
  type: "text" | "select" | "date" | "number";
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface FilterPanelProps {
  filters: FilterOption[];
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
  onReset: () => void;
  presets?: FilterPreset[];
  onSavePreset?: (name: string, filters: Record<string, any>) => void;
  className?: string;
}

export function FilterPanel({
  filters,
  values,
  onChange,
  onReset,
  presets = [],
  onSavePreset,
  className,
}: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [showSavePreset, setShowSavePreset] = useState(false);

  const hasActiveFilters = Object.values(values).some(
    (value) => value !== "" && value !== null && value !== undefined
  );

  function handleFilterChange(key: string, value: any) {
    onChange({
      ...values,
      [key]: value,
    });
  }

  function handleLoadPreset(preset: FilterPreset) {
    onChange(preset.filters);
  }

  function handleSavePreset() {
    if (presetName.trim() && onSavePreset) {
      onSavePreset(presetName.trim(), values);
      setPresetName("");
      setShowSavePreset(false);
    }
  }

  return (
    <div className={clsx("relative", className)}>
      {/* Filter Toggle Button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "relative",
          hasActiveFilters && "bg-blue-50 border-blue-300"
        )}
      >
        <Filter className="w-4 h-4 mr-2" />
        Filters
        {hasActiveFilters && (
          <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
            {Object.values(values).filter(
              (v) => v !== "" && v !== null && v !== undefined
            ).length}
          </span>
        )}
      </Button>

      {/* Filter Panel */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <Card className="absolute top-full right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] z-50 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Presets */}
            {presets.length > 0 && (
              <div className="mb-4 pb-4 border-b border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Saved Presets
                </label>
                <div className="space-y-2">
                  {presets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleLoadPreset(preset)}
                      className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Filter Inputs */}
            <div className="space-y-4 mb-4">
              {filters.map((filter) => (
                <div key={filter.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {filter.label}
                  </label>
                  {filter.type === "text" && (
                    <Input
                      placeholder={filter.placeholder}
                      value={values[filter.key] || ""}
                      onChange={(e) =>
                        handleFilterChange(filter.key, e.target.value)
                      }
                    />
                  )}
                  {filter.type === "select" && (
                    <select
                      value={values[filter.key] || ""}
                      onChange={(e) =>
                        handleFilterChange(filter.key, e.target.value)
                      }
                      disabled={filter.options?.length === 0}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 disabled:bg-gray-100 disabled:text-gray-500"
                    >
                      <option value="">
                        {filter.placeholder || "All"}
                      </option>
                      {filter.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}
                  {filter.type === "date" && (
                    <Input
                      type="date"
                      value={values[filter.key] || ""}
                      onChange={(e) =>
                        handleFilterChange(filter.key, e.target.value)
                      }
                    />
                  )}
                  {filter.type === "number" && (
                    <Input
                      type="number"
                      placeholder={filter.placeholder}
                      value={values[filter.key] || ""}
                      onChange={(e) =>
                        handleFilterChange(
                          filter.key,
                          e.target.value ? Number(e.target.value) : ""
                        )
                      }
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={onReset}
                className="flex-1"
                disabled={!hasActiveFilters}
              >
                Reset
              </Button>
              {onSavePreset && (
                <>
                  {!showSavePreset ? (
                    <Button
                      variant="outline"
                      onClick={() => setShowSavePreset(true)}
                      className="flex-1"
                      disabled={!hasActiveFilters}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  ) : (
                    <div className="flex-1 flex gap-2">
                      <Input
                        placeholder="Preset name"
                        value={presetName}
                        onChange={(e) => setPresetName(e.target.value)}
                        className="flex-1"
                        autoFocus
                      />
                      <Button
                        variant="primary"
                        onClick={handleSavePreset}
                        disabled={!presetName.trim()}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowSavePreset(false);
                          setPresetName("");
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

