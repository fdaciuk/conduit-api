import { pipe } from 'fp-ts/function'
import * as E from 'fp-ts/Either'
import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql'
import { getPayload } from '@/ports/adapters/http/http'
import * as user from '@/ports/adapters/http/modules/user'
import { Context, getRole } from '@/ports/apollo-server/server'
import { GraphQLError } from '@/ports/apollo-server/errors'
import { Profile } from './profile.type'

@Resolver(Profile)
export class ProfileResolver {
  @Authorized(getRole('HALF_PUBLIC'))
  @Query(_returns => Profile)
  async profile (@Arg('username') username: string, @Ctx() context: Context): Promise<Profile> {
    const req = context.req
    const payload = getPayload(req.auth)

    const result = await pipe(
      user.getProfile({
        username,
        userId: payload.id,
      }),
    )()

    if (E.isLeft(result)) {
      throw new GraphQLError(result.left)
    }

    return result.right.profile
  }

  @Authorized()
  @Mutation(_returns => Profile)
  async follow (@Arg('userToFollow') userToFollow: string, @Ctx() context: Context): Promise<Profile> {
    const req = context.req
    const payload = getPayload(req.auth)

    const result = await pipe(
      user.followUser({
        userToFollow,
        userId: payload.id,
      }),
    )()

    if (E.isLeft(result)) {
      throw new GraphQLError(result.left)
    }

    return result.right.profile
  }

  @Authorized()
  @Mutation(_returns => Profile)
  async unfollow (@Arg('userToUnfollow') userToUnfollow: string, @Ctx() context: Context): Promise<Profile> {
    const req = context.req
    const payload = getPayload(req.auth)

    const result = await pipe(
      user.unfollowUser({
        userToUnfollow,
        userId: payload.id,
      }),
    )()

    if (E.isLeft(result)) {
      throw new GraphQLError(result.left)
    }

    return result.right.profile
  }
}
