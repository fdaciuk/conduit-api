import { Request as ExpressRequest } from 'express'
import { pipe } from 'fp-ts/function'
import * as E from 'fp-ts/Either'
import * as TE from 'fp-ts/TaskEither'
import { AuthChecker } from 'type-graphql'

import { JWTPayload } from '@/ports/adapters/jwt'

import { authMiddleware } from '@/ports/adapters/http/http'
import { GraphQLError } from './errors'

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

export const authChecker: AuthChecker<Context> = async ({ context }, roles) => {
  if (roles.includes('HALF_PUBLIC')) {
    await tryAuth(context.req)
    return true
  }

  await auth(context.req)
  return !!context.req.auth?.id
}
