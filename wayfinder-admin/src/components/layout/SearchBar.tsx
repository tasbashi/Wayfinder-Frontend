"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Building, MapPin, Layers, X, Loader2 } from "lucide-react";
import { NodeService } from "@/api/node.service";
import { useBuildingStore } from "@/store/buildingStore";
import { useDebounce } from "@/hooks/useDebounce";
import { NodeDto } from "@/types/node.types";
import { BuildingDto } from "@/types/building.types";
import { FloorDto } from "@/types/floor.types";
import { getNodeTypeInfo } from "@/utils/nodeTypeUtils";
import { clsx } from "clsx";

interface SearchResult {
  type: "building" | "node" | "floor";
  id: string;
  name: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  buildingId?: string;
  floorId?: string;
}

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { buildings, fetchBuildings } = useBuildingStore();

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!buildings) {
      fetchBuildings(1, 100);
    }
  }, []);

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      performSearch(debouncedQuery);
    } else {
      setResults([]);
      setIsLoading(false);
    }
  }, [debouncedQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function performSearch(searchQuery: string) {
    setIsLoading(true);
    const searchResults: SearchResult[] = [];

    try {
      // Search nodes via API
      const nodes = await NodeService.search(searchQuery);
      nodes.forEach((node) => {
        const nodeTypeInfo = getNodeTypeInfo(node.nodeType);
        // Find building that contains this floor
        const building = buildings?.items.find((b) =>
          b.floors?.some((f) => f.id === node.floorId)
        );
        const floor = building?.floors?.find((f) => f.id === node.floorId);
        
        searchResults.push({
          type: "node",
          id: node.id,
          name: node.name,
          subtitle: `${nodeTypeInfo.label}${building ? ` • ${building.name}` : ""}${floor ? ` • ${floor.name}` : ""}`,
          icon: MapPin,
          buildingId: building?.id,
          floorId: node.floorId,
        });
      });
    } catch (error) {
      console.error("Node search error:", error);
    }

    // Search buildings (client-side)
    if (buildings?.items) {
      buildings.items.forEach((building) => {
        if (
          building.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          building.address?.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          searchResults.push({
            type: "building",
            id: building.id,
            name: building.name,
            subtitle: building.address,
            icon: Building,
          });
        }

        // Search floors within buildings
        building.floors?.forEach((floor) => {
          if (
            floor.name.toLowerCase().includes(searchQuery.toLowerCase())
          ) {
            searchResults.push({
              type: "floor",
              id: floor.id,
              name: floor.name,
              subtitle: `${building.name} • ${floor.name}`,
              icon: Layers,
              buildingId: building.id,
              floorId: floor.id,
            });
          }
        });
      });
    }

    // Sort results: buildings first, then nodes, then floors
    searchResults.sort((a, b) => {
      const order = { building: 0, node: 1, floor: 2 };
      return order[a.type] - order[b.type];
    });

    setResults(searchResults.slice(0, 10)); // Limit to 10 results
    setIsLoading(false);
  }

  function handleResultClick(result: SearchResult) {
    setIsOpen(false);
    setQuery("");

    switch (result.type) {
      case "building":
        router.push(`/buildings/${result.id}`);
        break;
      case "node":
        router.push(`/nodes/${result.id}`);
        break;
      case "floor":
        if (result.buildingId) {
          router.push(
            `/buildings/${result.buildingId}/floors/${result.floorId}`
          );
        }
        break;
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setIsOpen(false);
      setQuery("");
    } else if (e.key === "Enter" && results.length > 0) {
      handleResultClick(results[0]);
    }
  }

  return (
    <div ref={searchRef} className="relative flex-1 max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search buildings, nodes, floors..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && (query.length >= 2 || results.length > 0) && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              <span className="ml-2 text-sm text-gray-500">Searching...</span>
            </div>
          )}

          {!isLoading && results.length === 0 && query.length >= 2 && (
            <div className="py-8 text-center text-sm text-gray-500">
              No results found for "{query}"
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <div className="py-2">
              {results.map((result, index) => {
                const Icon = result.icon;
                return (
                  <button
                    key={`${result.type}-${result.id}-${index}`}
                    onClick={() => handleResultClick(result)}
                    className="w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Icon className="w-4 h-4 text-gray-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {result.name}
                      </p>
                      {result.subtitle && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                          {result.subtitle}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      <span
                        className={clsx(
                          "text-xs px-2 py-1 rounded",
                          result.type === "building" && "bg-blue-100 text-blue-700",
                          result.type === "node" && "bg-green-100 text-green-700",
                          result.type === "floor" && "bg-purple-100 text-purple-700"
                        )}
                      >
                        {result.type}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {!isLoading && query.length < 2 && (
            <div className="py-4 px-4 text-sm text-gray-500 text-center">
              Type at least 2 characters to search
            </div>
          )}
        </div>
      )}
    </div>
  );
}

