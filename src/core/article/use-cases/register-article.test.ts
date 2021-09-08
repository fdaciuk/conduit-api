import { pipe } from 'fp-ts/function'
import { CreateArticle } from '@/core/article/types'
import { registerArticle, OutsideRegisterArticle } from './register-article'
import { mapAll, unsafe } from '@/config/tests/fixtures'

const data: CreateArticle = {
  title: 'Article title',
  body: 'Article body',
  description: 'Article description',
  authorId: unsafe('d6562b7f-0543-4d42-b294-1a1619a0ae32'),
}

const dataWithTagList: CreateArticle = {
  title: 'Article title 2',
  body: 'Article body 2',
  description: 'Article description 2',
  tagList: [unsafe('tag1'), unsafe('tag2')],
  authorId: unsafe('d6562b7f-0543-4d42-b294-1a1619a0ae32'),
}

const dataWithInvalidTagList: CreateArticle = {
  title: 'Article title 3',
  body: 'Article body 3',
  description: 'Article description 3',
  tagList: [unsafe('tag1'), unsafe('3ag2-wrong')],
  authorId: unsafe('d6562b7f-0543-4d42-b294-1a1619a0ae32'),
}

const dataWithInvalidTitle: CreateArticle = {
  title: unsafe(1),
  body: 'Article body',
  description: 'Article description',
  authorId: unsafe('d6562b7f-0543-4d42-b294-1a1619a0ae32'),
}

const dataWithInvalidAuthorID: CreateArticle = {
  title: 'Article title',
  body: 'Article body',
  description: 'Article description',
  authorId: unsafe('123'),
}

const registerOk: OutsideRegisterArticle<string> = async (data: CreateArticle) => {
  return `Article ${data.title} successfully created!`
}

const registerFail: OutsideRegisterArticle<never> = async () => {
  throw new Error('External error!')
}

it('Should create an article properly', async () => {
  return pipe(
    data,
    registerArticle(registerOk),
    mapAll(result => expect(result).toBe(`Article ${data.title} successfully created!`)),
  )()
})

it('Should create an article with tagList properly', async () => {
  return pipe(
    dataWithTagList,
    registerArticle(registerOk),
    mapAll(result => expect(result).toBe(`Article ${dataWithTagList.title} successfully created!`)),
  )()
})

it('Should not accept article register if tagList has invalid slugs', async () => {
  return pipe(
    dataWithInvalidTagList,
    registerArticle(registerOk),
    mapAll(result => {
      expect(result).toEqual(new Error('Invalid slug. Please, use alphanumeric characters, dash, underline and/or numbers.'))
    }),
  )()
})

it('Should not accept article register if title is invalid', async () => {
  return pipe(
    dataWithInvalidTitle,
    registerArticle(registerOk),
    mapAll(result => expect(result).toEqual(new Error('Invalid title'))),
  )()
})

it('Should not accept article register if author ID is invalid', async () => {
  return pipe(
    dataWithInvalidAuthorID,
    registerArticle(registerOk),
    mapAll(result => expect(result).toEqual(new Error('Invalid author ID'))),
  )()
})

it('Should not register the article if outsideRegister function throws an error', async () => {
  return pipe(
    data,
    registerArticle(registerFail),
    mapAll(result => expect(result).toEqual(new Error('External error!'))),
  )()
})
