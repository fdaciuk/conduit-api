import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'
import { UpdateArticle, updateArticleCodec } from '@/core/article/types'
import { validateCodec } from '@/helpers/validate-codec'

export type OutsideUpdateArticle<A> = (data: UpdateArticle) => Promise<A>

export type UpdateArticleCore = <A>(outsideUpdate: OutsideUpdateArticle<A>) =>
  (data: UpdateArticle) => TE.TaskEither<Error, A>

export const updateArticle: UpdateArticleCore = (outsideUpdate) => (data) => {
  return pipe(
    data,
    validateCodec(updateArticleCodec),
    TE.fromEither,
    TE.chain(() => TE.tryCatch(
      () => outsideUpdate(data),
      E.toError,
    )),
  )
}
