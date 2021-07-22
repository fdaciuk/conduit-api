import { pipe } from 'fp-ts/function'
import { CreateArticle } from '@/core/types/article'
import { registerArticle, OutsideRegisterArticle } from './register-article'
import { mapAll, unsafe } from '@/config/tests/fixtures'

const data: CreateArticle = {
  title: 'Article title',
  body: 'Article body',
  description: 'Article description',
}

const dataWithTagList: CreateArticle = {
  title: 'Article title 2',
  body: 'Article body 2',
  description: 'Article description 2',
  tagList: [unsafe('tag1'), unsafe('tag2')],
}

const dataWithInvalidTagList: CreateArticle = {
  title: 'Article title 3',
  body: 'Article body 3',
  description: 'Article description 3',
  tagList: [unsafe('taG1'), unsafe('3ag2')],
}

const dataWithInvalidTitle: CreateArticle = {
  title: unsafe(1),
  body: 'Article body',
  description: 'Article description',
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
      expect(result).toEqual(new Error('Invalid slug. Please, use alphanumeric characters, dash and/or numbers.:::Invalid slug. Please, use alphanumeric characters, dash and/or numbers.'))
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

it('Should not register the article if outsideRegister function throws an error', async () => {
  return pipe(
    data,
    registerArticle(registerFail),
    mapAll(result => expect(result).toEqual(new Error('External error!'))),
  )()
})
