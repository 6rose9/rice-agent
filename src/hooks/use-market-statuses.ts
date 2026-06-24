"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { MarketStatusRow } from "@/types";

export function useMarketStatuses() {
  const [statuses, setStatuses] = useState<MarketStatusRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function fetchData() {
      const { data } = await supabase
        .from("market_status")
        .select("*")
        .order("sort_order");

      if (data) setStatuses(data as MarketStatusRow[]);
      setLoading(false);
    }

    fetchData();
  }, []);

  const labels = useMemo(() => {
    const map: Record<number, string> = {};
    for (const s of statuses) {
      map[s.id] = (s.name as { en: string }).en;
    }
    return map;
  }, [statuses]);

  const shortLabels = useMemo(() => {
    const map: Record<number, string> = {};
    for (const s of statuses) {
      const en = (s.name as { en: string }).en;
      map[s.id] = en
        .split(/\s+/)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 5);
    }
    return map;
  }, [statuses]);

  const colors = useMemo(() => {
    const map: Record<number, string> = {};
    for (const s of statuses) {
      if (s.color) {
        map[s.id] = s.color;
      }
    }
    return map;
  }, [statuses]);

  return { statuses, labels, shortLabels, colors, loading };
}
