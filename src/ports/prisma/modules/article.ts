import { Article, Comment, User } from '@prisma/client'
import {
  CreateArticleInDB,
  AddCommentToAnArticleInDB,
} from '@/ports/adapters/db/types'
import { ArticlesFilter } from '@/ports/adapters/http/types'

import { ValidationError, NotFoundError } from '@/helpers/errors'
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

export const getArticlesFromDB = async (filter?: ArticlesFilter) => {
  const articles = await prisma.article.findMany({
    take: Number(filter?.limit ?? 20),
    skip: Number(filter?.offset ?? 0),

    orderBy: {
      createdAt: 'desc',
    },
    where: {
      AND: [
        {
          author: {
            username: filter?.author,
          },
        },

        {
          tagList: {
            some: {
              name: filter?.tag,
            },
          },
        },
      ],
    },
    include: {
      author: true,
      tagList: true,
    },
  })

  return articles.map(article => ({
    ...article,
    favorited: false, // TODO: Mock
    favoritesCount: 0, // TODO: Mock
    tagList: article.tagList.map(({ name }) => name),
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
  }))
}

type FavoriteArticleInput = {
  slug: string
  userId: string
}

export const favoriteArticleInDB = async (data: FavoriteArticleInput) => {
  const article = await prisma.article.findUnique({
    where: {
      slug: data.slug,
    },
  })

  if (!article) {
    throw new NotFoundError(`Article ${data.slug} does not exist`)
  }

  try {
    const favoritedArticle = await prisma.favorite.create({
      data: {
        userId: data.userId,
        articleId: article.id,
      },
      include: {
        article: {
          include: {
            author: true,
            tagList: true,
          },
        },
      },
    })

    return {
      ...favoritedArticle.article,
      favorited: true,
      favoritesCount: 0, // TODO: Mock
      tagList: favoritedArticle.article.tagList.map(({ name }) => name),
      createdAt: favoritedArticle.article.createdAt.toISOString(),
      updatedAt: favoritedArticle.article.updatedAt.toISOString(),
    }
  } catch (error) {
    if (error.message.includes('Unique constraint failed on the fields: (`userId`,`articleId`)')) {
      throw new ValidationError(`The article ${data.slug} is already a favorite`)
    }

    throw new ValidationError(`Error trying to favorite article ${data.slug}`)
  }
}

export const unfavoriteArticleInDB = async (data: FavoriteArticleInput) => {
  const article = await prisma.article.update({
    where: {
      slug: data.slug,
    },
    data: {
      favoritedArticles: {
        deleteMany: {
          userId: data.userId,
        },
      },
    },
    include: {
      author: true,
      tagList: true,
    },
  })

  return {
    ...article,
    favorited: false,
    favoritesCount: 0, // TODO: Mock
    tagList: article.tagList.map(({ name }) => name),
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
  }
}

type CommentReturned = Omit<Comment, 'createdAt' | 'updatedAt'> & {
  createdAt: string
  updatedAt: string
  author: User
}

export const addCommentToAnArticleInDB: AddCommentToAnArticleInDB<CommentReturned> = async (data) => {
  const comment = await prisma.comment.create({
    data: {
      body: data.body,
      author: {
        connect: { id: data.authorId },
      },
      article: {
        connect: { slug: data.articleSlug },
      },
    },
    include: {
      author: true,
    },
  })

  return {
    ...comment,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
  }
}
