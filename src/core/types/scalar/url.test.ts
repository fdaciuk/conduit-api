import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import { mapAll, getErrorMessage } from '@/config/tests/fixtures'
import { urlCodec } from './url'

it('Deveria validar a url corretamente', async () => {
  return pipe(
    'https://url.com',
    urlCodec.decode,
    TE.fromEither,
    mapAll(result => expect(result).toBe('https://url.com')),
  )()
})

it('Deveria retornar um erro quando a URL for inválida', async () => {
  return pipe(
    'invalid-url',
    urlCodec.decode,
    TE.fromEither,
    mapAll(errors => expect(getErrorMessage(errors)).toBe('Invalid URL')),
  )()
})
