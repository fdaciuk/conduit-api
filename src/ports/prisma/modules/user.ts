import { CreateUserInDB } from '@/ports/adapters/db/types'
import {
  ValidationError,
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
