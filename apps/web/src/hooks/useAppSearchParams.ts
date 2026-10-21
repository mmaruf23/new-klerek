import { useSearch, useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";

export function useAppSearchParams() {
  const search = useSearch({ strict: false }) as Record<string, unknown>;
  const navigate = useNavigate();

  const searchParams = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(search).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        params.set(k, String(v));
      }
    });
    return params;
  }, [search]);

  const setSearchParams = useCallback(
    (
      updater:
        | Record<string, string>
        | ((prev: Record<string, string>) => Record<string, string>),
    ) => {
      const nextObj =
        typeof updater === "function"
          ? updater(
              Object.fromEntries(
                Object.entries(search).map(([k, v]) => [k, String(v)]),
              ),
            )
          : updater;

      navigate({
        search: nextObj as any,
      });
    },
    [navigate, search],
  );

  return [searchParams, setSearchParams] as const;
}

