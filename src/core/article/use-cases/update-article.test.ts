import { pipe } from 'fp-ts/function'
import { UpdateArticle } from '@/core/article/types'
import { updateArticle, OutsideUpdateArticle } from './update-article'
import { mapAll, unsafe } from '@/config/tests/fixtures'

const data: UpdateArticle = {
  title: 'New Article title',
  slug: unsafe('article-slug'),
  authorId: 'author-id',
}

const dataWithAllFieldsValid: UpdateArticle = {
  title: 'New Article title',
  body: 'New body',
  description: 'New description',
  slug: unsafe('article-slug'),
  authorId: 'author-id',
}

const dataWithInvalidTitle: UpdateArticle = {
  title: unsafe(1),
  slug: unsafe('article-slug'),
  authorId: 'author-id',
}

const dataWithInvalidBody: UpdateArticle = {
  body: unsafe(true),
  slug: unsafe('article-slug'),
  authorId: 'author-id',
}

const dataWithInvalidDescription: UpdateArticle = {
  description: unsafe([1, 2, 3]),
  slug: unsafe('article-slug'),
  authorId: 'author-id',
}

const updateOk: OutsideUpdateArticle<string> = async (data: UpdateArticle) => {
  return `Article ${data.title} was successfully updated!`
}

const updateFail: OutsideUpdateArticle<never> = async () => {
  throw new Error('External error!')
}

it('Should update an article properly', async () => {
  return pipe(
    data,
    updateArticle(updateOk),
    mapAll(result => expect(result).toBe(`Article ${data.title} was successfully updated!`)),
  )()
})

it('Should update an article properly when all fields are provided', async () => {
  return pipe(
    dataWithAllFieldsValid,
    updateArticle(updateOk),
    mapAll(result => expect(result).toBe(`Article ${data.title} was successfully updated!`)),
  )()
})

it('Should not accept article update if title is invalid', async () => {
  return pipe(
    dataWithInvalidTitle,
    updateArticle(updateOk),
    mapAll(result => expect(result).toEqual(new Error('Invalid title'))),
  )()
})

it('Should not accept article update if body is invalid', async () => {
  return pipe(
    dataWithInvalidBody,
    updateArticle(updateOk),
    mapAll(result => expect(result).toEqual(new Error('Invalid body'))),
  )()
})

it('Should not accept article update if description is invalid', async () => {
  return pipe(
    dataWithInvalidDescription,
    updateArticle(updateOk),
    mapAll(result => expect(result).toEqual(new Error('Invalid description'))),
  )()
})

it('Should not update the article if outsideUpdate function throws an error', async () => {
  return pipe(
    data,
    updateArticle(updateFail),
    mapAll(result => expect(result).toEqual(new Error('External error!'))),
  )()
})
