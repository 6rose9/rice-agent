"use client";

import { useState, useCallback } from "react";

const STORAGE_KEY = "rice_agent_recent_searches";
const MAX_ITEMS = 5;

function load(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(items: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export function useRecentSearches() {
  const [items, setItems] = useState<string[]>(load);

  const add = useCallback((term: string) => {
    setItems((prev) => {
      const trimmed = term.trim();
      if (!trimmed) return prev;
      const next = [trimmed, ...prev.filter((s) => s !== trimmed)].slice(0, MAX_ITEMS);
      save(next);
      return next;
    });
  }, []);

  const remove = useCallback((term: string) => {
    setItems((prev) => {
      const next = prev.filter((s) => s !== term);
      save(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    save([]);
  }, []);

  return { items, add, remove, clear };
}
