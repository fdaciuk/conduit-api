import { pipe } from 'fp-ts/function'
import { Query, Resolver } from 'type-graphql'
import * as article from '@/ports/adapters/http/modules/article'
import { graphQLMapResult } from '@/ports/apollo-server/server'

@Resolver(String)
export class TagResolver {
  @Query(_returns => String)
  async tags (): Promise<string[]> {
    return pipe(
      article.getTags(),
      graphQLMapResult(result => result.tags),
    )
  }
}
