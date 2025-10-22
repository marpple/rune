import type { ErrorRequestHandler, ParamsDictionary, RequestHandler, Request } from 'express-serve-static-core';
import type { ParsedQs } from 'qs';

type FactoryFunction<C> = C extends new (...args: infer P) => any ? (...args: P) => InstanceType<C> : never;

export type RenderRequest = Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>;

export type RenderHandler<
  C,
  P = ParamsDictionary,
  ReqQuery = ParsedQs,
  ReqBody = any,
  LocalsObj extends Record<string, any> = Record<string, any>,
> = (view: FactoryFunction<C>) => RequestHandler<P, any, ReqBody, ReqQuery, LocalsObj>;

export type ErrorRenderHandler<
  C,
  P = ParamsDictionary,
  ReqQuery = ParsedQs,
  ReqBody = any,
  LocalsObj extends Record<string, any> = Record<string, any>,
> = (view: FactoryFunction<C>) => ErrorRequestHandler<P, any, ReqBody, ReqQuery, LocalsObj>;
