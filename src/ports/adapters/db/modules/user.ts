import argon2 from 'argon2'
import { CreateUser, UpdateUser, LoginUser } from '@/core/user/types'
import {
  ValidationError,
  NotFoundError,
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

type GetCurrentUserFromDB = (id: string) => Promise<DBUser>
export const getCurrentUser: GetCurrentUserFromDB = async (id) => {
  const user = await db.getCurrentUserFromDB(id)

  if (!user) {
    throw new NotFoundError('User does not exist')
  }

  return {
    ...user,
    bio: user.bio ?? undefined,
    image: user.image ?? undefined,
  }
}

type GetProfileFromDB = (username: string) => Promise<DBUser>
export const getProfile: GetProfileFromDB = async (username) => {
  const user = await db.getProfileFromDB(username)

  if (!user) {
    throw new NotFoundError('User does not exist')
  }

  return {
    ...user,
    bio: user.bio ?? undefined,
    image: user.image ?? undefined,
  }
}

type FollowUserInput = {
  userToFollow: string
  userId: string
}

type FollowUser = (input: FollowUserInput) => Promise<DBUser>
export const followUser: FollowUser = async (input) => {
  const profile = await db.followUser(input)

  return {
    ...profile,
    bio: profile.bio ?? undefined,
    image: profile.image ?? undefined,
  }
}

export const unfollowUser = db.unfollowUser
