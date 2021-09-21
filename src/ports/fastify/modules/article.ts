import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import { Slug } from '@/core/types/slug'
import { CreateArticle } from '@/core/article/types'
import { CreateComment } from '@/core/comment/types'
import { getPayload } from '@/ports/adapters/http/http'
import * as article from '@/ports/adapters/http/modules/article'

import { app, authOptions } from '../server'

type CreateArticleApi = {
  Body: {
    article: CreateArticle
  }
}

app.post<CreateArticleApi>('/api/articles', authOptions, (req, reply) => {
  const payload = getPayload(req.raw.auth)

  const data = {
    ...req.body.article,
    authorId: payload.id,
  }

  pipe(
    data,
    article.registerArticle,
    TE.map(result => reply.send(result)),
    TE.mapLeft(result => reply.code(result.code).send(result.error)),
  )()
})

app.get('/api/articles', (_req, reply) => {
  pipe(
    article.fetchArticles(),
    TE.map(result => reply.send(result)),
    TE.mapLeft(result => reply.code(result.code).send(result.error)),
  )()
})

type AddCommentApi = {
  Body: {
    comment: CreateComment
  }

  Params: {
    slug: Slug
  }
}

app.post<AddCommentApi>('/api/articles/:slug/comments', authOptions, (req, reply) => {
  const payload = getPayload(req.raw.auth)

  const data = {
    ...req.body.comment,
    authorId: payload.id,
    articleSlug: req.params.slug,
  }

  pipe(
    data,
    article.addCommentToAnArticle,
    TE.map(result => reply.send(result)),
    TE.mapLeft(result => reply.code(result.code).send(result.error)),
  )()
})
