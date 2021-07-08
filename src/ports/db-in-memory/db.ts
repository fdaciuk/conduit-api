import slugify from 'slugify'
import {
  OutsideRegisterType,
} from '@/adapters/use-cases/user/register-user-adapter'
import {
  OutsideRegisterType as OutsideRegisterArticle,
} from '@/adapters/use-cases/article/register-article-adapter'

export const outsideRegister: OutsideRegisterType = async (data) => {
  return {
    user: {
      email: data.email,
      token: '',
      username: data.username,
      bio: '',
      image: undefined,
    },
  }
}

export const outsideRegisterArticle: OutsideRegisterArticle = async (data) => {
  const date = new Date().toISOString()

  return {
    article: {
      slug: slugify(data.title, { lower: true }),
      title: data.title,
      description: data.description,
      body: data.body,
      tagList: data.tagList ?? [],
      createdAt: date,
      updatedAt: date,
      favorited: false,
      favoritesCount: 0,
      // author: {
      //   "username": "jake",
      //   "bio": "I work at statefarm",
      //   "image": "https://i.stack.imgur.com/xHWG8.jpg",
      //   "following": false
      // }
    },
  }
}
