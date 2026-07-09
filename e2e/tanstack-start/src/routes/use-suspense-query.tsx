import { createRoute } from "@tanstack/react-router";
import { type Post } from "../convex";
import { unkeyedGetPost } from "../queries";
import { rootRoute } from "./root";

export const useSuspenseQueryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/use-suspense-query/$slug",
  loader: async ({ context, params }) => {
    await unkeyedGetPost.prefetchQuery(context.queryClient, {
      slug: params.slug,
    });

    return {
      slug: params.slug,
    };
  },
  component: UseSuspenseQueryRouteComponent,
});

function UseSuspenseQueryRouteComponent() {
  const { slug } = useSuspenseQueryRoute.useLoaderData();
  const result = unkeyedGetPost.useSuspenseQuery({ slug });
  const post: Post | null = result.data;

  return <div>{post?.title ?? "Missing post"}</div>;
}
