import {
  UserOutput,
  CreateUserOutput,
  UpdateUserOutput,
} from '@/core/user/types'

export type DBUser = Omit<UserOutput, 'token'> & {
  id: string
  password: string
  following?: { [id: string]: true }
  followers?: { [id: string]: true }
}

type CreateUserData = CreateUserOutput & {
  password: string
}

export type CreateUserInDB = (data: CreateUserData) => Promise<DBUser>

type UpdateUserData = UpdateUserOutput & {
  password?: string
}

export type UpdateUserInDB = (id: string) =>
  (data: UpdateUserData) => Promise<DBUser>
