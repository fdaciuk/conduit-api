import argon2 from 'argon2'
import { CreateUser, UpdateUser, LoginUserOutput } from '@/core/user/types'
import {
  ValidationError,
  NotFoundError,
} from '@/helpers/errors'
import { database as db } from '../db'
import { DBUser } from '../types'

type CreateUserInDB = (data: CreateUser) => Promise<DBUser>
export const createUserInDB: CreateUserInDB = async (data) => {
  const email = data.email.toLowerCase()
  const password = await argon2.hash(data.password)

  const newUser = await db.createUserInDB({
    ...data,
    email,
    password,
  })

  return {
    ...newUser,
    bio: newUser.bio ?? undefined,
    image: newUser.image ?? undefined,
  }
}

type Login = (data: LoginUserOutput) => Promise<DBUser>
export const login: Login = async (data) => {
  const email = data.email.toLowerCase()
  const user = await db.login({ email, password: data.password })

  if (!user || !(await argon2.verify(user.password, data.password))) {
    throw new ValidationError('Invalid email or password')
  }

  const { bio, image, ...result } = user

  return result
}

type UpdateUserInDB = (id: string) => (data: UpdateUser) => Promise<DBUser>
export const updateUserInDB: UpdateUserInDB = (id) => async (data) => {
  const email = data.email
    ? data.email.toLowerCase()
    : undefined

  const password = data.password
    ? (await argon2.hash(data.password))
    : undefined

  const updatedUser = await db.updateUserInDB(id)({
    ...data,
    email,
    password,
  })

  return {
    ...updatedUser,
    bio: updatedUser.bio ?? undefined,
    image: updatedUser.image ?? undefined,
  }
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

type UnfollowUserInput = {
  userToUnfollow: string
  userId: string
}

type UnfollowUser = (input: UnfollowUserInput) => Promise<DBUser>
export const unfollowUser: UnfollowUser = async (input) => {
  const profile = await db.unfollowUser(input)

  return {
    ...profile,
    bio: profile.bio ?? undefined,
    image: profile.image ?? undefined,
  }
}
