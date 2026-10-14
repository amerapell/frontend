"use client";
import { useEffect, useState } from "react";
import { catalogApi } from "./api";
import { NG_LGAS } from "./nigeria";

const FALLBACK = Object.entries(NG_LGAS).map(([name, lgas]) => ({ name, lgas }));
let cached: { name: string; lgas: string[] }[] | null = null;

/** States + LGAs from GET /locations/states, with the bundled list as fallback. */
export function useNgStates() {
  const [states, setStates] = useState(cached ?? FALLBACK);
  useEffect(() => {
    if (cached) return;
    catalogApi
      .states()
      .then((list) => {
        if (Array.isArray(list) && list.length) {
          cached = list;
          setStates(list);
        }
      })
      .catch(() => {});
  }, []);
  return {
    states,
    names: states.map((s) => s.name),
    lgasFor: (state: string) => states.find((s) => s.name === state)?.lgas ?? NG_LGAS[state] ?? [],
  };
}
