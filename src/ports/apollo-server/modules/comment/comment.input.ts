import { Field, ID, InputType } from 'type-graphql'

@InputType()
export class AddCommentToAnArticleInput {
  @Field()
  body: string

  @Field()
  articleSlug: string
}

@InputType()
export class DeleteCommentInput {
  @Field()
  articleSlug: string

  @Field(_type => ID)
  id: number
}
