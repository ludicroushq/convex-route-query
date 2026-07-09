import { convexQuery } from "@convex-dev/react-query";
import {
  useQuery as useTanStackQuery,
  useSuspenseQuery as useTanStackSuspenseQuery,
  type UseQueryOptions,
  type UseQueryResult,
  type UseSuspenseQueryResult,
} from "@tanstack/react-query";
import {
  getFunctionName,
  type ArgsAndOptions,
  type FunctionArgs,
  type FunctionReference,
  type FunctionReturnType,
  type OptionalRestArgs,
} from "convex/server";

const routeDataKeyPrefix = "__convexRouteQuery:";

export type ConvexRouteQueryLoaderKey<Id extends string> =
  `${typeof routeDataKeyPrefix}${Id}`;

export type ConvexRouteQueryLoaderData<
  Id extends string,
  Query extends FunctionReference<"query">,
> = Record<ConvexRouteQueryLoaderKey<Id>, FunctionArgs<Query>>;

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

export type ConvexRouteQuery<
  Query extends FunctionReference<"query">,
  Id extends string = string,
> = {
  options: (...args: OptionalRestArgs<Query>) => ConvexRouteQueryOptions<Query>;
  fetchQuery: (
    queryClient: ConvexRouteQueryClient<Query>,
    ...args: OptionalRestArgs<Query>
  ) => Promise<FunctionReturnType<Query>>;
  prefetchQuery: (
    queryClient: ConvexRouteQueryClient<Query>,
    ...args: OptionalRestArgs<Query>
  ) => Promise<void>;
  fetchRoute: {
    (
      routeContext: ConvexRouteQueryRouteContext<Query>,
    ): Promise<ConvexRouteQueryFetchRouteResult<Id, Query>>;
    (
      routeContext: ConvexRouteQueryClientContext<Query>,
      ...args: OptionalRestArgs<Query>
    ): Promise<ConvexRouteQueryFetchRouteResult<Id, Query>>;
  };
  prefetchRoute: {
    (
      routeContext: ConvexRouteQueryRouteContext<Query>,
    ): Promise<ConvexRouteQueryLoaderData<Id, Query>>;
    (
      routeContext: ConvexRouteQueryClientContext<Query>,
      ...args: OptionalRestArgs<Query>
    ): Promise<ConvexRouteQueryLoaderData<Id, Query>>;
  };
  useQuery: <Data = FunctionReturnType<Query>>(
    ...args: ArgsAndOptions<Query, ConvexRouteUseQueryOptions<Query, Data>>
  ) => UseQueryResult<Data, Error>;
  useSuspenseRouteQuery: (
    route: ConvexRouteQueryRoute<Id, Query>,
  ) => UseSuspenseQueryResult<FunctionReturnType<Query>, Error>;
  useSuspenseQuery: (
    ...args: OptionalRestArgs<Query>
  ) => UseSuspenseQueryResult<FunctionReturnType<Query>, Error>;
};

export type ConvexRouteQueryClient<Query extends FunctionReference<"query">> = {
  fetchQuery: (options: ConvexRouteQueryOptions<Query>) => Promise<unknown>;
  prefetchQuery: (options: ConvexRouteQueryOptions<Query>) => Promise<void>;
};

export type ConvexRouteQueryClientContext<
  Query extends FunctionReference<"query">,
> = {
  context: {
    queryClient: ConvexRouteQueryClient<Query>;
  };
};

type ConvexRouteQueryRouteDeps<Query extends FunctionReference<"query">> =
  keyof FunctionArgs<Query> extends never
    ? {
        deps?: FunctionArgs<Query>;
      }
    : {
        deps: FunctionArgs<Query>;
      };

export type ConvexRouteQueryRouteContext<
  Query extends FunctionReference<"query">,
> = ConvexRouteQueryClientContext<Query> & ConvexRouteQueryRouteDeps<Query>;

export type ConvexRouteQueryFetchRouteResult<
  Id extends string,
  Query extends FunctionReference<"query">,
> = {
  data: FunctionReturnType<Query>;
  routeData: ConvexRouteQueryLoaderData<Id, Query>;
};

export type ConvexRouteQueryRoute<
  Id extends string,
  Query extends FunctionReference<"query">,
> = {
  useLoaderData: () => ConvexRouteQueryLoaderData<Id, Query>;
};

