/**
 * Post 데이터 변환 관련 순수함수
 */
import type { Post } from "@/entities/post/model/types"
import type { User } from "@/entities/user/model/types"

/**
 * 게시글에 작성자 정보 매핑
 */
export const mapPostWithAuthor = (post: Post, users: User[]): Post => ({
  ...post,
  author: users.find((user) => user.id === post.userId),
})

/**
 * 게시글 배열에 작성자 정보 매핑
 */
export const mapPostsWithAuthors = (posts: Post[], users: User[]): Post[] => {
  return posts.map((post) => mapPostWithAuthor(post, users))
}

/**
 * 중복 제거하여 게시글 병합
 * primaryPosts가 우선, secondaryPosts에서 중복 ID 제외
 */
export const mergePostsUnique = (primaryPosts: Post[], secondaryPosts: Post[]): Post[] => {
  const primaryIds = new Set(primaryPosts.map((p) => p.id))
  const uniqueSecondary = secondaryPosts.filter((p) => !primaryIds.has(p.id))
  return [...primaryPosts, ...uniqueSecondary]
}
