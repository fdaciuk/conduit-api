import {
  UserOutput,
  CreateUserOutput,
  UpdateUserOutput,
  LoginUser,
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

export type CreateUserInDB<T = DBUser> = (data: CreateUserData) => Promise<T>

export type Login<T = DBUser> = (data: LoginUser) => Promise<T | null>

type UpdateUserData = UpdateUserOutput & {
  password?: string
}

export type UpdateUserInDB<T = DBUser> = (id: string) =>
  (data: UpdateUserData) => Promise<T>

export type GetCurrentUserFromDB<T = DBUser> = (id: string) =>
  Promise<T | null>

export type GetProfileFromDB<T = DBUser> = (username: string) =>
  Promise<T | null>
