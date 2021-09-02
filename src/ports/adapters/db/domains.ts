import { database as db } from './db'

export const createUserInDB = db.createUserInDB
export const login = db.login

export const getCurrentUser = async (userId: string) => {
  const user = await db.getCurrentUser(userId)

  if (!user) {
    throw new Error('User does not exist')
  }

  return user
}

export const createArticleInDB = db.createArticleInDB
export const addCommentToAnArticleInDB = db.addCommentToAnArticleInDB
