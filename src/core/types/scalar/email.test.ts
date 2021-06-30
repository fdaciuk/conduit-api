import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import { mapAll, getErrorMessage } from '@/config/tests/fixtures'
import { emailCodec } from './email'

it('Deveria validar o email corretamente', async () => {
  return pipe(
    'john@doe.com',
    emailCodec.decode,
    TE.fromEither,
    mapAll(result => expect(result).toBe('john@doe.com')),
  )()
})

it('Deveria retornar um erro quando o email for inválido', async () => {
  return pipe(
    'invalid-email',
    emailCodec.decode,
    TE.fromEither,
    mapAll(errors => expect(getErrorMessage(errors)).toBe('Invalid email')),
  )()
})
