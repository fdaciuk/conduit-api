import { pipe } from 'fp-ts/function'
import * as E from 'fp-ts/Either'
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql'

import * as user from '@/ports/adapters/http/modules/user'
import { getPayload } from '@/ports/adapters/http/http'

import { GraphQLError } from '@/ports/apollo-server/errors'
import { Context, Auth } from '@/ports/apollo-server/server'
import { User } from './user.type'
import { CreateUserInput, LoginInput, UpdateUserInput } from './user.input'

@Resolver(_of => User)
export class UserResolver {
  @Auth()
  @Query(_returns => User)
  async me (@Ctx() context: Context): Promise<User> {
    const req = context.req
    const payload = getPayload(req.auth)

    const result = await user.getCurrentUser({
      id: payload.id,
      authHeader: req.header('authorization'),
    })()

    if (E.isLeft(result)) {
      throw new GraphQLError(result.left)
    }

    return result.right.user
  }

  @Mutation(_returns => User)
  async signUp (@Arg('input') input: CreateUserInput): Promise<User> {
    const result = await user.registerUser(input as any)()

    if (E.isLeft(result)) {
      throw new GraphQLError(result.left)
    }

    return result.right.user
  }

  @Mutation(_returns => User)
  async login (@Arg('input') input: LoginInput): Promise<User> {
    const result = await user.login(input as any)()

    if (E.isLeft(result)) {
      throw new GraphQLError(result.left)
    }

    return result.right.user
  }

  @Auth()
  @Mutation(_returns => User)
  async updateUser (@Arg('input') input: UpdateUserInput, @Ctx() context: Context): Promise<User> {
    const req = context.req
    const payload = getPayload(req.auth)

    const result = await pipe(
      input as any,
      user.updateUser({
        id: payload.id,
        authHeader: req.header('authorization'),
      }),
    )()

    if (E.isLeft(result)) {
      throw new GraphQLError(result.left)
    }

    return result.right.user
  }
}
