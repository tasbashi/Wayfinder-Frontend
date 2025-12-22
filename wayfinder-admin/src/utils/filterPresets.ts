import { FilterPreset } from "@/components/common/FilterPanel";

const PRESETS_STORAGE_KEY = "@wayfinder:filter_presets";

export function getFilterPresets(): FilterPreset[] {
  if (typeof window === "undefined") return [];
  
  try {
    const stored = localStorage.getItem(PRESETS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error loading filter presets:", error);
    return [];
  }
}

export function saveFilterPreset(preset: FilterPreset): void {
  if (typeof window === "undefined") return;
  
  try {
    const presets = getFilterPresets();
    const updated = [...presets.filter((p) => p.id !== preset.id), preset];
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Error saving filter preset:", error);
  }
}

export function deleteFilterPreset(id: string): void {
  if (typeof window === "undefined") return;
  
  try {
    const presets = getFilterPresets();
    const updated = presets.filter((p) => p.id !== id);
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Error deleting filter preset:", error);
  }
}

export function generatePresetId(): string {
  return `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

