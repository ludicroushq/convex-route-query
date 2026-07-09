import { QueryClient } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";

import { routeTree } from "./routes";

export function createRouter() {
  const queryClient = new QueryClient();

  return createTanStackRouter({
    routeTree,
    context: {
      queryClient,
    },
  });
}

declare module "@tanstack/react-router" {
  // oxlint-disable-next-line typescript/consistent-type-definitions -- TanStack Router uses interface merging for Register.
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
