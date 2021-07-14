import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import { Email, Password, Slug } from '@/core/types/scalar'

export function unsafe <T> (value: unknown): T {
  return value as any
}

export function unsafeString (value: unknown): string {
  return value as any
}

export function unsafeEmail (value: string): Email {
  return value as any
}

export function unsafeSlug (value: string): Slug {
  return value as any
}

export function unsafePassword (value: string): Password {
  return value as any
}

type Callback = (a: unknown) => unknown
type MapAll = (fn: Callback) => (data: TE.TaskEither<unknown, unknown>) =>
  TE.TaskEither<unknown, unknown>

export const mapAll: MapAll = (fn) => (data) => {
  return pipe(
    data,
    TE.map(fn),
    TE.mapLeft(fn),
  )
}

export function getErrorMessage (errors: unknown): string {
  return Array.isArray(errors) ? errors[0].message : ''
}
