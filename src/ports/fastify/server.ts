import fastify, {
  RouteShorthandOptions,
  RawReplyDefaultExpression,
  FastifyRequest,
  FastifyReply,
  HookHandlerDoneFunction,
} from 'fastify'
import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'
import { env } from '@/helpers/env'
import { Slug } from '@/core/types/slug'
import { CreateUser, LoginUser } from '@/core/user/types'
import { CreateArticle } from '@/core/article/types'
import { CreateComment } from '@/core/comment/types'
import { getError, getToken } from '@/ports/adapters/http/http'
import * as user from '@/ports/adapters/http/modules/user'
import * as article from '@/ports/adapters/http/modules/article'
import { JWTPayload } from '@/ports/adapters/jwt'
import http from 'http'

type CustomRequest = http.IncomingMessage & {
  auth: JWTPayload
}

const app = fastify<http.Server, CustomRequest>({ logger: true })

const PORT = env('PORT')

type ApiUsers = {
  Body: {
    user: CreateUser
  }
}

app.post<ApiUsers>('/api/users', (req, reply) => {
  pipe(
    req.body.user,
    user.registerUser,
    TE.map(result => reply.send(result)),
    TE.mapLeft(error => reply.code(422).send(error)),
  )()
})

type UsersLogin = {
  Body: {
    user: LoginUser
  }
}

app.post<UsersLogin>('/api/users/login', (req, reply) => {
  pipe(
    req.body.user,
    user.login,
    TE.map(result => reply.send(result)),
    TE.mapLeft(error => reply.code(422).send(error)),
  )()
})

const auth = <T>(
  req: FastifyRequest<T, http.Server, CustomRequest>,
  reply: FastifyReply,
  done: HookHandlerDoneFunction,
) => {
  pipe(
    TE.tryCatch(
      () => getToken(req.headers.authorization),
      E.toError,
    ),
    TE.map((payload) => {
      req.raw.auth = payload
      return done()
    }),
    TE.mapLeft(() => reply.code(401).send(getError('Unauthorized'))),
  )()
}

// TODO: Tentar abstrair esses tipos do Fastify, tá muito feio
type FastifyApiGetCurrentUser = RouteShorthandOptions<
  http.Server,
  CustomRequest,
  RawReplyDefaultExpression<http.Server>
>

const getCurrentUserOptions: FastifyApiGetCurrentUser = {
  preValidation: (...args) => auth(...args),
}

app.get('/api/user', getCurrentUserOptions, (req, reply) => {
  pipe(
    user.getCurrentUser({
      payload: req.raw.auth,
      authHeader: req.headers.authorization,
    }),
    TE.map(result => reply.send(result)),
    TE.mapLeft(error => reply.code(422).send(error)),
  )()
})

type ApiArticles = {
  Body: {
    article: CreateArticle
  }
}

type FastifyApiArticleOptions = RouteShorthandOptions<
  http.Server,
  CustomRequest,
  RawReplyDefaultExpression<http.Server>,
  ApiArticles
>

const articleApiOptions: FastifyApiArticleOptions = {
  preValidation: (...args) => auth<ApiArticles>(...args),
}

app.post<ApiArticles>('/api/articles', articleApiOptions, (req, reply) => {
  const data = {
    ...req.body.article,
    authorId: req.raw.auth.id,
  }

  pipe(
    data,
    article.registerArticle,
    TE.map(result => reply.send(result)),
    TE.mapLeft(error => reply.code(422).send(error)),
  )()
})

type ApiAddComment = {
  Body: {
    comment: CreateComment
  }

  Params: {
    slug: Slug
  }
}

type FastifyApiAddCommentOptions = RouteShorthandOptions<
  http.Server,
  CustomRequest,
  RawReplyDefaultExpression<http.Server>,
  ApiAddComment
>

const addCommentOptions: FastifyApiAddCommentOptions = {
  preValidation: (...args) => auth<ApiAddComment>(...args),
}

app.post<ApiAddComment>('/api/articles/:slug/comments', addCommentOptions, (req, reply) => {
  const data = {
    ...req.body.comment,
    authorId: req.raw.auth.id,
    articleSlug: req.params.slug,
  }

  pipe(
    data,
    article.addCommentToAnArticle,
    TE.map(result => reply.send(result)),
    TE.mapLeft(error => reply.code(422).send(error)),
  )()
})

export async function start () {
  try {
    await app.listen(PORT, '0.0.0.0')
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}
