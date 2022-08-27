import { Field, ID, Int, ObjectType } from 'type-graphql'
import { Profile } from '@/ports/apollo-server/modules/profile/profile.type'

@ObjectType('Article')
export class Article {
  @Field(_type => ID)
  id: string

  @Field()
  slug: string

  @Field()
  title: string

  @Field()
  description: string

  @Field()
  body: string

  @Field()
  createdAt: string

  @Field()
  updatedAt: string

  @Field(_type => [String])
  tagList: string[]

  @Field(_type => Profile, { nullable: true })
  author?: Profile

  @Field()
  favorited: boolean

  @Field(_type => Int)
  favoritesCount: number
}

@ObjectType('ArticleDeleteResponse')
export class ArticleDeleteResponse {
  @Field()
  success: boolean
}
