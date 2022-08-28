import { Field, ID, Int, ObjectType } from 'type-graphql'
import { Profile } from '@/ports/apollo-server/modules/profile/profile.type'
import { Comment } from '@/ports/apollo-server/modules/comment/comment.type'

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

  @Field(_type => [Comment])
  comments: Comment[]

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

@ObjectType('ArticlesResponse')
export class ArticlesResponse {
  @Field(_type => [Article])
  edges: Article[]

  @Field()
  articlesCount: number
}

// ===
// Relay compilant
// ===
// @ObjectType('ArticlesEdge')
// class ArticleEdge {
//   @Field(_type => Article)
//   node: Article

//   @Field()
//   cursor: string
// }

// @ObjectType('ArticlePageInfo')
// class ArticlePageInfo {
//   @Field()
//   hasNextPage: boolean

//   @Field()
//   hasPreviousPage: boolean

//   @Field()
//   startCursor: string

//   @Field()
//   endCursor: string
// }

// @ObjectType('ArticlesConnection')
// export class ArticlesConnection {
//   @Field(_type => [ArticleEdge])
//   edges: ArticleEdge[]

//   @Field(_type => ArticlePageInfo)
//   pageInfo: ArticlePageInfo
// }
