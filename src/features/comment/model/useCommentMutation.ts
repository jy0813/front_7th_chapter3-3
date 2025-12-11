import { useMutation, useQueryClient } from "@tanstack/react-query";
import { commentApi } from "@/entities/comment/api/commentApi";
import { commentKeys } from "@/entities/comment/model/queryKeys";
import type {
  NewComment,
  UpdateComment,
  Comment,
  CommentListResponse,
} from "@/entities/comment/model/types";

/**
 * Comment 도메인 Mutation Hooks (CUD + Like)
 * features 레이어 - 사용자 액션 처리
 */

/**
 * 댓글 생성
 */
export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: NewComment) => commentApi.create(data),
    onSuccess: (_, variables) => {
      // 해당 게시물의 댓글 목록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: commentKeys.list(variables.postId),
      });
    },
  });
};

/**
 * 댓글 수정
 */
export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateComment;
      postId: number;
    }) => commentApi.update(id, data),
    onSuccess: (_, variables) => {
      // 해당 게시물의 댓글 목록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: commentKeys.list(variables.postId),
      });
    },
  });
};

/**
 * 댓글 삭제
 */
export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: number; postId: number }) =>
      commentApi.delete(id),
    onSuccess: (_, variables) => {
      // 해당 게시물의 댓글 목록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: commentKeys.list(variables.postId),
      });
    },
  });
};

/**
 * 댓글 좋아요 (낙관적 업데이트 적용)
 */
export const useLikeComment = (postId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, likes }: { id: number; likes: number }) =>
      commentApi.like(id, { likes }),

    // 낙관적 업데이트: 서버 응답 전에 UI 먼저 업데이트
    onMutate: async ({ id, likes }) => {
      // 진행 중인 refetch 취소 (낙관적 업데이트 덮어쓰기 방지)
      await queryClient.cancelQueries({ queryKey: commentKeys.list(postId) });

      // 이전 데이터 스냅샷 저장 (롤백용)
      const previousComments = queryClient.getQueryData<CommentListResponse>(
        commentKeys.list(postId)
      );

      // 낙관적으로 캐시 업데이트
      queryClient.setQueryData<CommentListResponse>(
        commentKeys.list(postId),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            comments: old.comments.map((comment: Comment) =>
              comment.id === id ? { ...comment, likes } : comment
            ),
          };
        }
      );

      // 롤백을 위한 컨텍스트 반환
      return { previousComments };
    },

    // 에러 발생 시 이전 상태로 롤백
    onError: (_error, _variables, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(
          commentKeys.list(postId),
          context.previousComments
        );
      }
    },

    // 성공/실패 상관없이 최종적으로 서버 데이터와 동기화
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys.list(postId) });
    },
  });
};
