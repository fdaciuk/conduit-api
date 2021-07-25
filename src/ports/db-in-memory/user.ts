import { CreateUser } from '@/core/types/user'
import { v4 as uuidv4 } from 'uuid'
import { DBUser, db } from './db'

type CreateUserInDB = (data: CreateUser) => Promise<DBUser>

export const createUserInDB: CreateUserInDB = async (data) => {
  const id = uuidv4()

  const user = db.users[id] = {
    id,
    email: data.email,
    username: data.username,
    password: data.password,
  }

  return user
}
