export type PaginationFilter = {
  limit?: number
  offset?: number
}

export type ArticlesFilter = PaginationFilter & {
  tag?: string
  author?: string
  favorited?: string
}

export type FavoriteArticleInput = {
  slug: string
  userId: string
}
