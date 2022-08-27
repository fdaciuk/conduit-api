import { pipe } from 'fp-ts/function'
import { Arg, Ctx, Mutation, Resolver } from 'type-graphql'
import { getPayload } from '@/ports/adapters/http/http'
import { Auth, Context, graphQLMapResult } from '@/ports/apollo-server/server'
import * as article from '@/ports/adapters/http/modules/article'
import { Comment } from './comment.type'
import { AddCommentToAnArticleInput } from './comment.input'

@Resolver(Comment)
export class CommentResolver {
  @Auth()
  @Mutation(_returns => Comment)
  async addCommentToAnArticle (
    @Arg('input') input: AddCommentToAnArticleInput,
    @Ctx() context: Context,
  ): Promise<Comment> {
    const req = context.req
    const payload = getPayload(req.auth)

    const data = {
      authorId: payload.id,
      articleSlug: input.articleSlug,
      body: input.body,
    }

    return pipe(
      data as any,
      article.addCommentToAnArticle,
      graphQLMapResult(result => result.comment),
    )
  }
}
