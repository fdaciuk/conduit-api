import { Article, Comment, User } from '@prisma/client'
import {
  CreateArticleInDB,
  AddCommentToAnArticleInDB,
} from '@/ports/adapters/db/types'
import {
  ArticlesFilter,
  PaginationFilter,
  FavoriteArticleInput,
} from '@/ports/adapters/http/types'
import { TagOutput } from '@/core/tag/types'
import { UpdateArticleOutput } from '@/core/article/types'

import {
  ValidationError,
  UnknownError,
  NotFoundError,
  ForbiddenError,
} from '@/helpers/errors'
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

type UpdateArticleInput = UpdateArticleOutput & {
  updatedSlug?: string | undefined
}
export const updateArticleInDB = async (data: UpdateArticleInput) => {
  const articleToUpdate = await prisma.article.findUnique({
    where: {
      slug: data.slug,
    },
    include: {
      author: {
        select: {
          id: true,
        },
      },
    },
  })

  if (!articleToUpdate) {
    throw new NotFoundError(`The article ${data.slug} does not exist`)
  }

  if (articleToUpdate.author.id !== data.authorId) {
    throw new ForbiddenError(`You can't update ${data.slug} article. It's not yours. Get out!`)
  }

  try {
    const updatedArticle = await prisma.article.update({
      where: {
        slug: data.slug,
      },
      data: {
        title: data.title,
        body: data.body,
        description: data.description,
        slug: data.updatedSlug,
      },
      include: {
        tagList: true,
        author: true,
        favoritedArticles: {
          where: {
            userId: data.authorId,
          },
        },
        _count: {
          select: {
            favoritedArticles: true,
          },
        },
      },
    })

    const { _count, favoritedArticles, ...article } = updatedArticle

    return {
      ...article,
      author: {
        ...article.author,
        following: false,
      },
      favorited: favoritedArticles.length > 0,
      favoritesCount: _count ? _count.favoritedArticles : 0,
      tagList: article.tagList.map(tag => tag.name),
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString(),
    }
  } catch (e) {
    if (e instanceof Error) {
      throw new ValidationError(e.message)
    }

    throw new UnknownError()
  }
}

