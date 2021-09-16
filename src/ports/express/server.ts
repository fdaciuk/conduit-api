import { Request as ExpressRequest, Response, NextFunction } from 'express'
import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import { authMiddleware } from '@/ports/adapters/http/http'
import { JWTPayload } from '@/ports/adapters/jwt'

export type Request = ExpressRequest & {
  auth?: JWTPayload
}

export async function auth (req: Request, res: Response, next: NextFunction) {
  pipe(
    authMiddleware(req.header('authorization')),
    TE.map((payload) => {
      req.auth = payload
      return next()
    }),
    TE.mapLeft(result => res.status(result.code).json(result.error)),
  )()
}

export async function tryAuth (req: Request, _res: Response, next: NextFunction) {
  pipe(
    authMiddleware(req.header('authorization')),
    TE.map((payload) => {
      req.auth = payload
      return next()
    }),
    TE.mapLeft(() => {
      req.auth = undefined
      return next()
    }),
  )()
}
