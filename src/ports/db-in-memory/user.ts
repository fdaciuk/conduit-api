import { v4 as uuidv4 } from 'uuid'
import {
  ValidationError,
  NotFoundError,
  ForbiddenError,
} from '@/helpers/errors'
import {
  CreateUserInDB,
  Login,
  UpdateUserInDB,
  GetCurrentUserFromDB,
  GetProfileFromDB,
  FollowUser,
  UnfollowUser,
} from '@/ports/adapters/db/types'
import { dbInMemory as db } from './db'

export const createUserInDB: CreateUserInDB = async (data) => {
  if (db.usersByEmail[data.email]) {
    throw new ValidationError('User already registered')
  }

  const id = uuidv4()

  db.usersByEmail[data.email] = id
  db.usersByUsername[data.username] = id

  const user = db.users[id] = {
    id,
    email: data.email,
    username: data.username,
    password: data.password,
  }

  return user
}

export const login: Login = async (data) => {
  const userId = db.usersByEmail[data.email]
  const user = db.users[userId ?? '']
  return user ?? null
}

export const updateUserInDB: UpdateUserInDB = (id) => async (data) => {
  const user = db.users[id]

  if (!user) {
    throw new NotFoundError('User does not exist')
  }

  if (
    data.email &&
    db.usersByEmail[data.email] &&
    db.usersByEmail[data.email] !== user.id
  ) {
    throw new ValidationError('This email is already in use')
  }

  if (
    data.username &&
    db.usersByUsername[data.username] &&
    db.usersByUsername[data.username] !== user.id
  ) {
    throw new ValidationError('This username is already in use')
  }

  const email = data.email ?? user.email
  delete db.usersByEmail[user.email]
  db.usersByEmail[email] = id

  const username = data.username ?? user.username
  delete db.usersByUsername[user.username]
  db.usersByUsername[username] = id

  const newUser = db.users[id] = {
    id: user.id,
    email,
    username,
    password: data.password ?? user.password,
    bio: data.bio ?? user.bio,
    image: data.image ?? user.image,
  }

  return newUser
}

export const getCurrentUserFromDB: GetCurrentUserFromDB = async (id) => {
  const user = db.users[id]
  return user ?? null
}

export const getProfileFromDB: GetProfileFromDB = async (username) => {
  const profileId = db.usersByUsername[username]
  const user = db.users[profileId ?? '']
  return user ?? null
}

export const followUser: FollowUser = async ({ userToFollow, userId }) => {
  const user = db.users[userId]

  if (!user) {
    throw new NotFoundError('User does not exist')
  }

  const userToFollowId = db.usersByUsername[userToFollow]
  const userToFollowData = db.users[userToFollowId ?? '']

  if (!userToFollowData || !userToFollowId) {
    throw new ForbiddenError(`User ${userToFollow} does not exist`)
  }

  if (userToFollowId === userId) {
    throw new ForbiddenError('You cannot follow yourself')
  }

  user.following = user.following ?? {}
  user.following[userToFollowId] = true

  userToFollowData.followers = userToFollowData.followers ?? {}
  userToFollowData.followers[userId] = true

  return userToFollowData
}

export const unfollowUser: UnfollowUser = async ({ userToUnfollow, userId }) => {
  const user = db.users[userId]

  if (!user) {
    throw new NotFoundError('User does not exist')
  }

  const userToUnfollowId = db.usersByUsername[userToUnfollow]
  const userToUnfollowData = db.users[userToUnfollowId ?? '']

  if (!userToUnfollowData || !userToUnfollowId) {
    throw new ForbiddenError(`User ${userToUnfollow} does not exist`)
  }

  if (userToUnfollowId === userId) {
    throw new ForbiddenError('You cannot unfollow yourself')
  }

  if (
    !user.following?.[userToUnfollowId] ||
    !userToUnfollowData.followers?.[userId]
  ) {
    throw new ForbiddenError(`You are not following ${userToUnfollow} yet`)
  }

  delete user.following[userToUnfollowId]
  delete userToUnfollowData.followers[userId]

  return userToUnfollowData
}
