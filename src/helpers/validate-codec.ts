import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'
import { failure } from 'io-ts/PathReporter'
import { Type } from 'io-ts'
import { ValidationError } from '@/helpers/errors'

type ValidateCodec = <A, O, I>(codec: Type<A, O, I>) =>
  (data: I) => E.Either<ValidationError, O>

export const validateCodec: ValidateCodec = (codec) => (data) => {
  return pipe(
    codec.decode(data),
    E.map(codec.encode),
    E.mapLeft(errors => new ValidationError(failure(errors).join(':::'))),
  )
}
