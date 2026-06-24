"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RegionRow, TownshipRow } from "@/types";

export function useRegions() {
  const [regions, setRegions] = useState<RegionRow[]>([]);
  const [townships, setTownships] = useState<TownshipRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function fetchData() {
      const [regionRes, townshipRes] = await Promise.all([
        supabase.from("regions").select("*").order("sort_order"),
        supabase.from("townships").select("*").order("sort_order"),
      ]);

      if (regionRes.data) setRegions(regionRes.data);
      if (townshipRes.data) setTownships(townshipRes.data);
      setLoading(false);
    }

    fetchData();
  }, []);

  function getTownshipsForRegion(regionId: number): TownshipRow[] {
    return townships.filter((t) => t.region_id === regionId);
  }

  function getLocationLabel(profile: { region_id: number; township_id: number | null }): string {
    const township = townships.find((t) => t.id === profile.township_id);
    const region = regions.find((r) => r.id === profile.region_id);
    if (township && region) return `${township.name.en}, ${region.name.en}`;
    if (region) return region.name.en;
    return "";
  }

  return { regions, townships, getTownshipsForRegion, getLocationLabel, loading };
}
