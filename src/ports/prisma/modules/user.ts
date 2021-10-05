import { User } from '@prisma/client'
import {
  CreateUserInDB,
  UpdateUserInDB,
  GetCurrentUserFromDB,
  GetProfileFromDB,
  Login,
} from '@/ports/adapters/db/types'
import {
  ValidationError,
  NotFoundError,
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
  return prisma.user.findUnique({
    where: { username },
  })
}
