/**
 * 게시글 처리 로직 통합 Hook
 * - 순수함수들을 조합하여 최종 게시글 목록 생성
 * - 낙관적 업데이트, 캐시 동기화, 필터링, 정렬 처리
 */
import { useMemo } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useModifiedPostStore } from "@/entities/post/model/modifiedPostStore"
import {
  getOptimisticPosts,
  getCachedPost,
  filterPosts,
  sortPosts,
  mapPostsWithAuthors,
  mergePostsUnique,
} from "@/entities/post/lib"
import type { SortField, SortOrder } from "@/entities/post/lib/postSortUtils"
import { DUMMYJSON_MAX_POST_ID } from "@/shared/config"
import type { Post, PostListResponse } from "@/entities/post/model/types"
import type { User } from "@/entities/user/model/types"
import type { QueryClient } from "@tanstack/react-query"

interface UseProcessedPostsParams {
  postsData?: PostListResponse
  searchData?: PostListResponse
  users: User[]
  isSearching: boolean
  searchQuery: string
  selectedTag: string
  sortBy: string
  order: "asc" | "desc"
}

interface UseProcessedPostsResult {
  posts: Post[]
  total: number
}

/**
 * 수정된 게시글을 캐시 버전으로 교체 (순수함수)
 */
const replaceWithCachedPosts = (
  posts: Post[],
  modifiedIds: Set<number>,
  queryClient: QueryClient,
): Post[] => {
  return posts.map((post) => {
    if (post.id <= DUMMYJSON_MAX_POST_ID && modifiedIds.has(post.id)) {
      const cachedPost = getCachedPost(queryClient, post.id)
      if (cachedPost) return cachedPost
    }
    return post
  })
}

/**
 * 게시글 처리 로직 통합 Hook
 */
export const useProcessedPosts = ({
  postsData,
  searchData,
  users,
  isSearching,
  searchQuery,
  selectedTag,
  sortBy,
  order,
}: UseProcessedPostsParams): UseProcessedPostsResult => {
  const queryClient = useQueryClient()
  const modifiedIds = useModifiedPostStore((state) => state.modifiedIds)

  const { posts, total } = useMemo(() => {
    // 1. 원본 데이터 결정
    const rawPosts = isSearching ? (searchData?.posts ?? []) : (postsData?.posts ?? [])
    const totalCount = isSearching ? (searchData?.total ?? 0) : (postsData?.total ?? 0)

    // 2. 낙관적 게시글 추출 및 필터링
    const optimisticPosts = getOptimisticPosts(queryClient)
    const filteredOptimistic = filterPosts(optimisticPosts, {
      searchQuery: isSearching ? searchQuery : undefined,
      selectedTag: selectedTag || undefined,
    })

    // 3. 수정된 게시글 캐시 버전으로 교체
    const processedPosts = replaceWithCachedPosts(rawPosts, modifiedIds, queryClient)

    // 4. 필터 적용
    const filteredPosts = filterPosts(processedPosts, {
      searchQuery: isSearching ? searchQuery : undefined,
      selectedTag: selectedTag || undefined,
    })

    // 5. 중복 제거 및 병합 (낙관적 게시글 우선)
    const mergedPosts = mergePostsUnique(filteredOptimistic, filteredPosts)

    // 6. 작성자 정보 매핑
    const mappedPosts = mapPostsWithAuthors(mergedPosts, users)

    // 7. 정렬 (검색 결과만 클라이언트 정렬)
    const sortedPosts = isSearching
      ? sortPosts(mappedPosts, sortBy as SortField, order as SortOrder)
      : mappedPosts

    return {
      posts: sortedPosts,
      total: totalCount + filteredOptimistic.length,
    }
  }, [isSearching, searchData, postsData, users, queryClient, searchQuery, selectedTag, modifiedIds, sortBy, order])

  return { posts, total }
}
