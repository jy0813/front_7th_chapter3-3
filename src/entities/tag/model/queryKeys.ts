/**
 * Tag 도메인 쿼리 키 팩토리
 * features에서 import하여 캐시 무효화에 사용
 */
export const tagKeys = {
  // 모든 tags 관련 쿼리
  all: ["tags"] as const,

  // 목록 관련 쿼리
  lists: () => [...tagKeys.all, "list"] as const,
  list: () => [...tagKeys.lists()] as const,
};
