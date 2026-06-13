import type {
  QueryClient,
  UseSuspenseQueryResult,
} from "@tanstack/react-query";
import { makeFunctionReference } from "convex/server";
import { expectTypeOf } from "expect-type";
import { createConvexRouteQuery } from "./index";

type Post = {
  slug: string;
  title: string;
};

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
expectTypeOf(listPosts.useSuspenseQuery()).toEqualTypeOf<
  UseSuspenseQueryResult<Post[], Error>
>();
listPosts.useSuspenseQuery({});
listPosts.prefetchQuery(queryClient, {});

// @ts-expect-error no-arg queries only accept an empty args object
listPosts.useSuspenseQuery({ slug: "hello-world" });

const getPostReference = makeFunctionReference<
  "query",
  { slug: string },
  Post | null
>("blog/queries:getPost");
const getPost = createConvexRouteQuery(getPostReference);

expectTypeOf(
  getPost.fetchQuery(queryClient, { slug: "hello-world" }),
).toEqualTypeOf<Promise<Post | null>>();
expectTypeOf(getPost.useSuspenseQuery({ slug: "hello-world" })).toEqualTypeOf<
  UseSuspenseQueryResult<Post | null, Error>
>();

// @ts-expect-error required query args must be provided
getPost.useSuspenseQuery();

// @ts-expect-error slug must be a string
getPost.prefetchQuery(queryClient, { slug: 123 });

// @ts-expect-error excess args should stay rejected
getPost.fetchQuery(queryClient, { slug: "hello-world", extra: true });
