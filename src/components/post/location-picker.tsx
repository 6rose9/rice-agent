"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2, X, Search } from "lucide-react";

// Fix Leaflet default icon paths with bundlers (webpack/next)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface LocationValue {
  lat: number;
  lng: number;
}

interface LocationPickerProps {
  value?: LocationValue | null;
  onChange: (location: LocationValue | null) => void;
}

function coerce(v: unknown): number | undefined {
  if (v == null || v === "") return undefined;
  const n = Number(v);
  return isNaN(n) ? undefined : n;
}

const DEFAULT_CENTER: [number, number] = [21.9162, 95.956]; // Myanmar center
const DEFAULT_ZOOM = 6;
const PIN_ZOOM = 15;

interface Suggestion {
  display_name: string;
  lat: string;
  lon: string;
}

export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const lat = coerce(value?.lat);
  const lng = coerce(value?.lng);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const mapInitialized = useRef(false);

  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // ── Init / destroy map ──────────────────────────────────────────────

  useEffect(() => {
    if (!mapContainerRef.current || mapInitialized.current) return;

    const map = L.map(mapContainerRef.current, {
      center: lat != null && lng != null ? [lat, lng] : DEFAULT_CENTER,
      zoom: lat != null && lng != null ? PIN_ZOOM : DEFAULT_ZOOM,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    map.on("click", (e: L.LeafletMouseEvent) => {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
      setError("");
      setShowSuggestions(false);
    });

    mapRef.current = map;
    mapInitialized.current = true;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      mapInitialized.current = false;
    };
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Sync marker with value ──────────────────────────────────────────

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old marker
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }

    if (lat != null && lng != null) {
      markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map);
      markerRef.current.on("dragend", () => {
        const pos = markerRef.current?.getLatLng();
        if (pos) {
          onChange({ lat: pos.lat, lng: pos.lng });
        }
      });
      map.setView([lat, lng], map.getZoom() < PIN_ZOOM ? PIN_ZOOM : map.getZoom());
    }
  }, [lat, lng, onChange]);

  // ── Search / geocode ────────────────────────────────────────────────

  const doSearch = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setSearching(true);
      setError("");
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&countrycodes=mm`,
        );
        if (!res.ok) throw new Error("Search failed");
        const data: Suggestion[] = await res.json();
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
      } catch {
        setError("Search failed. Please try again.");
      } finally {
        setSearching(false);
      }
    },
    [],
  );

  function handleQueryChange(val: string) {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 400);
  }

  function handleSelectSuggestion(s: Suggestion) {
    const newLat = parseFloat(s.lat);
    const newLng = parseFloat(s.lon);
    onChange({ lat: newLat, lng: newLng });
    setQuery(s.display_name);
    setShowSuggestions(false);
    setError("");
  }

  function handleClear() {
    onChange(null);
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    setError("");

    // Fly back to default view
    mapRef.current?.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
  }

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="space-y-2">
      {/* Search bar */}
      <div className="relative flex gap-1.5">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Search for a place or address..."
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            onBlur={() => {
              // Delay so click on suggestion registers
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            className="h-9 text-xs pr-8"
          />
          {searching && (
            <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-muted-foreground" />
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 w-9 p-0 shrink-0"
          onClick={() => doSearch(query)}
          disabled={searching}
        >
          <Search className="h-3.5 w-3.5" />
        </Button>
        {lat != null && lng != null && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 shrink-0"
            onClick={handleClear}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="border rounded-md bg-background shadow-md max-h-40 overflow-y-auto z-10 relative">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              className="w-full text-left px-3 py-2 text-xs hover:bg-muted transition-colors border-b last:border-b-0"
              onMouseDown={() => handleSelectSuggestion(s)}
            >
              <MapPin className="h-3 w-3 inline mr-1 text-muted-foreground" />
              {s.display_name}
            </button>
          ))}
        </div>
      )}

      {/* Map container */}
      <div
        ref={mapContainerRef}
        className="w-full h-52 rounded-md border bg-muted z-0"
      />

      {/* Pin status */}
      {lat != null && lng != null && (
        <p className="text-[11px] text-muted-foreground">
          📍 Pinned: {lat.toFixed(6)}, {lng.toFixed(6)}
        </p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
      <p className="text-[10px] text-muted-foreground">
        Search for a place or click directly on the map to pin your location.
      </p>
    </div>
  );
}
