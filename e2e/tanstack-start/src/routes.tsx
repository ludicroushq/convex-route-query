import { fetchQueryRoute } from "./routes/fetch-query";
import { fetchRouteRoute } from "./routes/fetch-route";
import { keyedRoute } from "./routes/keyed";
import { objectKeyedRoute } from "./routes/object-keyed";
import { prefetchQueryRoute } from "./routes/prefetch-query";
import { rootRoute } from "./routes/root";
import { unkeyedRoute } from "./routes/unkeyed";
import { useQueryRoute } from "./routes/use-query";
import { useSuspenseQueryRoute } from "./routes/use-suspense-query";

export { rootRoute } from "./routes/root";

export const routeTree = rootRoute.addChildren([
  unkeyedRoute,
  keyedRoute,
  fetchQueryRoute,
  fetchRouteRoute,
  prefetchQueryRoute,
  useQueryRoute,
  useSuspenseQueryRoute,
  objectKeyedRoute,
]);
