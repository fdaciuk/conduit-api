import { pipe } from 'fp-ts/function'
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql'
import { getPayload } from '@/ports/adapters/http/http'
import * as user from '@/ports/adapters/http/modules/user'
import { Auth, Context, graphQLMapResult } from '@/ports/apollo-server/server'
import { Profile } from './profile.type'

@Resolver(Profile)
export class ProfileResolver {
  @Auth('HALF_PUBLIC')
  @Query(_returns => Profile)
  async profile (@Arg('username') username: string, @Ctx() context: Context): Promise<Profile> {
    const req = context.req
    const payload = getPayload(req.auth)

    return pipe(
      user.getProfile({
        username,
        userId: payload.id,
      }),
      graphQLMapResult(result => result.profile),
    )
  }

  @Auth()
  @Mutation(_returns => Profile)
  async follow (@Arg('userToFollow') userToFollow: string, @Ctx() context: Context): Promise<Profile> {
    const req = context.req
    const payload = getPayload(req.auth)

    return pipe(
      user.followUser({
        userToFollow,
        userId: payload.id,
      }),
      graphQLMapResult(result => result.profile),
    )
  }

  @Auth()
  @Mutation(_returns => Profile)
  async unfollow (@Arg('userToUnfollow') userToUnfollow: string, @Ctx() context: Context): Promise<Profile> {
    const req = context.req
    const payload = getPayload(req.auth)

    return pipe(
      user.unfollowUser({
        userToUnfollow,
        userId: payload.id,
      }),
      graphQLMapResult(result => result.profile),
    )
  }
}
