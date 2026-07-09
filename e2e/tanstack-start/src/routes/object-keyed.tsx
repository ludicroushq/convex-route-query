import { createRoute } from "@tanstack/react-router";
import { z } from "zod";

import type { ListPostsArgs, Post } from "../convex";
import { listPosts } from "../queries";
import { rootRoute } from "./root";

const listPostsSearchSchema = z.object({
  // oxlint-disable-next-line promise/prefer-await-to-then -- Zod's catch is a synchronous fallback API.
  page: z.coerce.number().int().min(1).catch(1),
  // oxlint-disable-next-line promise/prefer-await-to-then -- Zod's catch is a synchronous fallback API.
  tag: z.string().catch("all"),
});

export const objectKeyedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/object-keyed",
  validateSearch: (search): ListPostsArgs =>
    listPostsSearchSchema.parse(search),
  loaderDeps: ({ search }) => ({
    page: search.page,
    tag: search.tag,
  }),
  loader: async (ctx) => ({
    ...(await listPosts.prefetchRoute(ctx)),
    heading: `Posts tagged ${ctx.deps.tag}`,
  }),
  component: ObjectKeyedRouteComponent,
});

function ObjectKeyedRouteComponent() {
  const loaderData = objectKeyedRoute.useLoaderData();
  const { heading } = loaderData;
  const result = listPosts.useSuspenseRouteQuery(objectKeyedRoute);
  const posts: Post[] = result.data;

  return (
    <section>
      <h1>{heading}</h1>
      <p>{posts.length}</p>
    </section>
  );
}
