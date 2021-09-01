import * as article from '@/core/article/use-cases/register-article-adapter'
import * as comment from '@/core/article/use-cases/add-comment-to-an-article-adapter'
import { AuthorId } from '@/core/article/types'

import { database as db } from './db'

export const createUserInDB = db.createUserInDB
export const login = db.login

export const getCurrentUser = async (userId: AuthorId) => {
  const user = await db.getCurrentUser(userId)

  if (!user) {
    throw new Error('User does not exist')
  }

  return user
}

export const createArticleInDB: article.OutsideRegisterArticle = async (data) => {
  const registeredArticle = await db.createArticleInDB(data)
  const { authorId, ...articleWithoutAuthorID } = registeredArticle.article

  return {
    article: {
      ...articleWithoutAuthorID,
      favorited: false,
      author: registeredArticle.author,
    },
  }
}

export const addCommentToAnArticleInDB: comment.OutsideCreateComment = async (data) => {
  const registeredComment = await db.addCommentToAnArticleInDB(data)
  const { authorId, articleId, ...comment } = registeredComment.comment

  return {
    comment: {
      ...comment,
      author: registeredComment.author,
    },
  }
}
