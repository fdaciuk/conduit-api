import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'
import { failure } from 'io-ts/PathReporter'
import { Type } from 'io-ts'

type ValidateUser = <A, O>(codec: Type<A, O>) =>
  (data: O) => E.Either<Error, unknown>

export const validateUser: ValidateUser = (codec) => (data) => {
  return pipe(
    codec.decode(data),
    E.mapLeft(errors => new Error(failure(errors).join(':::'))),
  )
}
