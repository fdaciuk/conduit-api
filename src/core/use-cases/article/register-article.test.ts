import { pipe } from 'fp-ts/function'
import { CreateArticle } from '@/core/types/article'
import { registerArticle, OutsideRegister } from './register-article'
import { mapAll } from '@/config/tests/fixtures'

const data: CreateArticle = {
  title: 'Article title',
  body: 'Article body',
  description: 'Article description',
}

const registerOk: OutsideRegister<string> = async (data: CreateArticle) => {
  return `Article ${data.title} successfully created!`
}

it('Should create an article properly', async () => {
  return pipe(
    data,
    registerArticle(registerOk),
    mapAll(result => expect(result).toBe(`Article ${data.title} successfully created!`)),
  )()
})
