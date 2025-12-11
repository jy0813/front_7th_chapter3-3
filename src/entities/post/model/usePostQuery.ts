import { useQuery } from "@tanstack/react-query";
import { postApi } from "@/entities/post/api/postApi";
import { postKeys } from "@/entities/post/model/queryKeys";
import type { PostListParams } from "@/entities/post/model/types";

/**
 * Post 도메인 Query Hooks (Read만)
 * entities 레이어 - 데이터 조회
 */

/**
 * 게시물 목록 조회
 */
export const usePostList = (params: PostListParams) => {
  return useQuery({
    queryKey: postKeys.list(params),
    queryFn: () =>
      params.tag ? postApi.getByTag(params.tag) : postApi.getList(params),
  });
};

/**
 * 게시물 상세 조회
 */
export const usePostDetail = (id: number) => {
  return useQuery({
    queryKey: postKeys.detail(id),
    queryFn: () => postApi.getById(id),
    enabled: id > 0,
  });
};

/**
 * 게시물 검색
 */
export const usePostSearch = (query: string) => {
  return useQuery({
    queryKey: postKeys.search(query),
    queryFn: () => postApi.search(query),
    enabled: query.length > 0,
  });
};
