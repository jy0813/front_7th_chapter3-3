import type { User, UserListResponse } from "@/entities/user/model/types";
import { API_BASE_URL } from "@/shared/config";

/**
 * User 도메인 API 함수
 * Read만 (사용자 CUD는 없음)
 */
export const userApi = {
  /**
   * 사용자 목록 조회 (간략 정보)
   */
  getList: async (): Promise<UserListResponse> => {
    const response = await fetch(`${API_BASE_URL}/users?limit=0&select=username,image`);
    if (!response.ok) {
      throw new Error("사용자 목록을 가져오는데 실패했습니다.");
    }
    return response.json();
  },

  /**
   * 사용자 상세 조회
   */
  getById: async (id: number): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`);
    if (!response.ok) {
      throw new Error("사용자 정보를 가져오는데 실패했습니다.");
    }
    return response.json();
  },
};
