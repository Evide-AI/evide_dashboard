import { useEffect, useState, useRef } from "react";
import { MapPin, Clock, AlertCircle, Loader2, ChevronDown } from "lucide-react";
import { useStopSearch } from "../hooks/useStopSearch";
import type { Stop, StopSuggestion } from "../types";

interface StopInputProps {
  stop: Stop;
  index: number;
  onStopChange: (
    index: number,
    field: keyof Stop,
    value: string | number
  ) => void;
  onStopChangeBulk?: (index: number, updates: Partial<Stop>) => void;
  otherStops: Stop[];
  isIntermediateStop: boolean;
  onRemove?: () => void;
  canRemove?: boolean;
  isReadOnly?: boolean;
}

export default function StopInput({
  stop,
  index,
  onStopChange,
  onStopChangeBulk,
  otherStops,
  isIntermediateStop,
  onRemove,
  canRemove = true,
  isReadOnly = false,
}: StopInputProps) {
  const {
    suggestions,
    isLoading,
    error: searchError,
    pagination,
    hasMore,
    search,
    loadMore,
    reset: resetSearch,
  } = useStopSearch(300, 2, 15);

  const [showDropdown, setShowDropdown] = useState(false);
  const [localInput, setLocalInput] = useState(stop.name);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const [highlightedFields, setHighlightedFields] = useState<Set<string>>(
    new Set()
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Sync local input with stop name from parent
   */
  useEffect(() => {
    setLocalInput(stop.name);
  }, [stop.name]);

  /**
   * Check if stop name already exists in other stops
   */
  const isDuplicateStop = (stopName: string, stopId?: number): boolean => {
    return otherStops.some((s, i) => {
      if (i === index) return false; // Don't compare with itself
      // Check by stop_id first if available, then by name
      if (stopId && s.stop_id === stopId) return true;
      return s.name.toLowerCase() === stopName.toLowerCase();
    });
  };

  /**
   * Handle input change with search
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly) return;

    const value = e.target.value;
    setLocalInput(value);
    onStopChange(index, "name", value);
    setDuplicateError(null);

    if (value.length >= 2) {
      search(value);
      setShowDropdown(true);
    } else {
      resetSearch();
      setShowDropdown(false);
    }
  };

  /**
   * Handle stop selection from dropdown
   */
  const handleSelectStop = (suggestion: StopSuggestion) => {
    // Check for duplicates
    if (isDuplicateStop(suggestion.name, suggestion.id)) {
      setDuplicateError(`"${suggestion.name}" is already in this route`);
      return;
    }

    setDuplicateError(null);
    setLocalInput(suggestion.name);

    // Use bulk update if available, otherwise fall back to individual updates
    if (onStopChangeBulk) {
      onStopChangeBulk(index, {
        name: suggestion.name,
        latitude: suggestion.latitude,
        longitude: suggestion.longitude,
        stop_id: suggestion.id,
      });
    } else {
      onStopChange(index, "name", suggestion.name);
      onStopChange(index, "latitude", suggestion.latitude);
      onStopChange(index, "longitude", suggestion.longitude);
      onStopChange(index, "stop_id", suggestion.id);
    }

    // Highlight the auto-populated fields
    const fieldsToHighlight = new Set(["latitude", "longitude"]);
    setHighlightedFields(fieldsToHighlight);

    // Clear highlight after 2 seconds
    if (highlightTimerRef.current) {
      clearTimeout(highlightTimerRef.current);
    }
    highlightTimerRef.current = setTimeout(() => {
      setHighlightedFields(new Set());
    }, 2000);

    setShowDropdown(false);
    resetSearch();
  };

  /**
   * Handle load more button click
   */
  const handleLoadMore = async () => {
    await loadMore();
  };

  /**
   * Close dropdown when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  /**
   * Cleanup highlight timer on unmount
   */
  useEffect(() => {
    return () => {
      if (highlightTimerRef.current) {
        clearTimeout(highlightTimerRef.current);
      }
    };
  }, []);

  const stopLabel =
    index === 0
      ? "(Starting Point)"
      : index === otherStops.length - 1
      ? "(End Point)"
      : "";

  const getFieldClassName = (_fieldName: string, isHighlighted: boolean) => {
    const baseClass =
      "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent";
    if (isReadOnly) {
      return `${baseClass} bg-gray-100 cursor-not-allowed`;
    }
    if (isHighlighted) {
      return `${baseClass} bg-green-50 border-green-300`;
    }
    return baseClass;
  };

  return (
    <div
      className={`border rounded-lg p-4 space-y-4 ${
        isReadOnly ? "border-gray-300 bg-gray-50" : "border-gray-200"
      }`}
    >
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">
          Stop {index + 1} {stopLabel}
          {isReadOnly && (
            <span className="ml-2 text-xs text-gray-500 font-normal">
              (Read-only)
            </span>
          )}
        </h4>
        {canRemove && onRemove && !isReadOnly && (
          <button
            type="button"
            onClick={onRemove}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            Remove
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Stop Name Input with Autocomplete */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stop Name *
          </label>
          <div className="relative" ref={dropdownRef}>
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
            <input
              type="text"
              value={localInput}
              onChange={handleInputChange}
              onFocus={() => {
                if (
                  !isReadOnly &&
                  localInput.length >= 2 &&
                  suggestions.length > 0
                ) {
                  setShowDropdown(true);
                }
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter stop name"
              required
              autoComplete="off"
              disabled={isReadOnly}
            />

            {/* Dropdown for suggestions */}
            {!isReadOnly &&
              showDropdown &&
              (localInput.length >= 2 || suggestions.length > 0) && (
                <div className="absolute z-[100] w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-64 overflow-y-auto pointer-events-auto">
                  {isLoading && suggestions.length === 0 && (
                    <div className="px-4 py-3 flex items-center gap-2 text-gray-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Searching...</span>
                    </div>
                  )}

                  {!isLoading &&
                    suggestions.length === 0 &&
                    localInput.length >= 2 && (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        No stops found. Enter manually or try another name.
                      </div>
                    )}

                  {suggestions.length > 0 && (
                    <>
                      <div className="py-1">
                        {suggestions.map((suggestion) => (
                          <button
                            key={suggestion.id}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleSelectStop(suggestion);
                            }}
                            className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors flex justify-between items-center border-b border-gray-100 last:border-b-0 pointer-events-auto"
                          >
                            <span className="text-sm font-medium text-gray-900">
                              {suggestion.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {suggestion.latitude.toFixed(4)},{" "}
                              {suggestion.longitude.toFixed(4)}
                            </span>
                          </button>
                        ))}
                      </div>

                      {/* Load More Button */}
                      {hasMore && (
                        <div className="px-4 py-2 border-t border-gray-200">
                          <button
                            type="button"
                            onClick={handleLoadMore}
                            className="w-full px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors flex items-center justify-center gap-1"
                          >
                            <ChevronDown className="h-4 w-4" />
                            Load More ({pagination?.total! -
                              suggestions.length}{" "}
                            remaining)
                          </button>
                        </div>
                      )}

                      {/* Pagination Info */}
                      {pagination && (
                        <div className="px-4 py-2 border-t border-gray-200 text-xs text-gray-500 text-center">
                          Showing {suggestions.length} of {pagination.total}{" "}
                          results
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
          </div>

          {/* Error messages */}
          {duplicateError && (
            <div className="mt-1 flex items-center gap-1.5 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              {duplicateError}
            </div>
          )}

          {searchError && !duplicateError && (
            <div className="mt-1 flex items-center gap-1.5 text-amber-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              {searchError}
            </div>
          )}
        </div>

        {/* Latitude and Longitude */}
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Latitude *
            </label>
            <input
              type="number"
              step="any"
              value={stop.latitude !== 0 ? stop.latitude : ""}
              onChange={(e) =>
                onStopChange(index, "latitude", parseFloat(e.target.value) || 0)
              }
              className={getFieldClassName(
                "latitude",
                highlightedFields.has("latitude")
              )}
              placeholder="12.9698"
              required
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Longitude *
            </label>
            <input
              type="number"
              step="any"
              value={stop.longitude !== 0 ? stop.longitude : ""}
              onChange={(e) =>
                onStopChange(
                  index,
                  "longitude",
                  parseFloat(e.target.value) || 0
                )
              }
              className={getFieldClassName(
                "longitude",
                highlightedFields.has("longitude")
              )}
              placeholder="77.7500"
              required
              disabled={isReadOnly}
            />
          </div>
        </div>

        {/* Travel Time and Distance (only for intermediate stops) */}
        {isIntermediateStop && (
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Travel Time (minutes) *
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="number"
                  min="1"
                  value={stop.travel_time_from_previous_stop_min || ""}
                  onChange={(e) =>
                    onStopChange(
                      index,
                      "travel_time_from_previous_stop_min",
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="25"
                  required
                  disabled={isReadOnly}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Distance (km) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={stop.travel_distance_from_previous_stop || ""}
                onChange={(e) =>
                  onStopChange(
                    index,
                    "travel_distance_from_previous_stop",
                    parseFloat(e.target.value) || 0
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="15.2"
                required
                disabled={isReadOnly}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
