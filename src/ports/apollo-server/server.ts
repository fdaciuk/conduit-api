import { Request as ExpressRequest } from 'express'
import { pipe } from 'fp-ts/function'
import * as E from 'fp-ts/Either'
import * as TE from 'fp-ts/TaskEither'
import { AuthChecker, Authorized } from 'type-graphql'

import { JWTPayload } from '@/ports/adapters/jwt'

import { authMiddleware } from '@/ports/adapters/http/http'
import { GraphQLError, GraphQLErrorInput } from './errors'

const repository = {
  async findOne (_id: string): Promise<void> {},
}

export const repositories = {
  Article: repository,
  User: repository,
  Profile: repository,
}

export type Request = ExpressRequest & {
  auth?: JWTPayload
}

export type Context = {
  req: Request,
  repositories: typeof repositories,
}

async function auth (req: Request) {
  const result = await authMiddleware(req.header('authorization'))()

  if (E.isLeft(result)) {
    throw new GraphQLError(result.left)
  }

  req.auth = result.right
}

async function tryAuth (req: Request) {
  return pipe(
    authMiddleware(req.header('authorization')),
    TE.map((payload) => {
      req.auth = payload
      return req
    }),
    TE.mapLeft(() => {
      req.auth = undefined
    }),
  )()
}

type Role =
  | 'HALF_PUBLIC'
  | 'PRIVATE'

export const authChecker: AuthChecker<Context, Role> = async ({ context }, roles) => {
  if (roles.includes('HALF_PUBLIC')) {
    await tryAuth(context.req)
    return true
  }

  await auth(context.req)
  return !!context.req.auth?.id
}

export const Auth = (...roles: Role[]) => Authorized(...roles)

type GraphQLMapResult = <E extends GraphQLErrorInput, A, B>
  (mapFn: (a: A) => B) => (either: TE.TaskEither<E, A>) => Promise<B>

export const graphQLMapResult: GraphQLMapResult = (mapFn) => async (either) => {
  const result = await pipe(
    either,
    TE.map(mapFn),
  )()

  if (E.isLeft(result)) {
    throw new GraphQLError(result.left)
  }

  return result.right
}
