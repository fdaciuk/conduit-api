import slugify from 'slugify'
import { CreateArticle } from '@/core/article/types'
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

export const addCommentToAnArticleInDB = db.addCommentToAnArticleInDB
