import { createRoute } from "@tanstack/react-router";

import type { Post } from "../convex";
import { keyedGetPost } from "../queries";
import { rootRoute } from "./root";

export const keyedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/keyed/$slug",
  loader: async (ctx) => {
    const routeData = await keyedGetPost.prefetchRoute(ctx, {
      slug: ctx.params.slug,
    });

    return {
      ...routeData,
      slug: ctx.params.slug,
    };
  },
  component: KeyedRouteComponent,
});

function KeyedRouteComponent() {
  const loaderData = keyedRoute.useLoaderData();
  const { slug } = loaderData;
  const result = keyedGetPost.useSuspenseRouteQuery(keyedRoute);
  const post: Post | null = result.data;

  return <div>{post?.title ?? slug}</div>;
}
