import { makeFunctionReference } from "convex/server";

export type Post = {
  slug: string;
  title: string;
};

export type ListPostsArgs = {
  page: number;
  tag: string;
};

export const getPostReference = makeFunctionReference<
  "query",
  { slug: string },
  Post | null
>("blog/queries:getPost");

export const listPostsReference = makeFunctionReference<
  "query",
  ListPostsArgs,
  Post[]
>("blog/queries:listPosts");
