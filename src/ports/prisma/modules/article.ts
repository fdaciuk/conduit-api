import { Article, Comment, User } from '@prisma/client'
import {
  CreateArticleInDB,
  AddCommentToAnArticleInDB,
} from '@/ports/adapters/db/types'
import {
  ArticlesFilter,
  FavoriteArticleInput,
} from '@/ports/adapters/http/types'

import { ValidationError, UnknownError } from '@/helpers/errors'
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
      favorited: false,
      favoritesCount: 0,
      tagList: article.tagList.map(tag => tag.name),
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString(),
    }
  } catch (e) {
    throw new ValidationError(`The article "${data.title}" already exists`)
  }
}

type GetArticlesFromDBInput = {
  filter?: ArticlesFilter
  userId: string
}
export const getArticlesFromDB = async ({ filter, userId }: GetArticlesFromDBInput) => {
  const articles = await prisma.article.findMany({
    take: Number(filter?.limit ?? 20),
    skip: Number(filter?.offset ?? 0),

    orderBy: {
      createdAt: 'desc',
    },

    where: {
      AND: [
        authorFilter(filter?.author),
        tagListFilter(filter?.tag),
        favoritedFilter(filter?.favorited),
      ],
    },

    include: {
      author: true,
      tagList: true,
      favoritedArticles: {
        where: {
          userId,
        },
      },
      _count: {
        select: {
          favoritedArticles: true,
        },
      },
    },
  })

  return articles.map(article => {
    const { _count, favoritedArticles, ...rest } = article
    return {
      ...rest,
      favorited: favoritedArticles.length > 0,
      favoritesCount: _count ? _count.favoritedArticles : 0,
      tagList: article.tagList.map(({ name }) => name),
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString(),
    }
  })
}

function authorFilter (author?: string) {
  return {
    author: {
      username: author,
    },
  }
}

function tagListFilter (tag?: string) {
  return {
    tagList: {
      some: {
        name: tag,
      },
    },
  }
}

function favoritedFilter (favorited?: string) {
  const withFavoritedFilter = {
    favoritedArticles: {
      some: {
        user: {
          username: favorited,
        },
      },
    },
  }

  const withoutFavoritedFilter = {}

  return favorited
    ? withFavoritedFilter
    : withoutFavoritedFilter
}

export const favoriteArticleInDB = async (data: FavoriteArticleInput) => {
  try {
    const articleFromDB = await prisma.article.update({
      where: {
        slug: data.slug,
      },
      data: {
        favoritedArticles: {
          create: {
            userId: data.userId,
          },
        },
      },
      include: {
        author: true,
        tagList: true,
        _count: {
          select: {
            favoritedArticles: true,
          },
        },
      },
    })

    const { _count, ...article } = articleFromDB

    return {
      ...article,
      favorited: true,
      favoritesCount: _count ? _count.favoritedArticles : 0,
      tagList: article.tagList.map(({ name }) => name),
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString(),
    }
  } catch (error) {
    if (!(error instanceof Error)) {
      throw new UnknownError()
    }

    if (error.message.includes('Unique constraint failed on the fields: (`userId`,`articleId`)')) {
      throw new ValidationError(`The article ${data.slug} is already a favorite`)
    }

    throw new ValidationError(`Error trying to favorite article ${data.slug}`)
  }
}

export const unfavoriteArticleInDB = async (data: FavoriteArticleInput) => {
  const articleFromDB = await prisma.article.update({
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
      _count: {
        select: {
          favoritedArticles: true,
        },
      },
    },
  })

  const { _count, ...article } = articleFromDB

  return {
    ...article,
    favorited: false,
    favoritesCount: _count ? _count.favoritedArticles : 0,
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
