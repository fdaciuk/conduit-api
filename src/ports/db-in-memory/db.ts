import slugify from 'slugify'

import * as user from '@/adapters/use-cases/user/register-user-adapter'
import * as article from '@/adapters/use-cases/article/register-article-adapter'
import * as comment from '@/adapters/use-cases/article/add-comment-to-an-article-adapter'

export const outsideRegisterUser: user.OutsideRegisterUser = async (data) => {
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

export const outsideRegisterArticle: article.OutsideRegisterArticle = async (data) => {
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

export const outsideCreateComment: comment.OutsideCreateComment = async (data) => {
  const date = new Date().toISOString()

  return {
    comment: {
      id: Date.now(),
      createdAt: date,
      updatedAt: date,
      body: data.body,
      // author: {
      //   "username": "jake",
      //   "bio": "I work at statefarm",
      //   "image": "https://i.stack.imgur.com/xHWG8.jpg",
      //   "following": false
      // }
    },
  }
}
