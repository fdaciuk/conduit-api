import * as TE from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'
import { CreateArticle } from '@/core/types/article'

export type OutsideRegister<A> = (data: CreateArticle) => Promise<A>
type RegisterArticle = <A>(outsideRegister: OutsideRegister<A>) =>
  (data: CreateArticle) => TE.TaskEither<Error, A>

export const registerArticle: RegisterArticle = (outsideRegister) => (data) => {
  return TE.tryCatch(
    () => outsideRegister(data),
    E.toError,
  )
}
