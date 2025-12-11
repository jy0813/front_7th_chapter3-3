import { useQuery } from "@tanstack/react-query";
import { commentApi } from "@/entities/comment/api/commentApi";
import { commentKeys } from "@/entities/comment/model/queryKeys";

/**
 * Comment 도메인 Query Hooks (Read만)
 * entities 레이어 - 데이터 조회
 */

/**
 * 게시물별 댓글 목록 조회
 */
export const useCommentList = (postId: number) => {
  return useQuery({
    queryKey: commentKeys.list(postId),
    queryFn: () => commentApi.getByPostId(postId),
    enabled: postId > 0,
  });
};
