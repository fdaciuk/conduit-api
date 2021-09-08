import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'
import { failure } from 'io-ts/PathReporter'
import { Type } from 'io-ts'
import { ValidationError } from '@/helpers/errors'

type ValidateCodec = <A, O>(codec: Type<A, O>) =>
  (data: O) => E.Either<ValidationError, unknown>

export const validateCodec: ValidateCodec = (codec) => (data) => {
  return pipe(
    codec.decode(data),
    E.mapLeft(errors => new ValidationError(failure(errors).join(':::'))),
  )
}
