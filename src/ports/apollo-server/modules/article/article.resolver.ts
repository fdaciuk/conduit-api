import { pipe } from 'fp-ts/function'
import { Arg, Ctx, FieldResolver, Mutation, Query, Resolver, Root } from 'type-graphql'
import { getPayload } from '@/ports/adapters/http/http'
import * as article from '@/ports/adapters/http/modules/article'
import { Auth, Context, graphQLMapResult } from '@/ports/apollo-server/server'
import { CreateArticleInput, UpdateArticleInput } from './article.input'
import { Comment } from '@/ports/apollo-server/modules/comment/comment.type'
import { Article, ArticleDeleteResponse, ArticlesResponse } from './article.type'

type ArticleResponse = Article & {
  userId: string
}

@Resolver(Article)
export class ArticleResolver {
  @Auth('HALF_PUBLIC')
  @Query(_returns => Article)
  async article (@Arg('slug') slug: string, @Ctx() context: Context): Promise<ArticleResponse> {
    const req = context.req
    const payload = getPayload(req.auth)

    return pipe(
      article.fetchArticle({
        slug,
        userId: payload.id,
      }),
      graphQLMapResult(result => ({
        ...result.article,
        // TODO: Ver pq está dando erro nessas duas props
        id: (result.article as any).id as string,
        favorited: (result.article as any).favorited as boolean,
        userId: payload.id,
        comments: [],
      })),
    )
  }

  @FieldResolver()
  async comments (@Root() parent: Article & { userId: string }): Promise<Comment[]> {
    const data = {
      slug: parent.slug,
      userId: parent.userId,
    }

    return pipe(
      data,
      article.getCommentsFromAnArticle,
      graphQLMapResult(result => result.comments),
    )
  }

  @Auth('HALF_PUBLIC')
  @Query(_returns => ArticlesResponse)
  async articles (@Ctx() context: Context): Promise<ArticlesResponse> {
    const req = context.req
    const payload = getPayload(req.auth)

    return pipe(
      article.fetchArticles({
        filter: req.query,
        userId: payload.id,
      }),
      graphQLMapResult(result => ({
        edges: result.articles.map(article => ({
          ...article,
          // TODO: Ver pq está dando erro nessas duas props
          id: (article as any).id as string,
          favorited: (article as any).favorited as boolean,
          userId: payload.id,
          comments: [],
        })),
        articlesCount: result.articlesCount,
      })),
    )
  }

  @Auth()
  @Mutation(_returns => Article)
  async createArticle (
    @Arg('input') input: CreateArticleInput,
    @Ctx() context: Context,
  ): Promise<ArticleResponse> {
    const req = context.req
    const payload = getPayload(req.auth)

    const data = {
      ...input,
      authorId: payload.id,
    }

    return pipe(
      data as any,
      article.registerArticle,
      graphQLMapResult(result => ({
        ...result.article,
        // TODO: Ver pq está dando erro nessas duas props
        id: (result.article as any).id as string,
        favorited: (result.article as any).favorited as boolean,
        userId: payload.id,
        comments: [],
      })),
    )
  }

  @Auth()
  @Mutation(_returns => Article)
  async updateArticle (
    @Arg('input') input: UpdateArticleInput,
    @Ctx() context: Context,
  ): Promise<ArticleResponse> {
    const req = context.req
    const payload = getPayload(req.auth)

    const data = {
      ...input,
      authorId: payload.id,
    }

    return pipe(
      data as any,
      article.updateArticle,
      graphQLMapResult(result => ({
        ...result.article,
        // TODO: Ver pq está dando erro nessas duas props
        id: (result.article as any).id as string,
        favorited: (result.article as any).favorited as boolean,
        userId: payload.id,
        comments: [],
      })),
    )
  }

  @Auth()
  @Mutation(_returns => ArticleDeleteResponse)
  async deleteArticle (
    @Arg('slug') slug: string,
    @Ctx() context: Context,
  ): Promise<ArticleDeleteResponse> {
    const req = context.req
    const payload = getPayload(req.auth)

    return pipe(
      article.deleteArticle({
        slug,
        userId: payload.id,
      }),
      graphQLMapResult(_ => ({ success: true })),
    )
  }

  @Auth()
  @Mutation(_returns => Article)
  async favoriteArticle (
    @Arg('slug') slug: string,
    @Ctx() context: Context,
  ): Promise<Article> {
    const req = context.req
    const payload = getPayload(req.auth)

    return pipe(
      article.favoriteArticle({
        userId: payload.id,
        slug,
      }),
      graphQLMapResult(result => ({
        ...result.article,
        // TODO: Ver pq está dando erro nessas duas props
        id: (result.article as any).id as string,
        favorited: (result.article as any).favorited as boolean,
        userId: payload.id,
        comments: [],
      })),
    )
  }

  @Auth()
  @Mutation(_returns => Article)
  async unfavoriteArticle (
    @Arg('slug') slug: string,
    @Ctx() context: Context,
  ): Promise<Article> {
    const req = context.req
    const payload = getPayload(req.auth)

    return pipe(
      article.unfavoriteArticle({
        userId: payload.id,
        slug,
      }),
      graphQLMapResult(result => ({
        ...result.article,
        // TODO: Ver pq está dando erro nessas duas props
        id: (result.article as any).id as string,
        favorited: (result.article as any).favorited as boolean,
        userId: payload.id,
        comments: [],
      })),
    )
  }
}
