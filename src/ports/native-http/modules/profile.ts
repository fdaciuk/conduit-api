import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import * as user from '@/ports/adapters/http/modules/user'
import { getPayload } from '@/ports/adapters/http/http'
import { Routes, httpResponse } from '../server'
import { withAuth, withTryAuth } from '../middlewares'

const profileRoutes: Routes = {
  'GET /api/profiles/:username': withTryAuth(async (request, response) => {
    const username = 'username'
    const payload = getPayload(request.auth)

    pipe(
      user.getProfile({
        username: request.params![username] ?? '',
        userId: payload.id,
      }),
      TE.map(result => httpResponse(response, result)),
      TE.mapLeft(result => httpResponse(response, result.error, result.code)),
    )()
  }),

  'POST /api/profiles/:username/follow': withAuth(async (request, response) => {
    const username = 'username'
    const payload = getPayload(request.auth)

    pipe(
      user.followUser({
        userToFollow: request.params![username] ?? '',
        userId: payload.id,
      }),
      TE.map(result => httpResponse(response, result)),
      TE.mapLeft(result => httpResponse(response, result.error, result.code)),
    )()
  }),

  'DELETE /api/profiles/:username/follow': withAuth(async (request, response) => {
    const username = 'username'
    const payload = getPayload(request.auth)

    pipe(
      user.unfollowUser({
        userToUnfollow: request.params![username] ?? '',
        userId: payload.id,
      }),
      TE.map(result => httpResponse(response, result)),
      TE.mapLeft(result => httpResponse(response, result.error, result.code)),
    )()
  }),
}

export { profileRoutes }
