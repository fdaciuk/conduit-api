import { User } from '@prisma/client'
import { CreateUserInDB, UpdateUserInDB } from '@/ports/adapters/db/types'
import { LoginUser } from '@/core/user/types'
import {
  ValidationError,
  NotFoundError,
} from '@/helpers/errors'
import { prisma } from '../prisma'

export const createUserInDB: CreateUserInDB = async (data) => {
  try {
    const result = await prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        password: data.password,
      },
    })

    const { bio, image, ...resultWithoutBioAndImage } = result
    return resultWithoutBioAndImage
  } catch (e) {
    throw new ValidationError('User already registered')
  }
}

type Login = (data: LoginUser) => Promise<User | null>
export const login: Login = (data) => {
  return prisma.user.findUnique({
    where: {
      email: data.email,
    },
  })
}

export const updateUserInDB: UpdateUserInDB = (id) => async (data) => {
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

    return {
      ...user,
      bio: user.bio ?? undefined,
      image: user.image ?? undefined,
    }
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

export const getCurrentUserFromDB = async (id: string) => {
  return prisma.user.findUnique({
    where: {
      id,
    },
  })
}
