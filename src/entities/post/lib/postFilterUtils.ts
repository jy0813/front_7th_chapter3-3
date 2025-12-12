/**
 * Post 필터/검색 관련 순수함수
 * - 입력 데이터만으로 필터링 결과 반환
 * - 외부 상태 의존 없음
 */
import type { Post } from "@/entities/post/model/types"

export interface FilterConditions {
  searchQuery?: string
  selectedTag?: string
}

/**
 * 검색어 매칭 여부 확인
 */
export const matchesSearchQuery = (post: Post, query: string): boolean => {
  if (!query) return true

  const lowerQuery = query.toLowerCase()
  const titleMatch = post.title.toLowerCase().includes(lowerQuery)
  const bodyMatch = post.body.toLowerCase().includes(lowerQuery)

  return titleMatch || bodyMatch
}

/**
 * 태그 필터 매칭 여부 확인
 */
export const matchesTagFilter = (post: Post, tag: string): boolean => {
  if (!tag || tag === "all") return true
  return post.tags?.includes(tag) ?? false
}

/**
 * 모든 필터 조건에 맞는지 확인
 */
export const matchesAllFilters = (post: Post, conditions: FilterConditions): boolean => {
  const { searchQuery, selectedTag } = conditions

  if (searchQuery && !matchesSearchQuery(post, searchQuery)) {
    return false
  }

  if (selectedTag && !matchesTagFilter(post, selectedTag)) {
    return false
  }

  return true
}

/**
 * 게시글 배열 필터링
 */
export const filterPosts = (posts: Post[], conditions: FilterConditions): Post[] => {
  return posts.filter((post) => matchesAllFilters(post, conditions))
}

/**
 * 활성화된 필터가 있는지 확인 (PostSearchFilter 용)
 * @param searchQuery 검색어
 * @param selectedTag 선택된 태그
 * @param sortBy 정렬 기준
 * @param order 정렬 순서
 * @returns 필터/정렬이 적용되었는지 여부
 */
export const hasActiveFilters = (
  searchQuery: string,
  selectedTag: string,
  sortBy: string,
  order: string,
): boolean => {
  return Boolean(searchQuery) || Boolean(selectedTag) || Boolean(sortBy) || order !== "asc"
}
