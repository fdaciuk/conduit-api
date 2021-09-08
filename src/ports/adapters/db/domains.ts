import { database as db } from './db'

export const createUserInDB = db.createUserInDB
export const updateUserInDB = db.updateUserInDB
export const login = db.login

export const getCurrentUser = db.getCurrentUserFromDB
export const getProfile = db.getProfileFromDB

export const createArticleInDB = db.createArticleInDB
export const addCommentToAnArticleInDB = db.addCommentToAnArticleInDB
