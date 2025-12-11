import { useQuery } from "@tanstack/react-query";
import { commentApi } from "@/entities/comment/api/commentApi";
import { commentKeys } from "@/entities/comment/model/queryKeys";
import { DUMMYJSON_MAX_POST_ID } from "@/shared/config";

/**
 * Comment 도메인 Query Hooks (Read만)
 * entities 레이어 - 데이터 조회
 */

/**
 * 게시물별 댓글 목록 조회
 * - ID 1~251 (실제 게시글): API에서 댓글 조회
 * - ID 252+ (낙관적 생성 게시글): API 호출 안함, 캐시에서만 관리
 */
export const useCommentList = (postId: number) => {
  const isRealPost = postId > 0 && postId <= DUMMYJSON_MAX_POST_ID;

  return useQuery({
    queryKey: commentKeys.list(postId),
    queryFn: () => commentApi.getByPostId(postId),
    // 실제 게시글만 API 호출, 낙관적 생성 게시글은 enabled: false
    enabled: isRealPost,
    // 낙관적 게시글의 경우 초기 데이터 제공 (빈 댓글 목록)
    placeholderData: isRealPost ? undefined : { comments: [], total: 0, skip: 0, limit: 0 },
  });
};
