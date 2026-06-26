"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Post, UserRole } from "@/types";

interface SearchFilters {
  role?: UserRole;
  region?: string;
}

interface SearchResults {
  users: Profile[];
  posts: Post[];
  count: number;
}

export function useSearch(filters?: SearchFilters) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setResults(null);
        setLoading(false);
        return;
      }

      // Cancel previous in-flight request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const supabase = createClient();
        const pattern = `%${q}%`;

        // Fetch region/township names to resolve numeric FKs for profile search
        const [regionRes, townshipRes] = await Promise.all([
          supabase.from("regions").select("id, name"),
          supabase.from("townships").select("id, name, region_id"),
        ]);

        const regions = (regionRes.data ?? []) as { id: number; name: { en: string; my: string } }[];
        const townships = (townshipRes.data ?? []) as { id: number; name: { en: string; my: string }; region_id: number }[];

        // Find region/township IDs whose names match the query
        const matchingRegionIds = regions
          .filter((r) => r.name.en.toLowerCase().includes(q.toLowerCase()) || r.name.my.includes(q))
          .map((r) => r.id);
        const matchingTownshipIds = townships
          .filter((t) => t.name.en.toLowerCase().includes(q.toLowerCase()) || t.name.my.includes(q))
          .map((t) => t.id);

        // Build profile query: search full_name, username, or matching region/township IDs
        let profileQuery = supabase
          .from("profiles")
          .select("*")
          .limit(20);

        // Combine name/username search with location ID matches
        const orParts = [`full_name.ilike.${pattern}`, `username.ilike.${pattern}`];
        if (matchingRegionIds.length > 0) {
          orParts.push(`region_id.in.(${matchingRegionIds.join(",")})`);
        }
        if (matchingTownshipIds.length > 0) {
          orParts.push(`township_id.in.(${matchingTownshipIds.join(",")})`);
        }
        profileQuery = profileQuery.or(orParts.join(","));

        if (filters?.role) {
          profileQuery = profileQuery.eq("role", filters.role);
        }

        // Search posts: ILIKE content, rice_type, region, township
        let postQuery = supabase
          .from("posts")
          .select("*")
          .or(
            `content.ilike.${pattern},rice_type.ilike.${pattern},region.ilike.${pattern},township.ilike.${pattern},rice_name.ilike.${pattern}`
          )
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(20);

        const [profileRes, postRes] = await Promise.all([
          profileQuery,
          postQuery,
        ]);

        if (controller.signal.aborted) return;

        if (profileRes.error) {
          console.error("Profile search error:", profileRes.error.message);
        }
        if (postRes.error) {
          console.error("Post search error:", postRes.error.message);
        }

        const users = (profileRes.data ?? []) as Profile[];
        const posts = (postRes.data ?? []) as Post[];

        setResults({
          users,
          posts,
          count: users.length + posts.length,
        });
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.error("Search error:", err);
        setError(err instanceof Error ? err.message : "Search failed");
      } finally {
        setLoading(false);
      }
    },
    [filters?.role, filters?.region]
  );

  // Debounced search trigger
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(() => {
      search(query);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
  };
}
