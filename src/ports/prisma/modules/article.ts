import { Article, User } from '@prisma/client'

// import { CreateComment } from '@/core/comment/types'
// import { ProfileOutput } from '@/core/profile/types'
import { CreateArticleInDB } from '@/ports/adapters/db/types'

import { ValidationError } from '@/helpers/errors'
import { prisma } from '../prisma'

type ArticleReturned = Omit<Article, 'createdAt' | 'updatedAt'> & {
  createdAt: string
  updatedAt: string
  author: User
  tagList: string[]
}

export const createArticleInDB: CreateArticleInDB<ArticleReturned> = async (data) => {
  await prisma.tag.createMany({
    data: (data.tagList ?? []).map(name => ({ name })),
    skipDuplicates: true,
  })

  try {
    const article = await prisma.article.create({
      data: {
        slug: data.slug,
        title: data.title,
        description: data.description,
        body: data.body,
        tagList: {
          connect: (data.tagList ?? []).map(name => ({ name })),
        },
        author: {
          connect: { id: data.authorId },
        },
      },
      include: {
        author: true,
        tagList: true,
      },
    })

    return {
      ...article,
      tagList: article.tagList.map(tag => tag.name),
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString(),
    }
  } catch (e) {
    throw new ValidationError(`The article "${data.title}" already exists`)
  }
}

// export const addCommentToAnArticleInDB = async (data: CreateComment) => {
//   const date = new Date().toISOString()
//   const id = Date.now()
//   const articleId = db.articlesBySlug[data.articleSlug] || ''

//   const author = getUserProfileFromDB(data.authorId)

//   const comment = {
//     id,
//     createdAt: date,
//     updatedAt: date,
//     body: data.body,
//     articleId,
//     authorId: data.authorId,
//   }

//   db.comments[articleId] = (db.comments[articleId] ?? []).concat(comment)

//   return { ...comment, author }
// }

// function getUserProfileFromDB (userId: string): ProfileOutput {
//   const user = db.users[userId]

//   if (!user) {
//     throw new NotFoundError('User does not exist')
//   }

//   return {
//     username: user.username,
//     bio: user.bio ?? '',
//     image: user.image ?? '',
//     following: false,
//   }
// }
