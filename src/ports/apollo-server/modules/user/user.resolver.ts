import { pipe } from 'fp-ts/function'
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql'

import * as user from '@/ports/adapters/http/modules/user'
import { getPayload } from '@/ports/adapters/http/http'

import { Context, Auth, graphQLMapResult } from '@/ports/apollo-server/server'
import { User } from './user.type'
import { CreateUserInput, LoginInput, UpdateUserInput } from './user.input'

@Resolver(_of => User)
export class UserResolver {
  @Auth()
  @Query(_returns => User)
  async me (@Ctx() context: Context): Promise<User> {
    const req = context.req
    const payload = getPayload(req.auth)

    return pipe(
      user.getCurrentUser({
        id: payload.id,
        authHeader: req.header('authorization'),
      }),
      graphQLMapResult(result => result.user),
    )
  }

  @Mutation(_returns => User)
  async signUp (@Arg('input') input: CreateUserInput): Promise<User> {
    return pipe(
      input as any,
      user.registerUser,
      graphQLMapResult(result => result.user),
    )
  }

  @Mutation(_returns => User)
  async login (@Arg('input') input: LoginInput): Promise<User> {
    return pipe(
      input as any,
      user.login,
      graphQLMapResult(result => result.user),
    )
  }

  @Auth()
  @Mutation(_returns => User)
  async updateUser (@Arg('input') input: UpdateUserInput, @Ctx() context: Context): Promise<User> {
    const req = context.req
    const payload = getPayload(req.auth)

    return pipe(
      input as any,
      user.updateUser({
        id: payload.id,
        authHeader: req.header('authorization'),
      }),
      graphQLMapResult(result => result.user),
    )
  }
}
