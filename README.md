# convex-route-query

Type-safe Convex query helpers for TanStack Router loaders and React Query Suspense.

```ts
import { createConvexRouteQuery } from "convex-route-query";
import { api } from "../convex/_generated/api";

const listExperiences = createConvexRouteQuery(
  api.resume.queries.listExperiences,
);

export const Route = createFileRoute("/experience/")({
  loader: async ({ context }) => {
    await listExperiences.prefetchQuery(context.queryClient);
  },
  component: ExperiencePage,
});

function ExperiencePage() {
  const { data } = listExperiences.useSuspenseQuery();

  return <ExperienceList experiences={data} />;
}
```

Queries with arguments infer their argument object from the Convex function reference.

```ts
const getPost = createConvexRouteQuery(api.blog.queries.getPost);

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ context, params }) => {
    const post = await getPost.fetchQuery(context.queryClient, {
      slug: params.slug,
    });

    if (!post) {
      throw notFound();
    }

    return { post };
  },
  component: BlogPostPage,
});

function BlogPostPage() {
  const { slug } = Route.useParams();
  const { data: post } = getPost.useSuspenseQuery({ slug });

  return <Post post={post} />;
}
```

Use `useQuery` for non-suspense components.

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

## Install

```sh
bun add convex-route-query
```

## API

### `createConvexRouteQuery(query)`

Returns an object with:

- `options(...args)` - the underlying `convexQuery(...)` options.
- `fetchQuery(queryClient, ...args)` - calls `queryClient.fetchQuery(...)`.
- `prefetchQuery(queryClient, ...args)` - calls `queryClient.prefetchQuery(...)`.
- `useQuery(...args, queryOptions)` - calls React Query's `useQuery(...)`.
- `useSuspenseQuery(...args)` - calls React Query's `useSuspenseQuery(...)`.

The loader helpers need a `QueryClient` because loaders run outside React context. The hooks read the `QueryClient` from React context.
