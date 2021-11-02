import { pipe, identity } from 'fp-ts/function'
import * as E from 'fp-ts/Either'
import * as TE from 'fp-ts/TaskEither'
import * as article from '@/ports/adapters/http/modules/article'
import { getPayload } from '@/ports/adapters/http/http'
import { CreateArticle, UpdateArticle } from '@/core/article/types'
import { CreateComment } from '@/core/comment/types'
import { Slug } from '@/core/types'
import { Routes, httpResponse } from '../server'
import { withAuth, withTryAuth } from '../middlewares'

type GetPropFromRequestBody = <T>(data: string, prop: string) => T
const getPropFromRequestBody: GetPropFromRequestBody = (data, prop) => {
  return pipe(
    E.tryCatch(
      () => JSON.parse(data),
      E.toError,
    ),
    E.fold(identity, (body) => body[prop] ?? {}),
  )
}

const articleRoutes: Routes = {
  'POST /api/articles': withAuth(async (request, response) => {
    const payload = getPayload(request.auth)

    for await (const body of request) {
      const data = {
        ...getPropFromRequestBody<CreateArticle>(body, 'article'),
        authorId: payload.id,
      }

      pipe(
        data,
        article.registerArticle,
        TE.map(result => httpResponse(response, result)),
        TE.mapLeft(result => httpResponse(response, result.error, result.code)),
      )()
    }
  }),

  'GET /api/articles/:slug': withTryAuth(async (request, response) => {
    const payload = getPayload(request.auth)
    const slug = 'slug'

    pipe(
      article.fetchArticle({
        slug: request.params?.[slug] ?? '',
        userId: payload.id,
      }),
      TE.map(result => httpResponse(response, result)),
      TE.mapLeft(result => httpResponse(response, result.error, result.code)),
    )()
  }),

  'GET /api/articles': withTryAuth(async (request, response) => {
    const payload = getPayload(request.auth)

    pipe(
      article.fetchArticles({
        filter: request.query ?? {},
        userId: payload.id,
      }),
      TE.map(result => httpResponse(response, result)),
      TE.mapLeft(result => httpResponse(response, result.error, result.code)),
    )()
  }),

  'PUT /api/articles/:slug': withAuth(async (request, response) => {
    const payload = getPayload(request.auth)
    const slug = 'slug'

    for await (const body of request) {
      const data: UpdateArticle = {
        ...getPropFromRequestBody<UpdateArticle>(body, 'article'),
        slug: request.params?.[slug] as Slug,
        authorId: payload.id,
      }

      pipe(
        data,
        article.updateArticle,
        TE.map(result => httpResponse(response, result)),
        TE.mapLeft(result => httpResponse(response, result.error, result.code)),
      )()
    }
  }),

  'DELETE /api/articles/:slug': withAuth(async (request, response) => {
    const payload = getPayload(request.auth)
    const slug = 'slug'

    pipe(
      article.deleteArticle({
        slug: request.params?.[slug] ?? '',
        userId: payload.id,
      }),
      TE.map(() => httpResponse(response)),
      TE.mapLeft(result => httpResponse(response, result.error, result.code)),
    )()
  }),

  'GET /api/articles/feed': withAuth(async (request, response) => {
    const payload = getPayload(request.auth)

    pipe(
      article.fetchArticlesFeed({
        filter: request.query || {},
        userId: payload.id,
      }),
      TE.map(result => httpResponse(response, result)),
      TE.mapLeft(result => httpResponse(response, result.error, result.code)),
    )()
  }),

  'POST /api/articles/:slug/favorite': withAuth(async (request, response) => {
    const payload = getPayload(request.auth)
    const slug = 'slug'

    pipe(
      article.favoriteArticle({
        userId: payload.id,
        slug: request.params?.[slug] ?? '',
      }),
      TE.map(result => httpResponse(response, result)),
      TE.mapLeft(result => httpResponse(response, result.error, result.code)),
    )()
  }),

  'DELETE /api/articles/:slug/favorite': withAuth(async (request, response) => {
    const payload = getPayload(request.auth)
    const slug = 'slug'

    pipe(
      article.unfavoriteArticle({
        userId: payload.id,
        slug: request.params?.[slug] ?? '',
      }),
      TE.map(result => httpResponse(response, result)),
      TE.mapLeft(result => httpResponse(response, result.error, result.code)),
    )()
  }),

  'POST /api/articles/:slug/comments': withAuth(async (request, response) => {
    const payload = getPayload(request.auth)
    const slug = 'slug'

    for await (const body of request) {
      const data: CreateComment = {
        ...getPropFromRequestBody<CreateComment>(body, 'comment'),
        authorId: payload.id,
        articleSlug: request.params?.[slug] as Slug,
      }

      pipe(
        data,
        article.addCommentToAnArticle,
        TE.map(result => httpResponse(response, result)),
        TE.mapLeft(result => httpResponse(response, result.error, result.code)),
      )()
    }
  }),

  'GET /api/articles/:slug/comments': withTryAuth(async (request, response) => {
    const payload = getPayload(request.auth)
    const slug = 'slug'

    const data = {
      slug: request.params?.[slug] ?? '',
      userId: payload.id,
    }

    pipe(
      data,
      article.getCommentsFromAnArticle,
      TE.map(result => httpResponse(response, result)),
      TE.mapLeft(result => httpResponse(response, result.error, result.code)),
    )()
  }),

  'DELETE /api/articles/:slug/comments/:id': withAuth(async (request, response) => {
    const payload = getPayload(request.auth)
    const slug = 'slug'
    const id = 'id'

    const data = {
      commentId: Number(request.params?.[id]),
      slug: request.params?.[slug] ?? '',
      userId: payload.id,
    }

    pipe(
      data,
      article.deleteComment,
      TE.map(() => httpResponse(response)),
      TE.mapLeft(result => httpResponse(response, result.error, result.code)),
    )()
  }),

  'GET /api/tags': async (_request, response) => {
    pipe(
      article.getTags(),
      TE.map(result => httpResponse(response, result)),
      TE.mapLeft(result => httpResponse(response, result.error, result.code)),
    )()
  },
}

export { articleRoutes }
