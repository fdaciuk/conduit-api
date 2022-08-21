import 'reflect-metadata'
import { join } from 'node:path'
import { ApolloServer } from 'apollo-server'
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core'
import { buildSchema } from 'type-graphql'
import { env } from '@/helpers'

import { Article } from './modules/article/article.type'
import { repositories, authChecker } from './server'

const PORT = env('PORT')

export async function start () {
  const schema = await buildSchema({
    orphanedTypes: [
      Article,
    ],
    resolvers: [join(__dirname, '{modules,relay}', '**', '*.resolver.ts')],
    emitSchemaFile: true,
    authChecker,
  })

  const server = new ApolloServer({
    schema,
    context: async ({ req }) => {
      return {
        repositories,
        req,
      }
    },
    csrfPrevention: true,
    cache: 'bounded',
    plugins: [
      ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    ],
  })

  return server.listen({ port: PORT }).then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`)
  })
}
