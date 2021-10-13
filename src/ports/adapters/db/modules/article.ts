import slugify from 'slugify'
import { CreateArticle } from '@/core/article/types'
import { CreateComment, CommentOutput } from '@/core/comment/types'
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

export const getArticlesFromDB = async () => {
  const articles = await db.getArticlesFromDB()
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