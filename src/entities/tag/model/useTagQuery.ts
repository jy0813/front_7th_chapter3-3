import { useQuery } from "@tanstack/react-query";
import { tagApi } from "@/entities/tag/api/tagApi";
import { tagKeys } from "@/entities/tag/model/queryKeys";

/**
 * Tag 도메인 Query Hooks (Read만)
 * entities 레이어 - 데이터 조회
 */

/**
 * 태그 목록 조회
 */
export const useTagList = () => {
  return useQuery({
    queryKey: tagKeys.list(),
    queryFn: tagApi.getList,
  });
};
