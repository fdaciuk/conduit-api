import {
  UserOutput,
  CreateUserOutput,
  UpdateUserOutput,
  LoginUser,
} from '@/core/user/types'

import { ArticleOutput, CreateArticleOutput } from '@/core/article/types'

export type DBUser = Omit<UserOutput, 'token'> & {
  id: string
  password: string
  following?: { [id: string]: true }
  followers?: { [id: string]: true }
}

export type DBArticle = Omit<ArticleOutput, 'favorited' | 'author'> & {
  id: string
  authorId: string
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

type FollowUserInput = {
  userToFollow: string
  userId: string
}

export type FollowUser<T = DBUser> = (input: FollowUserInput) => Promise<T>

type UnfollowUserInput = {
  userToUnfollow: string
  userId: string
}

export type UnfollowUser<T = DBUser> = (input: UnfollowUserInput) => Promise<T>

type CreateArticleInput = CreateArticleOutput & {
  slug: string
}

export type CreateArticleInDB<T = DBArticle> = (data: CreateArticleInput) =>
  Promise<T>
