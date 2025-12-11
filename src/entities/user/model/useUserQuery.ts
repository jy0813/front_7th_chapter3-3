import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/entities/user/api/userApi";
import { userKeys } from "@/entities/user/model/queryKeys";

/**
 * User 도메인 Query Hooks (Read만)
 * entities 레이어 - 데이터 조회
 */

/**
 * 사용자 목록 조회 (간략 정보)
 */
export const useUserList = () => {
  return useQuery({
    queryKey: userKeys.list(),
    queryFn: userApi.getList,
  });
};

/**
 * 사용자 상세 조회
 */
export const useUserDetail = (id: number) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userApi.getById(id),
    enabled: id > 0,
  });
};
