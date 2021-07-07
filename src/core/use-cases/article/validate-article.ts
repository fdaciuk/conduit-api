import { pipe } from 'fp-ts/function'
import * as E from 'fp-ts/Either'
import { failure } from 'io-ts/PathReporter'
import { CreateArticle, createArticleCodec } from '@/core/types/article'

type ValidateArticle = (data: CreateArticle) => E.Either<Error, CreateArticle>
export const validateArticle: ValidateArticle = (data) => {
  return pipe(
    createArticleCodec.decode(data),
    E.mapLeft(errors => new Error(failure(errors).join(':::'))),
  )
}
