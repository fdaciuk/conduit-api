import { pipe } from 'fp-ts/function'
import {
  addCommentToAnArticle,
  OutsideCreateComment,
} from './create-comment'
import { CreateComment } from '@/core/types/comment'
import { mapAll, unsafe } from '@/config/tests/fixtures'

const data: CreateComment = {
  body: unsafe('Comment for an article'),
}

const dataFail: CreateComment = {
  body: unsafe(''),
}

const registerOk: OutsideCreateComment<string> = async (data) => {
  return `Comment added successfully: ${data.body}`
}

const registerFail: OutsideCreateComment<never> = async () => {
  throw new Error('External error!')
}

it('Should add comment to an article properly', async () => {
  return pipe(
    data,
    addCommentToAnArticle(registerOk),
    mapAll(result => expect(result).toBe(`Comment added successfully: ${data.body}`)),
  )()
})

it('Should not accept an empty comment', async () => {
  return pipe(
    dataFail,
    addCommentToAnArticle(registerOk),
    mapAll(result => expect(result).toEqual(new Error('The body of the comment must not be empty.'))),
  )()
})

it('Should not create comment if outsideCreateComment function throws an error', async () => {
  return pipe(
    data,
    addCommentToAnArticle(registerFail),
    mapAll(result => expect(result).toEqual(new Error('External error!'))),
  )()
})
