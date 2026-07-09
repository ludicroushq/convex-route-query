# convex-route-query

Type-safe Convex query helpers for TanStack Router loaders and React Query
Suspense.

`convex-route-query` lets a route preload a Convex query once, return the typed
query args as loader data, and then read the same query from the route component
without rebuilding params or search state.

```ts
import { createFileRoute } from "@tanstack/react-router";
import { createConvexRouteQueries } from "convex-route-query";
import { api } from "../convex/_generated/api";

const { listExperiences } = createConvexRouteQueries({
  listExperiences: api.resume.queries.listExperiences,
});

export const Route = createFileRoute("/experience/")({
  loader: async (ctx) => ({
    ...(await listExperiences.prefetchRoute(ctx)),
  }),
  component: ExperiencePage,
});

function ExperiencePage() {
  const { data } = listExperiences.useSuspenseRouteQuery(Route);

  return <ExperienceList experiences={data} />;
}
```

## Why this exists

Convex, TanStack Router, and TanStack Query fit together beautifully, but route
data loading can still get repetitive:

- The loader has the route params, validated search params, and `QueryClient`.
- The component needs the same Convex args again to call `useSuspenseQuery`.
- Convex query args should stay inferred from the generated `api`.
- `queryKey`, `queryFn`, and `staleTime` should come from `convexQuery(...)`, not
  be rewritten by hand.

This package gives each query a stable typed route key:

```ts
const getPost = createConvexRouteQuery("getPost", api.blog.queries.getPost);
```

The loader returns the key by spreading `prefetchRoute(...)`, and the component
uses that key with `useSuspenseRouteQuery(Route)`. TypeScript makes sure those
two sides match.

## Table of contents

