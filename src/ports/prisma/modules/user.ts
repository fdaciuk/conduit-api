import argon2 from 'argon2'
import { User } from '@prisma/client'
import { CreateUserInDB } from '@/ports/adapters/db/types'
import { UpdateUser, LoginUser } from '@/core/user/types'
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
