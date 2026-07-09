import { createRoute } from "@tanstack/react-router";

import type { Post } from "../convex";
import { unkeyedGetPost } from "../queries";
import { rootRoute } from "./root";

export const prefetchQueryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/prefetch-query/$slug",
  loader: async ({ context, params }) => {
    await unkeyedGetPost.prefetchQuery(context.queryClient, {
      slug: params.slug,
    });

    return {
      slug: params.slug,
    };
  },
  component: PrefetchQueryRouteComponent,
});

function PrefetchQueryRouteComponent() {
  const { slug } = prefetchQueryRoute.useLoaderData();
  const result = unkeyedGetPost.useSuspenseQuery({ slug });
  const post: Post | null = result.data;

  return <div>{post?.title ?? "Missing post"}</div>;
}
