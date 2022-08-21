import { Field, InputType } from 'type-graphql'

@InputType()
export class CreateArticleInput {
  @Field()
  title: string

  @Field()
  description: string

  @Field()
  body: string

  @Field(_type => [String], { nullable: true })
  tagList?: string[]
}

@InputType()
export class UpdateArticleInput {
  @Field()
  slug: string

  @Field({ nullable: true })
  title?: string

  @Field({ nullable: true })
  description?: string

  @Field({ nullable: true })
  body?: string
}
