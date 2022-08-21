import { pipe } from 'fp-ts/function'
import * as E from 'fp-ts/Either'
import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql'
import { getPayload } from '@/ports/adapters/http/http'
import * as article from '@/ports/adapters/http/modules/article'
import { Context, getRole } from '@/ports/apollo-server/server'
import { GraphQLError } from '@/ports/apollo-server/errors'
import { CreateArticleInput, UpdateArticleInput } from './article.input'
import { Article } from './article.type'

@Resolver(Article)
export class ArticleResolver {
  @Authorized(getRole('HALF_PUBLIC'))
  @Query(_returns => Article)
  async article (@Arg('slug') slug: string, @Ctx() context: Context): Promise<Article> {
    const req = context.req
    const payload = getPayload(req.auth)

    const result = await article.fetchArticle({
      slug,
      userId: payload.id,
    })()

    if (E.isLeft(result)) {
      throw new GraphQLError(result.left)
    }

    return {
      ...result.right.article,
      // TODO: Ver pq está dando erro nessas duas props
      id: (result.right.article as any).id as string,
      favorited: (result.right.article as any).favorited as boolean,
    }
  }

  @Authorized()
  @Mutation(_returns => Article)
  async createArticle (@Arg('input') input: CreateArticleInput, @Ctx() context: Context): Promise<Article> {
    const req = context.req
    const payload = getPayload(req.auth)
    console.log('payload:', payload)

    const data = {
      ...input,
      authorId: payload.id,
    }

    const result = await pipe(
      data as any,
      article.registerArticle,
    )()

    if (E.isLeft(result)) {
      throw new GraphQLError(result.left)
    }

    return {
      ...result.right.article,
      // TODO: Ver pq está dando erro nessas duas props
      id: (result.right.article as any).id as string,
      favorited: (result.right.article as any).favorited as boolean,
    }
  }

  @Authorized()
  @Mutation(_returns => Article)
  async updateArticle (@Arg('input') input: UpdateArticleInput, @Ctx() context: Context): Promise<Article> {
    const req = context.req
    const payload = getPayload(req.auth)

    const data = {
      ...input,
      authorId: payload.id,
    }

    const result = await pipe(
      data as any,
      article.updateArticle,
    )()

    if (E.isLeft(result)) {
      throw new GraphQLError(result.left)
    }

    return {
      ...result.right.article,
      // TODO: Ver pq está dando erro nessas duas props
      id: (result.right.article as any).id as string,
      favorited: (result.right.article as any).favorited as boolean,
    }
  }
}
