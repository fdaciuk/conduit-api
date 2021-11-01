import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'
import {
  CreateArticle,
  UpdateArticle,
  ArticleOutput,
} from '@/core/article/types'
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

export function updateArticle (data: UpdateArticle) {
  return pipe(
    data,
    article.updateArticle(db.updateArticleInDB),
    TE.map(getArticleResponse),
    TE.mapLeft(getError),
  )
}

type FetchArticleInput = {
  slug: string
  userId: string
}

export function fetchArticle (data: FetchArticleInput) {
  return pipe(
    TE.tryCatch(
      () => db.getArticleFromDB(data),
      E.toError,
    ),
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

type DeleteArticleInput = {
  slug: string
  userId: string
}

export function deleteArticle (data: DeleteArticleInput) {
  return pipe(
    TE.tryCatch(
      () => db.deleteArticleFromDB(data),
      E.toError,
    ),
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

type GetCommentsFromAnArticleInput = {
  slug: string
  userId: string
}

export function getCommentsFromAnArticle (data: GetCommentsFromAnArticleInput) {
  return pipe(
    TE.tryCatch(
      () => db.getCommentsFromAnArticleInDB(data),
      E.toError,
    ),
    TE.map(getCommentsResponse),
    TE.mapLeft(getError),
  )
}

type DeleteCommentInput = {
  slug: string
  commentId: number
  userId: string
}

export function deleteComment (data: DeleteCommentInput) {
  return pipe(
    TE.tryCatch(
      () => db.deleteCommentFromDB(data),
      E.toError,
    ),
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

const getCommentsResponse = (comments: CommentOutput[]) => {
  return {
    comments,
  }
}

const getTagsResponse = (tags: TagOutput[]) => {
  return {
    tags,
  }
}
