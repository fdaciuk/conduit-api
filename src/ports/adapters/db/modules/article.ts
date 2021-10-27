import slugify from 'slugify'
import { CreateArticle } from '@/core/article/types'
import { CreateComment, CommentOutput } from '@/core/comment/types'
import {
  ArticlesFilter,
  FavoriteArticleInput,
} from '@/ports/adapters/http/types'
import { database as db } from '../db'
import { DBArticle } from '../types'

type CreateArticleInDB = (data: CreateArticle) => Promise<DBArticle>
export const createArticleInDB: CreateArticleInDB = async (data) => {
  const slug = slugify(data.title, { lower: true })

  const article = await db.createArticleInDB({
    ...data,
    slug,
  })

  return {
    ...article,
    favoritesCount: 0,
    author: {
      username: article.author.username,
      bio: article.author.bio ?? '',
      image: article.author.image ?? '',
      following: false,
    },
  }
}

type FetchArticleInput = {
  slug: string
  userId: string
}

export const getArticleFromDB = async (data: FetchArticleInput) => {
  const article = await db.getArticleFromDB(data)

  return {
    ...article,
    favoritesCount: 0,
    author: {
      username: article.author.username,
      bio: article.author.bio ?? '',
      image: article.author.image ?? '',
      following: article.author.following,
    },
  }
}

type GetArticlesFromDBInput = {
  filter: ArticlesFilter
  userId: string
}

type GetArticlesFromDB = (input: GetArticlesFromDBInput) => Promise<DBArticle[]>
export const getArticlesFromDB: GetArticlesFromDB = async ({ filter, userId }) => {
  const articles = await db.getArticlesFromDB({ filter, userId })

  return articles.map(article => ({
    ...article,
    author: {
      username: article.author.username,
      bio: article.author.bio ?? '',
      image: article.author.image ?? '',
      following: article.author.following,
    },
  }))
}

type GetArticlesFeedFromDB = (input: GetArticlesFromDBInput) => Promise<DBArticle[]>
export const getArticlesFeedFromDB: GetArticlesFeedFromDB = async ({ filter, userId }) => {
  const articles = await db.getArticlesFeedFromDB({ filter, userId })

  return articles.map(article => ({
    ...article,
    author: {
      username: article.author.username,
      bio: article.author.bio ?? '',
      image: article.author.image ?? '',
      following: true,
    },
  }))
}

type FavoriteArticleInDB = (data: FavoriteArticleInput) => Promise<DBArticle>
export const favoriteArticleInDB: FavoriteArticleInDB = async (data) => {
  const article = await db.favoriteArticleInDB(data)

  return {
    ...article,
    author: {
      username: article.author.username,
      bio: article.author.bio ?? '',
      image: article.author.image ?? '',
      following: article.author.following,
    },
  }
}

export const unfavoriteArticleInDB: FavoriteArticleInDB = async (data) => {
  const article = await db.unfavoriteArticleInDB(data)

  return {
    ...article,
    author: {
      username: article.author.username,
      bio: article.author.bio ?? '',
      image: article.author.image ?? '',
      following: article.author.following,
    },
  }
}

type AddCommentToAnArticleInDB = (data: CreateComment) => Promise<CommentOutput>
export const addCommentToAnArticleInDB: AddCommentToAnArticleInDB = async (data) => {
  const comment = await db.addCommentToAnArticleInDB(data)

  return {
    id: comment.id,
    body: comment.body,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    author: {
      username: comment.author.username,
      bio: comment.author.bio ?? '',
      image: comment.author.image ?? '',
      following: false,
    },
  }
}

type GetCommentsFromAnArticleInput = {
  slug: string
  userId: string
}

export const getCommentsFromAnArticleInDB = async (data: GetCommentsFromAnArticleInput) => {
  const comments = await db.getCommentsFromAnArticleInDB(data)

  return comments.map(comment => ({
    id: comment.id,
    body: comment.body,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    author: {
      username: comment.author.username,
      bio: comment.author.bio ?? '',
      image: comment.author.image ?? '',
      following: comment.author.following,
    },
  }))
}

export const getTagsFromDB = db.getTagsFromDB
