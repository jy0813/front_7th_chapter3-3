/**
 * 댓글 캐시 관련 순수함수
 * - QueryClient를 받아 캐시 데이터 조회
 * - 부수효과 없음, 동일 입력 → 동일 출력
 */
import type { QueryClient } from "@tanstack/react-query"
import type { Comment, CommentListResponse } from "@/entities/comment/model/types"
import { commentKeys } from "@/entities/comment/model/queryKeys"

/**
 * 캐시에서 특정 댓글 찾기 (낙관적 업데이트된 댓글 포함)
 * @param queryClient QueryClient 인스턴스
 * @param postId 게시글 ID
 * @param commentId 댓글 ID
 * @returns 찾은 댓글 또는 undefined
 */
export const findCommentInCache = (
  queryClient: QueryClient,
  postId: number,
  commentId: number,
): Comment | undefined => {
  const commentsData = queryClient.getQueryData<CommentListResponse>(commentKeys.list(postId))
  return commentsData?.comments.find((comment) => comment.id === commentId)
}
