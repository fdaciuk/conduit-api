import argon2 from 'argon2'
import { CreateUser, UpdateUser, LoginUser } from '@/core/user/types'
import {
  ValidationError,
} from '@/helpers/errors'
import { database as db } from '../db'
import { DBUser } from '../types'

type CreateUserInDB = (data: CreateUser) => Promise<DBUser>
export const createUserInDB: CreateUserInDB = async (data) => {
  const password = await argon2.hash(data.password)

  return db.createUserInDB({
    ...data,
    password,
  })
}

type Login = (data: LoginUser) => Promise<DBUser>
export const login: Login = async (data) => {
  const user = await db.login(data)

  if (!user || !(await argon2.verify(user.password, data.password))) {
    throw new ValidationError('Invalid email or password')
  }

  const { bio, image, ...result } = user

  return result
}

type UpdateUserInDB = (id: string) => (data: UpdateUser) => Promise<DBUser>
export const updateUserInDB: UpdateUserInDB = (id) => async (data) => {
  const password = data.password
    ? (await argon2.hash(data.password))
    : undefined

  return db.updateUserInDB(id)({
    ...data,
    password,
  })
}

export const getCurrentUser = db.getCurrentUserFromDB
export const getProfile = db.getProfileFromDB
export const followUser = db.followUser
export const unfollowUser = db.unfollowUser
