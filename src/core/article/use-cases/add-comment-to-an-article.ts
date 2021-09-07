import * as TE from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'
import { CreateComment, createCommentCodec } from '@/core/comment/types'
import { validateCodec } from '@/helpers/validate-codec'

export type OutsideCreateComment<A> = (data: CreateComment) => Promise<A>

export type AddCommentToAnArticle = <A>(o: OutsideCreateComment<A>) =>
  (data: CreateComment) => TE.TaskEither<Error, A>

export const addCommentToAnArticle: AddCommentToAnArticle = (outsideCreateComment) => (data) => {
  return pipe(
    data,
    validateCodec(createCommentCodec),
    TE.fromEither,
    TE.chain(() => TE.tryCatch(
      () => outsideCreateComment(data),
      E.toError,
    )),
  )
}
