import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import { positiveCodec } from './positive'
import { mapAll, getErrorMessage } from '@/config/tests/fixtures'

it('Should validate positive number properly', async () => {
  return pipe(
    1,
    positiveCodec.decode,
    TE.fromEither,
    mapAll(result => expect(result).toBe(1)),
  )()
})

it('Should accept zero', async () => {
  return pipe(
    0,
    positiveCodec.decode,
    TE.fromEither,
    mapAll(result => expect(result).toBe(0)),
  )()
})

it('Should not accept a number less than zero', async () => {
  return pipe(
    -1,
    positiveCodec.decode,
    TE.fromEither,
    mapAll(errors => expect(getErrorMessage(errors)).toBe('This number should be greater than zero.')),
  )()
})
