import fastify, {
  FastifyRequest,
  FastifyReply,
  HookHandlerDoneFunction,
} from 'fastify'
import fastifyCors from 'fastify-cors'
import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import { env } from '@/helpers/env'
import { Slug } from '@/core/types/slug'
import { CreateUser, LoginUser } from '@/core/user/types'
import { CreateArticle } from '@/core/article/types'
import { CreateComment } from '@/core/comment/types'
import { authMiddleware } from '@/ports/adapters/http/http'
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

app.register(fastifyCors, { origin: true })

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
    TE.mapLeft((error) => reply.code(401).send(error)),
  )()
}

const authOptions = { preValidation: auth }

app.get('/api/user', authOptions, (req, reply) => {
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

app.post<ApiArticles>('/api/articles', authOptions, (req, reply) => {
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

app.post<ApiAddComment>('/api/articles/:slug/comments', authOptions, (req, reply) => {
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
