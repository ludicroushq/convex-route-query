import { createRoute } from "@tanstack/react-router";
import { unkeyedGetPost } from "../queries";
import { rootRoute } from "./root";

export const useQueryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/use-query/$slug",
  loader: ({ params }) => ({
    slug: params.slug,
  }),
  component: UseQueryRouteComponent,
});

function UseQueryRouteComponent() {
  const { slug } = useQueryRoute.useLoaderData();
  const result = unkeyedGetPost.useQuery(
    { slug },
    {
      select: (post) => post?.title ?? "Untitled",
    },
  );
  const title: string | undefined = result.data;

  return <div>{title ?? "Loading"}</div>;
}
