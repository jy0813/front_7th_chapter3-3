import type { PostListParams } from "@/entities/post/model/types";

/**
 * Post 도메인 쿼리 키 팩토리
 * features에서 import하여 캐시 무효화에 사용
 */
export const postKeys = {
  // 모든 posts 관련 쿼리
  all: ["posts"] as const,

  // 목록 관련 쿼리
  lists: () => [...postKeys.all, "list"] as const,
  list: (params: PostListParams) => [...postKeys.lists(), params] as const,

  // 상세 관련 쿼리
  details: () => [...postKeys.all, "detail"] as const,
  detail: (id: number) => [...postKeys.details(), id] as const,

  // 검색 관련 쿼리
  search: (query: string) => [...postKeys.all, "search", query] as const,

  // 태그별 조회
  byTag: (tag: string) => [...postKeys.all, "tag", tag] as const,
};