type CreateConvexQueryOptions<Query extends FunctionReference<"query">> = (
  query: Query,
  ...args: OptionalRestArgs<Query>
) => ConvexRouteQueryOptions<Query>;

export function createConvexRouteQuery<
  Query extends FunctionReference<"query">,
>(query: Query): ConvexRouteQuery<Query>;
export function createConvexRouteQuery<
  const Id extends string,
  Query extends FunctionReference<"query">,
>(id: Id, query: Query): ConvexRouteQuery<Query, Id>;
export function createConvexRouteQuery<
  const Id extends string,
  Query extends FunctionReference<"query">,
>(
  idOrQuery: Id | Query,
  maybeQuery?: Query,
): ConvexRouteQuery<Query, Id | string> {
  const query = (maybeQuery ?? idOrQuery) as Query;
  const id =
    typeof idOrQuery === "string"
      ? idOrQuery
      : getFunctionName(idOrQuery as Query);
  const loaderDataKey =
    `${routeDataKeyPrefix}${id}` as ConvexRouteQueryLoaderKey<Id | string>;
  const createOptions =
    convexQuery as unknown as CreateConvexQueryOptions<Query>;
  const options = (...args: OptionalRestArgs<Query>) =>
    createOptions(query, ...args);
  const createLoaderData = (args: FunctionArgs<Query>) =>
    Object.fromEntries([
      [loaderDataKey, args],
    ]) as unknown as ConvexRouteQueryLoaderData<Id | string, Query>;
  const getRouteArgs = (
    routeContext:
      | ConvexRouteQueryClientContext<Query>
      | ConvexRouteQueryRouteContext<Query>,
    args: OptionalRestArgs<Query>,
  ) =>
    (args.length > 0
      ? args[0]
      : "deps" in routeContext && routeContext.deps !== undefined
        ? routeContext.deps
        : {}) as FunctionArgs<Query>;
  const getLoaderDataArgs = (
    loaderData: ConvexRouteQueryLoaderData<Id, Query>,
  ) => {
    if (
      typeof loaderData !== "object" ||
      loaderData === null ||
      !(loaderDataKey in loaderData)
    ) {
      throw new Error(
        `Missing convex-route-query loader data for "${String(id)}". Return the result of prefetchRoute(...) from this route's loader.`,
      );
    }

    return loaderData[
      loaderDataKey as keyof typeof loaderData
    ] as FunctionArgs<Query>;
  };

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
    async fetchRoute(routeContext, ...args) {
      const routeArgs = args as OptionalRestArgs<Query>;
      const queryArgs = getRouteArgs(routeContext, routeArgs);
      const data = await routeContext.context.queryClient.fetchQuery(
        options(...([queryArgs] as OptionalRestArgs<Query>)),
      );

      return {
        data: data as FunctionReturnType<Query>,
        routeData: createLoaderData(queryArgs),
      };
    },
    async prefetchRoute(routeContext, ...args) {
      const routeArgs = args as OptionalRestArgs<Query>;
      const queryArgs = getRouteArgs(routeContext, routeArgs);

      await routeContext.context.queryClient.prefetchQuery(
        options(...([queryArgs] as OptionalRestArgs<Query>)),
      );

      return createLoaderData(queryArgs);
    },
    useQuery(...args) {
      const [queryArgs, queryOptions] = args;

      return useTanStackQuery({
        ...queryOptions,
        ...options(...([queryArgs] as OptionalRestArgs<Query>)),
      });
    },
    useSuspenseRouteQuery(route) {
      const loaderData = route.useLoaderData();
      const queryArgs = getLoaderDataArgs(loaderData);

      return useTanStackSuspenseQuery(
        options(...([queryArgs] as OptionalRestArgs<Query>)),
      );
    },
    useSuspenseQuery(...args) {
      return useTanStackSuspenseQuery(options(...args));
    },
  };
}

export function createConvexRouteQueries<
  const Queries extends Record<string, FunctionReference<"query">>,
>(
  queries: Queries,
): {
  [Id in keyof Queries & string]: ConvexRouteQuery<Queries[Id], Id>;
} {
  return Object.fromEntries(
    Object.entries(queries).map(([id, query]) => [
      id,
      createConvexRouteQuery(id, query),
    ]),
  ) as unknown as {
    [Id in keyof Queries & string]: ConvexRouteQuery<Queries[Id], Id>;
  };
}
