import { User, Follower } from '@prisma/client'
import {
  CreateUserInDB,
  UpdateUserInDB,
  GetCurrentUserFromDB,
  GetProfileFromDB,
  Login,
  FollowUser,
  UnfollowUser,
} from '@/ports/adapters/db/types'
import {
  ValidationError,
  NotFoundError,
  ForbiddenError,
  UnknownError,
} from '@/helpers/errors'
import { prisma } from '../prisma'

export const createUserInDB: CreateUserInDB<User> = async (data) => {
  try {
    const result = await prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        password: data.password,
      },
    })

    return result
  } catch (e) {
    throw new ValidationError('User already registered')
  }
}

export const login: Login<User> = (data) => {
  return prisma.user.findUnique({
    where: {
      email: data.email,
    },
  })
}

export const updateUserInDB: UpdateUserInDB<User> = (id) => async (data) => {
  try {
    const user = await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        email: data.email,
        password: data.password,
        username: data.username,
        bio: data.bio,
        image: data.image,
      },
    })

    return user
  } catch (e) {
    if (!(e instanceof Error)) {
      throw new UnknownError()
    }

    if (e.message.includes('constraint failed on the fields: (`email`)')) {
      throw new ValidationError('This email is already in use')
    }

    if (e.message.includes('constraint failed on the fields: (`username`)')) {
      throw new ValidationError('This username is already in use')
    }

    throw new NotFoundError('User does not exist')
  }
}

export const getCurrentUserFromDB: GetCurrentUserFromDB<User> = async (id) => {
  return prisma.user.findUnique({
    where: { id },
  })
}

export const getProfileFromDB: GetProfileFromDB<User> = async (username) => {
  const profile = await prisma.user.findUnique({
    where: { username },
    include: {
      following: true,
      whoIsFollowing: true,
    },
  })

  if (!profile) {
    throw new ForbiddenError(`User ${username} does not exist`)
  }

  return {
    ...profile,
    following: transformFollower('followingId', profile.following),
    followers: transformFollower('userId', profile.whoIsFollowing),
  }
}

export const followUser: FollowUser<User> = async ({ userToFollow, userId }) => {
  const userToFollowData = await prisma.user.findUnique({
    select: { id: true },
    where: { username: userToFollow },
  })

  if (!userToFollowData) {
    throw new ForbiddenError(`User ${userToFollow} does not exist`)
  }

  if (userToFollowData.id === userId) {
    throw new ForbiddenError('You cannot follow yourself')
  }

  try {
    await prisma.follower.create({
      data: {
        userId,
        followingId: userToFollowData.id,
      },
    })
  } catch (e) {}

  const profile = await prisma.user.findUnique({
    where: { username: userToFollow },
    include: {
      following: true,
      whoIsFollowing: true,
    },
  })

  if (!profile) {
    throw new ForbiddenError(`User ${userToFollow} does not exist`)
  }

  return {
    ...profile,
    following: transformFollower('followingId', profile.following),
    followers: transformFollower('userId', profile.whoIsFollowing),
  }
}

export const unfollowUser: UnfollowUser<User> = async ({ userToUnfollow, userId }) => {
  const userToUnfollowData = await prisma.user.findUnique({
    select: { id: true },
    where: { username: userToUnfollow },
  })

  if (!userToUnfollowData) {
    throw new ForbiddenError(`User ${userToUnfollow} does not exist`)
  }

  if (userToUnfollowData.id === userId) {
    throw new ForbiddenError('You cannot unfollow yourself')
  }

  try {
    await prisma.follower.deleteMany({
      where: {
        userId,
        followingId: userToUnfollowData.id,
      },
    })
  } catch (e) {}

  const profile = await prisma.user.findUnique({
    where: { username: userToUnfollow },
    include: {
      following: true,
      whoIsFollowing: true,
    },
  })

  if (!profile) {
    throw new ForbiddenError(`User ${userToUnfollow} does not exist`)
  }

  return {
    ...profile,
    following: transformFollower('followingId', profile.following),
    followers: transformFollower('userId', profile.whoIsFollowing),
  }
}

type Field = keyof Follower
type HashmapStrBool = { [key: string]: boolean }

function transformFollower (field: Field, data: Follower[]) {
  return data.reduce<HashmapStrBool>((acc, f) => {
    acc[f[field]] = true
    return acc
  }, {})
}
