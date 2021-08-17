import fastify, {
  RouteShorthandOptions,
  RawReplyDefaultExpression,
} from 'fastify'
import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import { env } from '@/helpers/env'
import { CreateUser, LoginUser } from '@/core/user/types'
import { CreateArticle, AuthorId } from '@/core/article/types'
import { getError } from '@/ports/adapters/http/http'
import * as user from '@/ports/adapters/http/modules/user'
import * as article from '@/ports/adapters/http/modules/article'
import { verifyToken, JWTPayload } from '@/ports/adapters/jwt'
import http from 'http'

type CustomRequest = http.IncomingMessage & {
  auth?: JWTPayload
}

const app = fastify<http.Server, CustomRequest>({ logger: true })

const PORT = env('PORT')

type ApiUsers = {
  Body: {
    user: CreateUser
  }
}

app.post<ApiUsers>('/api/users', async (req, reply) => {
  return pipe(
    req.body.user,
    user.registerUser,
    TE.map(result => reply.send(result)),
    TE.mapLeft(error => reply.status(422).send(error)),
  )()
})

type UsersLogin = {
  Body: {
    user: LoginUser
  }
}

app.post<UsersLogin>('/api/users/login', async (req, reply) => {
  return pipe(
    req.body.user,
    user.login,
    TE.map(result => reply.send(result)),
    TE.mapLeft(error => reply.status(422).send(error)),
  )()
})

type ApiArticles = {
  Body: {
    article: CreateArticle
  }
}

type FastifyOptions = RouteShorthandOptions<
  http.Server,
  CustomRequest,
  RawReplyDefaultExpression<http.Server>,
  ApiArticles
>

const articleOptions: FastifyOptions = {
  preValidation: async (req, reply, done) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '') ?? ''
      const payload = await verifyToken(token)
      req.raw.auth = payload
      done()
    } catch {
      reply.status(401).send(getError('Unauthorized'))
    }
  },
}

app.post<ApiArticles>('/api/articles', articleOptions, async (req, reply) => {
  const payload = req.raw.auth
  const idProp = 'id'

  const data = {
    ...req.body.article,
    // TODO: Try to remove type assertion
    authorId: payload?.[idProp] as AuthorId,
  }

  return pipe(
    data,
    article.registerArticle,
    TE.map(result => reply.send(result)),
    TE.mapLeft(error => reply.status(422).send(error)),
  )()
})

export async function start () {
  try {
    await app.listen(PORT)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}
