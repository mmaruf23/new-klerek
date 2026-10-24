import { useLocation, type RegisteredRouter } from "@tanstack/react-router";

type AppPathname = keyof RegisteredRouter["routesByPath"];
export function useIsActivePath(...paths: AppPathname[]) {
  const pathname = useLocation({ select: (loc) => loc.pathname });
  return paths.includes(pathname as AppPathname);
}
