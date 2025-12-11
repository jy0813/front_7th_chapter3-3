/**
 * Comment 도메인 쿼리 키 팩토리
 * features에서 import하여 캐시 무효화에 사용
 */
export const commentKeys = {
  // 모든 comments 관련 쿼리
  all: ["comments"] as const,

  // 목록 관련 쿼리 (postId별)
  lists: () => [...commentKeys.all, "list"] as const,
  list: (postId: number) => [...commentKeys.lists(), postId] as const,

  // 상세 관련 쿼리
  details: () => [...commentKeys.all, "detail"] as const,
  detail: (id: number) => [...commentKeys.details(), id] as const,
};
