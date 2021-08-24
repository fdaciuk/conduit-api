import fastify, {
  RouteShorthandOptions,
  RawReplyDefaultExpression,
  FastifyRequest,
  FastifyReply,
  HookHandlerDoneFunction,
} from 'fastify'
import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import { env } from '@/helpers/env'
import { Slug } from '@/core/types/slug'
import { CreateUser, LoginUser } from '@/core/user/types'
import { CreateArticle, AuthorId } from '@/core/article/types'
import { CreateComment } from '@/core/comment/types'
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
    TE.mapLeft(error => reply.code(422).send(error)),
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
    TE.mapLeft(error => reply.code(422).send(error)),
  )()
})

const auth = async <T>(
  req: FastifyRequest<T, http.Server, CustomRequest>,
  reply: FastifyReply,
  done: HookHandlerDoneFunction,
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') ?? ''
    const payload = await verifyToken(token)
    req.raw.auth = payload
    done()
  } catch {
    reply.code(401).send(getError('Unauthorized'))
  }
}

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

app.post<ApiArticles>('/api/articles', articleApiOptions, async (req, reply) => {
  const payload = req.raw.auth
  const idProp = 'id'

  const data = {
    ...req.body.article,
    authorId: payload?.[idProp] as AuthorId,
  }

  return pipe(
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

app.post<ApiAddComment>('/api/articles/:slug/comments', addCommentOptions, async (req, reply) => {
  const payload = req.raw.auth
  const idProp = 'id'

  const data = {
    ...req.body.comment,
    authorId: payload?.[idProp] as AuthorId,
    articleSlug: req.params.slug,
  }

  return pipe(
    data,
    article.addCommentToAnArticle,
    TE.map(result => reply.send(result)),
    TE.mapLeft(error => reply.code(422).send(error)),
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
