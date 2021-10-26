import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'
import { CreateArticle, ArticleOutput } from '@/core/article/types'
import { CreateComment, CommentOutput } from '@/core/comment/types'
import { TagOutput } from '@/core/tag/types'
import * as db from '@/ports/adapters/db'
import * as article from '@/core/article/use-cases'

import { getError } from '@/ports/adapters/http/http'
import { DBArticle } from '@/ports/adapters/db/types'

import {
  ArticlesFilter,
  PaginationFilter,
  FavoriteArticleInput,
} from '../types'

export function registerArticle (data: CreateArticle) {
  return pipe(
    data,
    article.registerArticle(db.createArticleInDB),
    TE.map(getArticleResponse),
    TE.mapLeft(getError),
  )
}

type FetchArticlesInput = {
  filter: ArticlesFilter
  userId: string
}

export function fetchArticles ({ filter, userId }: FetchArticlesInput) {
  return pipe(
    TE.tryCatch(
      () => db.getArticlesFromDB({ filter, userId }),
      E.toError,
    ),
    TE.map(getArticlesResponse),
    TE.mapLeft(getError),
  )
}

type FetchArticlesFeedInput = {
  filter: PaginationFilter
  userId: string
}

export function fetchArticlesFeed ({ filter, userId }: FetchArticlesFeedInput) {
  return pipe(
    TE.tryCatch(
      () => db.getArticlesFeedFromDB({ filter, userId }),
      E.toError,
    ),
    TE.map(getArticlesResponse),
    TE.mapLeft(getError),
  )
}

export function favoriteArticle (data: FavoriteArticleInput) {
  return pipe(
    TE.tryCatch(
      () => db.favoriteArticleInDB(data),
      E.toError,
    ),
    TE.map(getArticleResponse),
    TE.mapLeft(getError),
  )
}

export function unfavoriteArticle (data: FavoriteArticleInput) {
  return pipe(
    TE.tryCatch(
      () => db.unfavoriteArticleInDB(data),
      E.toError,
    ),
    TE.map(getArticleResponse),
    TE.mapLeft(getError),
  )
}

function getArticlesResponse (articles: DBArticle[]) {
  return {
    articles,
    articlesCount: articles.length,
  }
}

export function addCommentToAnArticle (data: CreateComment) {
  return pipe(
    data,
    article.addCommentToAnArticle(db.addCommentToAnArticleInDB),
    TE.map(getCommentResponse),
    TE.mapLeft(getError),
  )
}

export function getTags () {
  return pipe(
    TE.tryCatch(
      () => db.getTagsFromDB(),
      E.toError,
    ),
    TE.map(getTagsResponse),
    TE.mapLeft(getError),
  )
}

type GetArticleResponseInput = Omit<ArticleOutput, 'favorited'> & {
  authorId: string
}

const getArticleResponse = (article: GetArticleResponseInput) => {
  const { authorId, ...articleResponse } = article
  return {
    article: articleResponse,
  }
}

const getCommentResponse = (comment: CommentOutput) => {
  return {
    comment,
  }
}

const getTagsResponse = (tags: TagOutput[]) => {
  return {
    tags,
  }
}
