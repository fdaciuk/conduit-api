export type ArticlesFilter = {
  tag?: string
  author?: string
  favorited?: string
  limit?: number
  offset?: number
}

export type FavoriteArticleInput = {
  slug: string
  userId: string
}
