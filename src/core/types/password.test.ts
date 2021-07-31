import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import { passwordCodec } from './password'
import { mapAll, getErrorMessage } from '@/config/tests/fixtures'

it('Should validate password properly', async () => {
  return pipe(
    '12345678',
    passwordCodec.decode,
    TE.fromEither,
    mapAll(result => expect(result).toBe('12345678')),
  )()
})

it('Should not accept a password less than 8 characters long', async () => {
  return pipe(
    '123456',
    passwordCodec.decode,
    TE.fromEither,
    mapAll(errors => expect(getErrorMessage(errors)).toBe('Password should be at least 8 characters long.')),
  )()
})
