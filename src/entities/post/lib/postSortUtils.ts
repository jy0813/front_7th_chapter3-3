/**
 * Post 정렬 관련 순수함수
 */
import type { Post } from "@/entities/post/model/types"

export type SortField = "id" | "title" | "reactions" | "none" | ""
export type SortOrder = "asc" | "desc"

/**
 * 게시글 정렬
 */
export const sortPosts = (posts: Post[], sortBy: SortField, order: SortOrder): Post[] => {
  if (!sortBy || sortBy === "none") return posts

  return [...posts].sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case "id":
        comparison = a.id - b.id
        break
      case "title":
        comparison = a.title.localeCompare(b.title)
        break
      case "reactions":
        comparison = (a.reactions?.likes || 0) - (b.reactions?.likes || 0)
        break
      default:
        return 0
    }

    return order === "desc" ? -comparison : comparison
  })
}
