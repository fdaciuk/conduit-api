import { pipe } from 'fp-ts/function'
import { mapAllE } from '@/config/tests/fixtures'
import { slugCodec } from './slug'

it('Should validate slug properly', () => {
  pipe(
    'valid-slug',
    slugCodec.decode,
    mapAllE(result => expect(result).toBe('valid-slug')),
  )
})

it('Should accept 3 or more characters', () => {
  pipe(
    'slu',
    slugCodec.decode,
    mapAllE(result => expect(result).toBe('slu')),
  )
})

it('Should not accept numbers at the beginning of the slug', () => {
  pipe(
    '3invalid-slug',
    slugCodec.decode,
    mapAllE(errors => {
      const errorMessage: string = Array.isArray(errors) ? errors[0].message : ''
      expect(errorMessage).toBe('Invalid slug. Please, use alphanumeric characters, dash and/or numbers.')
    }),
  )
})

it('Should not accept dashes at the end of the slug', () => {
  pipe(
    'invalid-slug-',
    slugCodec.decode,
    mapAllE(errors => {
      const errorMessage: string = Array.isArray(errors) ? errors[0].message : ''
      expect(errorMessage).toBe('Invalid slug. Please, use alphanumeric characters, dash and/or numbers.')
    }),
  )
})

it('Should not accept less than 3 characters', () => {
  pipe(
    'sl',
    slugCodec.decode,
    mapAllE(errors => {
      const errorMessage: string = Array.isArray(errors) ? errors[0].message : ''
      expect(errorMessage).toBe('Invalid slug. Please, use alphanumeric characters, dash and/or numbers.')
    }),
  )
})
