import {
  Arg,
  Ctx,
  FieldResolver,
  ID,
  Info,
  Query,
  Resolver,
  Root,
} from 'type-graphql'
import { fromGlobalId, toGlobalId } from 'graphql-relay'
import { Node } from './node.interface'

// Isso é do TypeORM, não vamos usá-lo, precisa adaptar à nossa infra
interface Repository<T> {
  findOne (id: string): Promise<T>
}

interface Context {
  repositories: Record<string, Repository<Node>>
}

@Resolver(_of => Node)
export class NodeResolver {
  @FieldResolver()
  globalId (
    @Root() { id }: { id: string },
    @Info() { parentType: { name } }: { parentType: { name: string } },
  ): string {
    return toGlobalId(name, id)
  }

  private async fetcher (globalId: string, { repositories }: Context): Promise<Node | undefined> {
    const { type, id } = fromGlobalId(globalId)
    const repository = repositories[type]

    if (!repository) {
      throw new Error(`Could not resolve to a node with the global ID of '${globalId}'`)
    }

    return repository.findOne(id)
  }

  @Query(_returns => Node, {
    nullable: true,
    description: 'Fetches an object given its global ID.',
  })
  node (
    @Arg('id', _type => ID, { description: 'The global ID of the object.' }) globalId: string,
    @Ctx() context: Context,

  ): ReturnType<NodeResolver['fetcher']> {
    return this.fetcher(globalId, context)
  }

  @Query(_returns => [Node])
  nodes (
    @Arg('ids', _type => [ID], { description: 'The global IDs of the objects.' }) globalIds: string[],
    @Ctx() context: Context,
  ): Array<ReturnType<NodeResolver['fetcher']>> {
    return globalIds.map(id => this.fetcher(id, context))
  }
}
