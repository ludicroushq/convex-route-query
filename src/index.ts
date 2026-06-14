import { convexQuery } from "@convex-dev/react-query";
import {
  useQuery as useTanStackQuery,
  useSuspenseQuery as useTanStackSuspenseQuery,
  type UseQueryOptions,
  type UseQueryResult,
  type UseSuspenseQueryResult,
} from "@tanstack/react-query";
import type {
  ArgsAndOptions,
  FunctionArgs,
  FunctionReference,
  FunctionReturnType,
  OptionalRestArgs,
} from "convex/server";

export type ConvexRouteQueryOptions<Query extends FunctionReference<"query">> =
  {
    queryKey: ["convexQuery", Query, FunctionArgs<Query>];
    staleTime: number;
  };

export type ConvexRouteUseQueryOptions<
  Query extends FunctionReference<"query">,
  Data = FunctionReturnType<Query>,
> = Omit<
  UseQueryOptions<
    FunctionReturnType<Query>,
    Error,
    Data,
    ConvexRouteQueryOptions<Query>["queryKey"]
  >,
  "queryKey" | "queryFn" | "staleTime"
>;

export type ConvexRouteQuery<Query extends FunctionReference<"query">> = {
  options: (...args: OptionalRestArgs<Query>) => ConvexRouteQueryOptions<Query>;
  fetchQuery: (
    queryClient: ConvexRouteQueryClient<Query>,
    ...args: OptionalRestArgs<Query>
  ) => Promise<FunctionReturnType<Query>>;
  prefetchQuery: (
    queryClient: ConvexRouteQueryClient<Query>,
    ...args: OptionalRestArgs<Query>
  ) => Promise<void>;
  useQuery: <Data = FunctionReturnType<Query>>(
    ...args: ArgsAndOptions<Query, ConvexRouteUseQueryOptions<Query, Data>>
  ) => UseQueryResult<Data, Error>;
  useSuspenseQuery: (
    ...args: OptionalRestArgs<Query>
  ) => UseSuspenseQueryResult<FunctionReturnType<Query>, Error>;
};

export type ConvexRouteQueryClient<Query extends FunctionReference<"query">> = {
  fetchQuery: (options: ConvexRouteQueryOptions<Query>) => Promise<unknown>;
  prefetchQuery: (options: ConvexRouteQueryOptions<Query>) => Promise<void>;
};

type CreateConvexQueryOptions<Query extends FunctionReference<"query">> = (
  query: Query,
  ...args: OptionalRestArgs<Query>
) => ConvexRouteQueryOptions<Query>;

export function createConvexRouteQuery<
  Query extends FunctionReference<"query">,
>(query: Query): ConvexRouteQuery<Query> {
  const createOptions =
    convexQuery as unknown as CreateConvexQueryOptions<Query>;
  const options = (...args: OptionalRestArgs<Query>) =>
    createOptions(query, ...args);

  return {
    options,
    fetchQuery(queryClient, ...args) {
      return queryClient.fetchQuery(options(...args)) as Promise<
        FunctionReturnType<Query>
      >;
    },
    prefetchQuery(queryClient, ...args) {
      return queryClient.prefetchQuery(options(...args));
    },
    useQuery(...args) {
      const [queryArgs, queryOptions] = args;

      return useTanStackQuery({
        ...options(...([queryArgs] as OptionalRestArgs<Query>)),
        ...queryOptions,
      });
    },
    useSuspenseQuery(...args) {
      return useTanStackSuspenseQuery(options(...args));
    },
  };
}
