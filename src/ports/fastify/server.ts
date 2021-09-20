import fastify, {
  FastifyRequest,
  FastifyReply,
  HookHandlerDoneFunction,
} from 'fastify'
import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import { authMiddleware } from '@/ports/adapters/http/http'
import { JWTPayload } from '@/ports/adapters/jwt'
import http from 'http'

type CustomRequest = http.IncomingMessage & {
  auth?: JWTPayload
}

export const app = fastify<http.Server, CustomRequest>({ logger: true })

type AuthPreValidation = <T>(
  req: FastifyRequest<T, http.Server, CustomRequest>,
  reply: FastifyReply,
  done: HookHandlerDoneFunction,
) => void

const auth: AuthPreValidation = (req, reply, done) => {
  pipe(
    authMiddleware(req.headers.authorization),
    TE.map((payload) => {
      req.raw.auth = payload
      return done()
    }),
    TE.mapLeft(result => reply.code(result.code).send(result.error)),
  )()
}

export const authOptions = { preValidation: auth }

const tryAuth: AuthPreValidation = (req, _reply, done) => {
  pipe(
    authMiddleware(req.headers.authorization),
    TE.map((payload) => {
      req.raw.auth = payload
      return done()
    }),
    TE.mapLeft(() => {
      req.raw.auth = undefined
      return done()
    }),
  )()
}

export const tryAuthOptions = { preValidation: tryAuth }
