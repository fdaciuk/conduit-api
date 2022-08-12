import 'reflect-metadata'
import { ApolloServer } from 'apollo-server'
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core'
import {
  Arg,
  Field,
  ObjectType,
  Query,
  Resolver,
  buildSchema,
} from 'type-graphql'

const books = [
  {
    title: 'Book 1',
    description: 'book 1',
  },

  {
    title: 'Book 2',
    description: 'book 2',
  },
]

@ObjectType('Book')
class Book {
  @Field()
  title: string

  @Field({ nullable: true })
  description?: string
}

@Resolver(Book)
class BookResolver {
  @Query(_returns => [Book])
  books () {
    return books
  }

  @Query(_returns => Book, { nullable: true })
  book (@Arg('title') title: string) {
    return books.find(book => book.title === title)
  }
}

export async function start () {
  const schema = await buildSchema({
    resolvers: [BookResolver],
  })
  const server = new ApolloServer({
    schema,
    csrfPrevention: true,
    cache: 'bounded',
    plugins: [
      ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    ],
  })

  return server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`)
  })
}
