import { pipe } from 'fp-ts/function'
import { Arg, Ctx, Mutation, Resolver } from 'type-graphql'
import { getPayload } from '@/ports/adapters/http/http'
import { Auth, Context, graphQLMapResult } from '@/ports/apollo-server/server'
import * as article from '@/ports/adapters/http/modules/article'
import { Comment, CommentDeleteResponse } from './comment.type'
import { AddCommentToAnArticleInput, DeleteCommentInput } from './comment.input'

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
      // TODO: ajustar tipo
      data as any,
      article.addCommentToAnArticle,
      graphQLMapResult(result => result.comment),
    )
  }

  @Auth()
  @Mutation(_returns => CommentDeleteResponse)
  async deleteComment (
    @Arg('input') input: DeleteCommentInput,
    @Ctx() context: Context,
  ): Promise<CommentDeleteResponse> {
    const req = context.req
    const payload = getPayload(req.auth)

    const data = {
      commentId: Number(input.id),
      slug: input.articleSlug,
      userId: payload.id,
    }

    return pipe(
      data,
      article.deleteComment,
      graphQLMapResult(_ => ({ success: true })),
    )
  }
}
