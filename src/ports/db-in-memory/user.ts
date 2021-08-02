import { CreateUser, LoginUser } from '@/core/user/types'
import { v4 as uuidv4 } from 'uuid'
import { DBUser, db } from './db'

type CreateUserInDB = (data: CreateUser) => Promise<DBUser>

export const createUserInDB: CreateUserInDB = async (data) => {
  const id = uuidv4()

  db.usersByEmail[data.email] = id

  const user = db.users[id] = {
    id,
    email: data.email,
    username: data.username,
    password: data.password,
  }

  return user
}

type Login = (data: LoginUser) => Promise<DBUser>
export const login: Login = async (data) => {
  const userId = db.usersByEmail[data.email]
  const user = db.users[userId ?? '']

  if (!user || data.password !== user.password) {
    throw new Error('Invalid email or password')
  }

  return user
}
