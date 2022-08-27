import { Field, InputType } from 'type-graphql'

@InputType()
export class AddCommentToAnArticleInput {
  @Field()
  body: string

  @Field()
  articleSlug: string
}
