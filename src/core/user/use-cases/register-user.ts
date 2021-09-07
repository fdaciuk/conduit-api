import * as TE from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'
import { createUserCodec, CreateUser } from '@/core/user/types'
import { validateUser } from './validate-user'

export type OutsideRegisterUser<A> = (data: CreateUser) => Promise<A>

type RegisterUser = <A>(outsideRegister: OutsideRegisterUser<A>) =>
  (data: CreateUser) => TE.TaskEither<Error, A>

export const registerUser: RegisterUser = (outsideRegister) => (data) => {
  return pipe(
    data,
    validateUser(createUserCodec),
    TE.fromEither,
    TE.chain(() => TE.tryCatch(
      () => outsideRegister(data),
      E.toError,
    )),
  )
}
