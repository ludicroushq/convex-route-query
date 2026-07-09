import type {
  QueryClient,
  UseQueryResult,
  UseSuspenseQueryResult,
} from "@tanstack/react-query";
import { makeFunctionReference } from "convex/server";
import { expectTypeOf } from "expect-type";

import { createConvexRouteQueries, createConvexRouteQuery } from "./index";
import type {
  ConvexRouteQueryFetchRouteResult,
  ConvexRouteQueryLoaderData,
} from "./index";

type Post = {
  slug: string;
  title: string;
};

const getPostLoaderKey = "__convexRouteQuery:getPost";
const listPostsLoaderKey = "__convexRouteQuery:listPosts";

const queryClient = {} as QueryClient;

const listPostsReference = makeFunctionReference<
  "query",
  Record<string, never>,
  Post[]
>("blog/queries:listPosts");
const listPosts = createConvexRouteQuery(listPostsReference);

expectTypeOf(listPosts.fetchQuery(queryClient)).toEqualTypeOf<
  Promise<Post[]>
>();
expectTypeOf(listPosts.prefetchQuery(queryClient)).toEqualTypeOf<
  Promise<void>
>();
expectTypeOf(listPosts.useQuery()).toEqualTypeOf<
  UseQueryResult<Post[], Error>
>();
expectTypeOf(listPosts.useQuery({}, { enabled: false })).toEqualTypeOf<
  UseQueryResult<Post[], Error>
>();
expectTypeOf(listPosts.useSuspenseQuery()).toEqualTypeOf<
  UseSuspenseQueryResult<Post[], Error>
>();
listPosts.useQuery({});
listPosts.useSuspenseQuery({});
listPosts.prefetchQuery(queryClient, {});

// @ts-expect-error no-arg queries only accept an empty args object
listPosts.useSuspenseQuery({ slug: "hello-world" });

// @ts-expect-error generated query options are owned by convex-route-query
listPosts.useQuery({}, { queryKey: ["different"] });

const getPostReference = makeFunctionReference<
  "query",
  { slug: string },
  Post | null
>("blog/queries:getPost");
const getPost = createConvexRouteQuery(getPostReference);

expectTypeOf(
  getPost.fetchQuery(queryClient, { slug: "hello-world" })
).toEqualTypeOf<Promise<Post | null>>();
expectTypeOf(getPost.useSuspenseQuery({ slug: "hello-world" })).toEqualTypeOf<
  UseSuspenseQueryResult<Post | null, Error>
>();
expectTypeOf(getPost.useQuery({ slug: "hello-world" })).toEqualTypeOf<
  UseQueryResult<Post | null, Error>
>();
expectTypeOf(
  getPost.useQuery(
    { slug: "hello-world" },
    {
      enabled: true,
      placeholderData: { slug: "loading", title: "Loading" },
    }
  )
).toEqualTypeOf<UseQueryResult<Post | null, Error>>();
expectTypeOf(
  getPost.useQuery(
    { slug: "hello-world" },
    {
      select: (post) => post?.title ?? "Untitled",
    }
  )
).toEqualTypeOf<UseQueryResult<string, Error>>();

// @ts-expect-error required query args must be provided
getPost.useSuspenseQuery();

// @ts-expect-error required query args must be provided
getPost.useQuery();

// @ts-expect-error slug must be a string
getPost.prefetchQuery(queryClient, { slug: 123 });

// @ts-expect-error slug must be a string
getPost.useQuery({ slug: 123 });

// @ts-expect-error excess args should stay rejected
getPost.fetchQuery(queryClient, { slug: "hello-world", extra: true });

// @ts-expect-error generated stale time is owned by convex-route-query
getPost.useQuery({ slug: "hello-world" }, { staleTime: 1000 });

const keyedGetPost = createConvexRouteQuery("getPost", getPostReference);

expectTypeOf(
  keyedGetPost.prefetchRoute({
    context: { queryClient },
    deps: { slug: "hello-world" },
  })
).toEqualTypeOf<
  Promise<ConvexRouteQueryLoaderData<"getPost", typeof getPostReference>>
>();

expectTypeOf(
  keyedGetPost.prefetchRoute(
    {
      context: { queryClient },
    },
    { slug: "hello-world" }
  )
).toEqualTypeOf<
  Promise<ConvexRouteQueryLoaderData<"getPost", typeof getPostReference>>
>();

expectTypeOf(
  keyedGetPost.fetchRoute({
    context: { queryClient },
    deps: { slug: "hello-world" },
  })
).toEqualTypeOf<
  Promise<ConvexRouteQueryFetchRouteResult<"getPost", typeof getPostReference>>
>();

const getPostRoute = {
  useLoaderData: () => ({
    [getPostLoaderKey]: { slug: "hello-world" },
    permissions: ["read"],
  }),
};

expectTypeOf(keyedGetPost.useSuspenseRouteQuery(getPostRoute)).toEqualTypeOf<
  UseSuspenseQueryResult<Post | null, Error>
>();

const wrongGetPostRoute = {
  useLoaderData: () => ({
    [listPostsLoaderKey]: {},
  }),
};

// @ts-expect-error route loader data must contain the matching query key
keyedGetPost.useSuspenseRouteQuery(wrongGetPostRoute);

keyedGetPost.prefetchRoute({
  context: { queryClient },
  // @ts-expect-error route deps must match required Convex args
  deps: {},
});

keyedGetPost.prefetchRoute(
  {
    context: { queryClient },
  },
  // @ts-expect-error explicit route args must match required Convex args
  {}
);

const keyedQueries = createConvexRouteQueries({
  getPost: getPostReference,
  listPosts: listPostsReference,
});

expectTypeOf(
  keyedQueries.getPost.prefetchRoute({
    context: { queryClient },
    deps: { slug: "hello-world" },
  })
).toEqualTypeOf<
  Promise<ConvexRouteQueryLoaderData<"getPost", typeof getPostReference>>
>();

expectTypeOf(
  keyedQueries.listPosts.useSuspenseRouteQuery({
    useLoaderData: () => ({
      [listPostsLoaderKey]: {},
    }),
  })
).toEqualTypeOf<UseSuspenseQueryResult<Post[], Error>>();
