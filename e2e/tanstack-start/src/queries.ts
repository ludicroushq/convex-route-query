import {
  createConvexRouteQueries,
  createConvexRouteQuery,
} from "convex-route-query";

import { getPostReference, listPostsReference } from "./convex";

export const unkeyedGetPost = createConvexRouteQuery(getPostReference);
export const keyedGetPost = createConvexRouteQuery("getPost", getPostReference);
export const { listPosts } = createConvexRouteQueries({
  listPosts: listPostsReference,
});