type FetchArticleInput = {
  slug: string
  userId: string
}
export const getArticleFromDB = async ({ slug, userId }: FetchArticleInput) => {
  const singleArticle = await prisma.article.findUnique({
    where: {
      slug,
    },
    include: {
      tagList: true,
      author: {
        include: {
          whoIsFollowing: {
            where: {
              userId,
            },
          },
        },
      },
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

  if (!singleArticle) {
    throw new NotFoundError(`Article ${slug} does not exist`)
  }

  const { _count, favoritedArticles, ...article } = singleArticle

  return {
    ...article,
    author: {
      ...article.author,
      following: !!article.author.whoIsFollowing.length,
    },
    favorited: favoritedArticles.length > 0,
    favoritesCount: _count ? _count.favoritedArticles : 0,
    tagList: article.tagList.map(tag => tag.name),
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
  }
}

type GetArticlesFromDBInput = {
  filter?: ArticlesFilter
  userId: string
}
export const getArticlesFromDB = async ({ filter, userId }: GetArticlesFromDBInput) => {
  const where = {
    AND: [
      authorFilter(filter?.author),
      tagListFilter(filter?.tag),
      favoritedFilter(filter?.favorited),
    ],
  }

  const articlesQuery = prisma.article.findMany({
    take: Number(filter?.limit ?? 20),
    skip: Number(filter?.offset ?? 0),

    where,

    orderBy: {
      createdAt: 'desc',
    },

    include: {
      tagList: true,
      author: {
        include: {
          whoIsFollowing: {
            where: {
              userId,
            },
          },
        },
      },
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

  const [articles, articlesCount] = await prisma.$transaction([
    articlesQuery,
    prisma.article.count({ where }),
  ])

  return {
    articlesCount,
    articles: articles.map(article => {
      const { _count, favoritedArticles, ...rest } = article
      return {
        ...rest,
        author: {
          ...rest.author,
          following: !!rest.author.whoIsFollowing.length,
        },
        favorited: favoritedArticles.length > 0,
        favoritesCount: _count ? _count.favoritedArticles : 0,
        tagList: article.tagList.map(({ name }) => name),
        createdAt: article.createdAt.toISOString(),
        updatedAt: article.updatedAt.toISOString(),
      }
    }),
  }
}

type GetArticlesFeedFromDBInput = {
  filter?: PaginationFilter
  userId: string
}
export const getArticlesFeedFromDB = async ({ filter, userId }: GetArticlesFeedFromDBInput) => {
  const following = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      following: {
        select: {
          followingId: true,
        },
      },
    },
  })

  const where = {
    author: {
      id: {
        in: following?.following.map(f => f.followingId),
      },
    },
  }

  const articlesQuery = prisma.article.findMany({
    take: Number(filter?.limit ?? 20),
    skip: Number(filter?.offset ?? 0),

    where,

    orderBy: {
      createdAt: 'desc',
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

  const [articles, articlesCount] = await prisma.$transaction([
    articlesQuery,
    prisma.article.count({ where }),
  ])

  return {
    articlesCount,
    articles: articles.map(article => {
      const { _count, favoritedArticles, ...rest } = article
      return {
        ...rest,
        favorited: favoritedArticles.length > 0,
        favoritesCount: _count ? _count.favoritedArticles : 0,
        tagList: article.tagList.map(({ name }) => name),
        createdAt: article.createdAt.toISOString(),
        updatedAt: article.updatedAt.toISOString(),
      }
    }),
  }
}

type DeleteArticleInput = {
  slug: string
  userId: string
}

export async function deleteArticleFromDB (data: DeleteArticleInput) {
  const articleToDelete = await prisma.article.findUnique({
    where: {
      slug: data.slug,
    },
    include: {
      author: {
        select: {
          id: true,
        },
      },
    },
  })

  if (!articleToDelete) {
    throw new NotFoundError(`The article ${data.slug} does not exist`)
  }

  if (articleToDelete.author.id !== data.userId) {
    throw new ForbiddenError(`You can't delete ${data.slug} article. It's not yours. Get out!`)
  }

  await prisma.article.delete({
    where: {
      slug: data.slug,
    },
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
        author: {
          include: {
            whoIsFollowing: {
              where: {
                userId: data.userId,
              },
            },
          },
        },
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
      author: {
        ...article.author,
        following: !!article.author.whoIsFollowing.length,
      },
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
      author: {
        include: {
          whoIsFollowing: {
            where: {
              userId: data.userId,
            },
          },
        },
      },
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
    author: {
      ...article.author,
      following: !!article.author.whoIsFollowing.length,
    },
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

type GetCommentsFromAnArticleInput = {
  slug: string
  userId: string
}

export const getCommentsFromAnArticleInDB = async (data: GetCommentsFromAnArticleInput) => {
  const allComments = await prisma.article.findUnique({
    where: {
      slug: data.slug,
    },
    select: {
      comments: {
        include: {
          author: {
            include: {
              whoIsFollowing: {
                where: {
                  userId: data.userId,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!allComments) {
    return []
  }

  return allComments.comments.map(comment => ({
    ...comment,
    author: {
      ...comment.author,
      following: !!comment.author.whoIsFollowing.length,
    },
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
  }))
}

type DeleteCommentInput = {
  slug: string
  commentId: number
  userId: string
}

export const deleteCommentFromDB = async (data: DeleteCommentInput) => {
  const commentToDelete = await prisma.comment.findUnique({
    where: {
      id: data.commentId,
    },
    select: {
      id: true,
      article: {
        select: {
          slug: true,
        },
      },
      author: {
        select: {
          id: true,
        },
      },
    },
  })

  if (!commentToDelete) {
    throw new NotFoundError(`The comment ID ${data.commentId} does not exist on article ${data.slug}`)
  }

  if (commentToDelete.author.id !== data.userId) {
    throw new ForbiddenError(`You can't delete the comment with ID ${data.commentId}. It's not yours. Get out!`)
  }

  await prisma.comment.delete({
    where: {
      id: data.commentId,
    },
  })
}

export const getTagsFromDB = async (): Promise<TagOutput[]> => {
  const tags = await prisma.tag.findMany()
  return tags.map(tag => tag.name)
}
