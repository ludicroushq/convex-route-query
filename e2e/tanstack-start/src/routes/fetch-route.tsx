import { createRoute } from "@tanstack/react-router";
import { type Post } from "../convex";
import { keyedGetPost } from "../queries";
import { rootRoute } from "./root";

export const fetchRouteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/fetch-route/$slug",
  loader: async (ctx) => {
    const result = await keyedGetPost.fetchRoute(ctx, {
      slug: ctx.params.slug,
    });
    const post: Post | null = result.data;

    return {
      ...result.routeData,
      title: post?.title ?? "Untitled",
    };
  },
  component: FetchRouteRouteComponent,
});

function FetchRouteRouteComponent() {
  const loaderData = fetchRouteRoute.useLoaderData();
  const title: string = loaderData.title;
  const result = keyedGetPost.useSuspenseRouteQuery(fetchRouteRoute);
  const post: Post | null = result.data;

  return <div>{post?.title ?? title}</div>;
}
