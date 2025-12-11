/**
 * User 도메인 쿼리 키 팩토리
 * features에서 import하여 캐시 무효화에 사용
 */
export const userKeys = {
  // 모든 users 관련 쿼리
  all: ["users"] as const,

  // 목록 관련 쿼리
  lists: () => [...userKeys.all, "list"] as const,
  list: () => [...userKeys.lists()] as const,

  // 상세 관련 쿼리
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
};
