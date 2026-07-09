import { createRoute } from "@tanstack/react-router";
import { type Post } from "../convex";
import { unkeyedGetPost } from "../queries";
import { rootRoute } from "./root";

export const unkeyedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/unkeyed/$slug",
  loader: async ({ context, params }) => {
    const options = unkeyedGetPost.options({ slug: params.slug });
    const args: { slug: string } = options.queryKey[2];

    await context.queryClient.prefetchQuery(options);

    return {
      slug: args.slug,
    };
  },
  component: UnkeyedRouteComponent,
});

function UnkeyedRouteComponent() {
  const { slug } = unkeyedRoute.useLoaderData();
  const result = unkeyedGetPost.useSuspenseQuery({ slug });
  const post: Post | null = result.data;

  return <div>{post?.title ?? "Missing post"}</div>;
}
