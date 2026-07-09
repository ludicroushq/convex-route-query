import { type QueryClient } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  createRoute,
} from "@tanstack/react-router";
import {
  createConvexRouteQueries,
  createConvexRouteQuery,
} from "convex-route-query";
import { z } from "zod";
import {
  type ListPostsArgs,
  type Post,
  getPostReference,
  listPostsReference,
} from "./convex";

export type RouterContext = {
  queryClient: QueryClient;
};

const unkeyedGetPost = createConvexRouteQuery(getPostReference);
const keyedGetPost = createConvexRouteQuery("getPost", getPostReference);
const { listPosts } = createConvexRouteQueries({
  listPosts: listPostsReference,
});

const listPostsSearchSchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  tag: z.string().catch("all"),
});

export const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

export const optionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/options/$slug",
  loader: ({ params }) => {
    const options = unkeyedGetPost.options({ slug: params.slug });
    const args: { slug: string } = options.queryKey[2];

    return {
      slug: args.slug,
    };
  },
  component: OptionsRouteComponent,
});

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

export const useQueryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/use-query/$slug",
  loader: ({ params }) => ({
    slug: params.slug,
  }),
  component: UseQueryRouteComponent,
});

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

export const objectKeyedPrefetchRouteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/object-keyed-prefetch-route",
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
  component: ObjectKeyedPrefetchRouteComponent,
});

export const routeTree = rootRoute.addChildren([
  optionsRoute,
  fetchQueryRoute,
  prefetchQueryRoute,
  useQueryRoute,
  useSuspenseQueryRoute,
  fetchRouteRoute,
  objectKeyedPrefetchRouteRoute,
]);

function RootComponent() {
  return <Outlet />;
}

function OptionsRouteComponent() {
  const loaderData = optionsRoute.useLoaderData();
  const slug: string = loaderData.slug;

  return <div>{slug}</div>;
}

function FetchQueryRouteComponent() {
  const loaderData = fetchQueryRoute.useLoaderData();
  const post: Post | null = loaderData.post;

  return <div>{post?.title ?? "Missing post"}</div>;
}

function PrefetchQueryRouteComponent() {
  const { slug } = prefetchQueryRoute.useLoaderData();
  const result = unkeyedGetPost.useSuspenseQuery({ slug });
  const post: Post | null = result.data;

  return <div>{post?.title ?? "Missing post"}</div>;
}

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

function UseSuspenseQueryRouteComponent() {
  const { slug } = useSuspenseQueryRoute.useLoaderData();
  const result = unkeyedGetPost.useSuspenseQuery({ slug });
  const post: Post | null = result.data;

  return <div>{post?.title ?? "Missing post"}</div>;
}

function FetchRouteRouteComponent() {
  const loaderData = fetchRouteRoute.useLoaderData();
  const title: string = loaderData.title;
  const result = keyedGetPost.useSuspenseRouteQuery(fetchRouteRoute);
  const post: Post | null = result.data;

  return <div>{post?.title ?? title}</div>;
}

function ObjectKeyedPrefetchRouteComponent() {
  const loaderData = objectKeyedPrefetchRouteRoute.useLoaderData();
  const heading: string = loaderData.heading;
  const result = listPosts.useSuspenseRouteQuery(objectKeyedPrefetchRouteRoute);
  const posts: Post[] = result.data;

  return (
    <section>
      <h1>{heading}</h1>
      <p>{posts.length}</p>
    </section>
  );
}
