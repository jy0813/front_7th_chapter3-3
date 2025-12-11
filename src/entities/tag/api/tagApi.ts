import type { TagListResponse } from "@/entities/tag/model/types";

/**
 * Tag 도메인 API 함수
 * Read만 (태그 CUD는 없음)
 */
export const tagApi = {
  /**
   * 태그 목록 조회
   */
  getList: async (): Promise<TagListResponse> => {
    const response = await fetch("/api/posts/tags");
    if (!response.ok) {
      throw new Error("태그 목록을 가져오는데 실패했습니다.");
    }
    return response.json();
  },
};
