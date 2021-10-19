import slugify from 'slugify'
import { CreateArticle, ArticleOutput } from '@/core/article/types'
import { CreateComment, CommentOutput } from '@/core/comment/types'
import { ArticlesFilter } from '@/ports/adapters/http/types'
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

export const getArticlesFromDB = async (filter: ArticlesFilter) => {
  const articles = await db.getArticlesFromDB(filter)

  return articles.map(article => ({
    ...article,
    author: {
      username: article.author.username,
      bio: article.author.bio ?? '',
      image: article.author.image ?? '',
      following: false,
    },
  }))
}

type FavoriteArticleInput = {
  slug: string
  userId: string
}

type FavoriteArticleInDB = (data: FavoriteArticleInput) => Promise<ArticleOutput>
export const favoriteArticleInDB: FavoriteArticleInDB = async (data) => {
  const article = await db.favoriteArticleInDB(data)

  return {
    ...article,
    author: {
      username: article.author.username,
      bio: article.author.bio ?? '',
      image: article.author.image ?? '',
      following: false,
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
      following: false,
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
