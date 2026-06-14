import {
  useQuery as useTanStackQuery,
  type QueryClient,
} from "@tanstack/react-query";
import { describe, expect, test, vi } from "vitest";
import { makeFunctionReference } from "convex/server";
import { createConvexRouteQuery } from "./index";

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn((options: unknown) => ({ options })),
  useSuspenseQuery: vi.fn((options: unknown) => ({ options })),
}));

type Post = {
  slug: string;
  title: string;
};

describe("createConvexRouteQuery", () => {
  test("creates Convex React Query options for queries without args", () => {
    const queryReference = makeFunctionReference<
      "query",
      Record<string, never>,
      Post[]
    >("blog/queries:listPosts");
    const listPosts = createConvexRouteQuery(queryReference);

    expect(listPosts.options().queryKey as unknown).toEqual([
      "convexQuery",
      "blog/queries:listPosts",
      {},
    ]);
  });

  test("creates Convex React Query options for queries with args", () => {
    const queryReference = makeFunctionReference<
      "query",
      { slug: string },
      Post | null
    >("blog/queries:getPost");
    const getPost = createConvexRouteQuery(queryReference);

    expect(
      getPost.options({ slug: "hello-world" }).queryKey as unknown,
    ).toEqual(["convexQuery", "blog/queries:getPost", { slug: "hello-world" }]);
  });

  test("forwards options to fetchQuery", async () => {
    const post = { slug: "hello-world", title: "Hello World" };
    const queryReference = makeFunctionReference<
      "query",
      { slug: string },
      Post | null
    >("blog/queries:getPost");
    const getPost = createConvexRouteQuery(queryReference);
    const queryClient = {
      async fetchQuery(options: ReturnType<typeof getPost.options>) {
        expect(options.queryKey as unknown).toEqual([
          "convexQuery",
          "blog/queries:getPost",
          { slug: "hello-world" },
        ]);

        return post;
      },
    } as unknown as QueryClient;

    await expect(
      getPost.fetchQuery(queryClient, { slug: "hello-world" }),
    ).resolves.toEqual(post);
  });

  test("forwards options to prefetchQuery", async () => {
    const queryReference = makeFunctionReference<
      "query",
      Record<string, never>,
      Post[]
    >("blog/queries:listPosts");
    const listPosts = createConvexRouteQuery(queryReference);
    let calls = 0;
    const queryClient = {
      async prefetchQuery(options: ReturnType<typeof listPosts.options>) {
        calls += 1;
        expect(options.queryKey as unknown).toEqual([
          "convexQuery",
          "blog/queries:listPosts",
          {},
        ]);
      },
    } as unknown as QueryClient;

    await listPosts.prefetchQuery(queryClient);
    expect(calls).toBe(1);
  });

  test("forwards generated and extra options to useQuery", () => {
    const placeholderPost = {
      slug: "placeholder",
      title: "Placeholder",
    };
    const queryReference = makeFunctionReference<
      "query",
      { slug: string },
      Post | null
    >("blog/queries:getPost");
    const getPost = createConvexRouteQuery(queryReference);

    getPost.useQuery(
      { slug: "hello-world" },
      {
        enabled: false,
        placeholderData: placeholderPost,
      },
    );

    expect(useTanStackQuery).toHaveBeenLastCalledWith({
      queryKey: [
        "convexQuery",
        "blog/queries:getPost",
        { slug: "hello-world" },
      ],
      staleTime: Number.POSITIVE_INFINITY,
      enabled: false,
      placeholderData: placeholderPost,
    });
  });
});
