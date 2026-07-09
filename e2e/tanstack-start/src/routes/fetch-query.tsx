import { createRoute } from "@tanstack/react-router";

import { unkeyedGetPost } from "../queries";
import { rootRoute } from "./root";

export const fetchQueryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/fetch-query/$slug",
  loader: async ({ context, params }) => {
    const post = await unkeyedGetPost.fetchQuery(context.queryClient, {
      slug: params.slug,
    });

    return {
      post,
    };
  },
  component: FetchQueryRouteComponent,
});

function FetchQueryRouteComponent() {
  const loaderData = fetchQueryRoute.useLoaderData();
  const { post } = loaderData;

  return <div>{post?.title ?? "Missing post"}</div>;
}
