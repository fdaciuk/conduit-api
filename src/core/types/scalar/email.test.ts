import { pipe } from 'fp-ts/function'
import { mapAllE } from '@/config/tests/fixtures'
import { emailCodec } from './email'

it('Deveria validar o email corretamente', () => {
  pipe(
    'john@doe.com',
    emailCodec.decode,
    mapAllE(result => expect(result).toBe('john@doe.com')),
  )
})

it('Deveria retornar um erro quando o email for inválido', () => {
  pipe(
    'invalid-email',
    emailCodec.decode,
    mapAllE(error => {
      const errorMessage: string = Array.isArray(error) ? error[0]?.message : ''
      expect(errorMessage).toBe('Invalid email')
    }),
  )
})
