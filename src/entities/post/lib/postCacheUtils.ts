/**
 * Post 캐시 관련 순수함수
 * - QueryClient를 받아 캐시 데이터 조회
 * - 부수효과 없음, 동일 입력 → 동일 출력
 */
import type { QueryClient } from "@tanstack/react-query"
import type { Post, PostListResponse } from "@/entities/post/model/types"
import { postKeys } from "@/entities/post/model/queryKeys"
import { DUMMYJSON_MAX_POST_ID } from "@/shared/config"

/**
 * 캐시에서 낙관적 게시글(ID > 251) 추출
 */
export const getOptimisticPosts = (queryClient: QueryClient): Post[] => {
  const allListCaches = queryClient.getQueriesData<PostListResponse>({
    queryKey: postKeys.lists(),
  })
  const optimisticPosts: Post[] = []
  const seenIds = new Set<number>()

  for (const [, data] of allListCaches) {
    if (data?.posts) {
      for (const post of data.posts) {
        if (post.id > DUMMYJSON_MAX_POST_ID && !seenIds.has(post.id)) {
          optimisticPosts.push(post)
          seenIds.add(post.id)
        }
      }
    }
  }

  return optimisticPosts
}

/**
 * 캐시에서 특정 ID의 게시글 찾기
 */
export const getCachedPost = (queryClient: QueryClient, postId: number): Post | undefined => {
  const allListCaches = queryClient.getQueriesData<PostListResponse>({
    queryKey: postKeys.lists(),
  })

  for (const [, data] of allListCaches) {
    if (data?.posts) {
      const found = data.posts.find((post) => post.id === postId)
      if (found) return found
    }
  }

  return undefined
}

/**
 * 캐시에서 게시글 찾기 (목록 캐시 검색)
 * PostForm에서 사용 - getCachedPost의 alias
 */
export const findPostInCache = (queryClient: QueryClient, postId: number): Post | undefined => {
  return getCachedPost(queryClient, postId)
}
