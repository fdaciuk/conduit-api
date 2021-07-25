import * as user from '@/adapters/use-cases/user/register-user-adapter'
import * as article from '@/adapters/use-cases/article/register-article-adapter'
import * as comment from '@/adapters/use-cases/article/add-comment-to-an-article-adapter'
import * as jwt from '@/adapters/ports/jwt'

import * as db from '@/ports/db-in-memory'

export const createUserInDB: user.OutsideRegisterUser = async (data) => {
  const registeredUser = await db.createUserInDB(data)

  const token = await jwt.generateToken({ id: registeredUser.id })

  return {
    user: {
      username: registeredUser.username,
      email: registeredUser.email,
      bio: '',
      image: undefined,
      token,
    },
  }
}

export const createArticleInDB: article.OutsideRegisterArticle = async (data) => {
  const registeredArticle = await db.createArticleInDB(data)
  const { authorId, ...articleWithoutAuthorID } = registeredArticle.article

  return {
    article: {
      ...articleWithoutAuthorID,
      favorited: false,
    },
    author: registeredArticle.author,
  }
}

export const addCommentToAnArticleInDB: comment.OutsideCreateComment = (data) => {
  return db.addCommentToAnArticleInDB(data)
}