- [Install](#install)
- [Before you start](#before-you-start)
- [Basic usage](#basic-usage)
- [Search params](#search-params)
- [Path params and loader work](#path-params-and-loader-work)
- [Non-suspense usage](#non-suspense-usage)
- [API reference](#api-reference)
- [Notes](#notes)

## Install

```sh
bun add convex-route-query
```

```sh
npm install convex-route-query
```

`convex-route-query` expects these peer dependencies to be installed in your app:

```sh
bun add @convex-dev/react-query @tanstack/react-query convex react
```

## Before you start

This package assumes Convex is already configured with TanStack Query and that
your TanStack Router context exposes a `queryClient` to route loaders.

If you have not wired that up yet, start with the official Convex docs:

- [Convex with TanStack Query](https://docs.convex.dev/client/tanstack/tanstack-query/)
- [TanStack Start quickstart](https://docs.convex.dev/quickstart/tanstack-start)
- [TanStack Start with Convex](https://docs.convex.dev/client/tanstack/tanstack-start/)

Once that setup is in place, `convex-route-query` gives you route-level helpers
on top of it.

## Basic usage

Use `createConvexRouteQueries(...)` when you want keys inferred from object
property names.

```ts
import { createFileRoute } from "@tanstack/react-router";
import { createConvexRouteQueries } from "convex-route-query";
import { api } from "../convex/_generated/api";

const { listPosts } = createConvexRouteQueries({
  listPosts: api.blog.queries.listPosts,
});

export const Route = createFileRoute("/blog/")({
  loader: async (ctx) => ({
    ...(await listPosts.prefetchRoute(ctx)),
  }),
  component: BlogIndexPage,
});

function BlogIndexPage() {
  const { data: posts } = listPosts.useSuspenseRouteQuery(Route);

  return <PostList posts={posts} />;
}
```

`prefetchRoute(ctx)` warms the TanStack Query cache and returns a small typed
loader-data fragment. `useSuspenseRouteQuery(Route)` reads that fragment from
`Route.useLoaderData()` and subscribes to the same Convex query.

## Search params

When search params drive the query, put the exact Convex args in
`loaderDeps`. TanStack Router will reload when those deps change, and
`prefetchRoute(ctx)` can use `ctx.deps` automatically.

```ts
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { createConvexRouteQueries } from "convex-route-query";
import { api } from "../convex/_generated/api";

const postsSearchSchema = z.object({
  page: z.number().catch(1),
  tag: z.string().catch("all"),
});

const { listPosts } = createConvexRouteQueries({
  listPosts: api.blog.queries.listPosts,
});

export const Route = createFileRoute("/blog/")({
  validateSearch: postsSearchSchema,
  loaderDeps: ({ search }) => ({
    page: search.page,
    tag: search.tag,
  }),
  loader: async (ctx) => ({
    ...(await listPosts.prefetchRoute(ctx)),
  }),
  component: BlogIndexPage,
});

function BlogIndexPage() {
  const { data: posts } = listPosts.useSuspenseRouteQuery(Route);

  return <PostList posts={posts} />;
}
```

The component does not call `Route.useSearch()` or rebuild the query args. The
loader already serialized the typed query args for this route match.

## Path params and loader work

Use an explicit key when you only need one query, or when you prefer to name it
directly.

```ts
const getPost = createConvexRouteQuery("getPost", api.blog.queries.getPost);
```

For path params, or any loader that needs to combine params with other data, pass
the Convex args to `fetchRoute` or `prefetchRoute` explicitly. The component
still reads them from loader data.

```ts
import { createFileRoute, notFound } from "@tanstack/react-router";
import { createConvexRouteQuery } from "convex-route-query";
import { api } from "../convex/_generated/api";

const getPost = createConvexRouteQuery("getPost", api.blog.queries.getPost);

export const Route = createFileRoute("/blog/$slug")({
  loader: async (ctx) => {
    const post = await getPost.fetchRoute(ctx, {
      slug: ctx.params.slug,
    });

    if (!post.data) {
      throw notFound();
    }

    return {
      ...post.routeData,
      title: post.data.title,
    };
  },
  component: BlogPostPage,
});

function BlogPostPage() {
  const { data: post } = getPost.useSuspenseRouteQuery(Route);
  const { title } = Route.useLoaderData();

  return <Post post={post} title={title} />;
}
```

Your loader can keep doing normal loader work: auth, redirects, extra prefetches,
metadata, and anything else. Just include the route data returned by
`prefetchRoute(...)` or `fetchRoute(...).routeData`.

## Non-suspense usage

Use `useQuery` when a component should render its own pending state.

```ts
function DraftPostPage() {
  const { slug } = Route.useParams();
  const { data: post, isPending } = getPost.useQuery(
    { slug },
    { enabled: Boolean(slug) },
  );

  if (isPending) {
    return <Spinner />;
  }

  return <PostEditor post={post} />;
}
```

`useQuery` accepts normal TanStack Query options except the generated Convex
options owned by this package: `queryKey`, `queryFn`, and `staleTime`.

## API reference

### `createConvexRouteQuery(query)`

```ts
const query = createConvexRouteQuery(api.someModule.someQuery);
```

Creates the low-level helper. The runtime route key is derived from the Convex
function name, but TypeScript only sees a general `string` key.

### `createConvexRouteQuery(id, query)`

```ts
const getPost = createConvexRouteQuery("getPost", api.blog.queries.getPost);
```

Creates a route-aware helper with an explicit typed key.

### `createConvexRouteQueries(queries)`

```ts
const { getPost, listPosts } = createConvexRouteQueries({
  getPost: api.blog.queries.getPost,
  listPosts: api.blog.queries.listPosts,
});
```

Creates route-aware helpers whose typed keys are inferred from the object keys.

### Helpers

| Helper                                | Use it when                                                    | Returns                              |
| ------------------------------------- | -------------------------------------------------------------- | ------------------------------------ |
| `options(...args)`                    | You need the underlying `convexQuery(...)` options.            | Convex query options                 |
| `fetchQuery(queryClient, ...args)`    | A loader or utility needs the query result directly.           | `Promise<FunctionReturnType<Query>>` |
| `prefetchQuery(queryClient, ...args)` | A loader or utility should warm the cache directly.            | `Promise<void>`                      |
| `fetchRoute(ctx, ...args?)`           | A loader needs the result and a typed route-data fragment.     | `{ data, routeData }`                |
| `prefetchRoute(ctx, ...args?)`        | A loader should warm the cache and return route data.          | Typed route-data fragment            |
| `useSuspenseRouteQuery(Route)`        | A route component should read the query args from loader data. | Suspense query result                |
| `useQuery(...args, queryOptions)`     | A component wants non-suspense query state.                    | Query result                         |
| `useSuspenseQuery(...args)`           | A component already has the args available.                    | Suspense query result                |

The route helpers need `ctx.context.queryClient`. If no args are passed to
`fetchRoute` or `prefetchRoute`, the helper uses `ctx.deps`.

## Notes

- This package is intentionally small. It wraps Convex queries for route loading
  and component reads; mutations and actions should use the normal Convex and
  TanStack Query APIs.
- The internal loader-data key is stable and typed from your explicit key or from
  `createConvexRouteQueries(...)` object keys.
- Convex query options are generated by `@convex-dev/react-query`, including the
  query key and infinite stale time.
