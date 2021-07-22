import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'

export function unsafe <T> (value: unknown): T {
  return value as T
}

type Callback<E, T> = (a: E | T) => unknown

type MapAll = <E, T>(fn: Callback<E, T>) =>
  (data: TE.TaskEither<E, T>) =>
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
