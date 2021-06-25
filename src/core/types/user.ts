import { Email } from '@/core/types/scalar'
import * as t from 'io-ts'

export type User = {
  email: t.TypeOf<typeof Email>
  token: string
  username: string
  bio: string
  image: string
}

export type CreateUser = {
  username: string
  email: t.TypeOf<typeof Email>
  password: string
}
