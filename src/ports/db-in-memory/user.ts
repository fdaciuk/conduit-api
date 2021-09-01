import argon2 from 'argon2'
import { CreateUser, LoginUser } from '@/core/user/types'
import { v4 as uuidv4 } from 'uuid'
import { DBUser, dbInMemory as db } from './db'

type CreateUserInDB = (data: CreateUser) => Promise<DBUser>

export const createUserInDB: CreateUserInDB = async (data) => {
  if (db.usersByEmail[data.email]) {
    throw new Error('User already registered')
  }

  const hash = await argon2.hash(data.password)

  const id = uuidv4()

  db.usersByEmail[data.email] = id

  const user = db.users[id] = {
    id,
    email: data.email,
    username: data.username,
    password: hash,
  }

  return user
}

type Login = (data: LoginUser) => Promise<DBUser>
export const login: Login = async (data) => {
  const userId = db.usersByEmail[data.email]
  const user = db.users[userId ?? '']

  if (!user || !(await argon2.verify(user.password, data.password))) {
    throw new Error('Invalid email or password')
  }

  return user
}

export const getCurrentUser = async (id: string) => {
  return db.users[id]
}
