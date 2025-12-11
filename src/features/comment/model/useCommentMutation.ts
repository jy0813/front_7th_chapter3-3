import { useMutation, useQueryClient } from "@tanstack/react-query"
import { commentApi } from "@/entities/comment/api/commentApi"
import { commentKeys } from "@/entities/comment/model/queryKeys"
import { userKeys } from "@/entities/user/model/queryKeys"
import { DUMMYJSON_MAX_COMMENT_ID } from "@/shared/config"
import type { NewComment, UpdateComment, Comment, CommentListResponse } from "@/entities/comment/model/types"
import type { UserListResponse } from "@/entities/user/model/types"

/**
 * Comment 도메인 Mutation Hooks (CUD + Like)
 * features 레이어 - 사용자 액션 처리
 *
 * 낙관적 업데이트: API 호출 전에 UI 먼저 업데이트
 * DummyJSON mock API 특성:
 * - ID 1~340: 실제 존재하는 데이터 → 에러 시 롤백 필요
 * - ID 341+: 낙관적으로 생성된 가짜 데이터 → 에러 시 롤백 안 함
 */

/**
 * 댓글 생성 (낙관적 업데이트)
 */
export const useCreateComment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: NewComment) => commentApi.create(data),
    onMutate: async (newCommentData) => {
      await queryClient.cancelQueries({ queryKey: commentKeys.list(newCommentData.postId) })

      const previousComments = queryClient.getQueryData<CommentListResponse>(
        commentKeys.list(newCommentData.postId)
      )

      // 현재 total 기반으로 ID 생성 (댓글 ID는 341부터 시작)
      const newId = DUMMYJSON_MAX_COMMENT_ID + (previousComments?.total ?? 0) + 1

      // 사용자 정보 캐시에서 가져오기
      const userListData = queryClient.getQueryData<UserListResponse>(userKeys.list())
      const user = userListData?.users.find((u) => u.id === newCommentData.userId)

      const newComment: Comment = {
        id: newId,
        body: newCommentData.body,
        postId: newCommentData.postId,
        userId: newCommentData.userId,
        likes: 0,
        user: {
          id: newCommentData.userId,
          username: user?.username ?? "사용자",
        },
      }

      queryClient.setQueryData<CommentListResponse>(commentKeys.list(newCommentData.postId), (old) => {
        // 캐시가 없으면 새로 생성 (낙관적 게시글의 경우)
        if (!old) {
          return {
            comments: [newComment],
            total: 1,
            skip: 0,
            limit: 0,
          }
        }
        return {
          ...old,
          comments: [...old.comments, newComment],
          total: old.total + 1,
        }
      })

      return { previousComments, postId: newCommentData.postId }
    },
    // 생성은 항상 새 ID이므로 롤백 불필요 (341+ 이므로)
  })
}

/**
 * 댓글 수정 (낙관적 업데이트)
 */
export const useUpdateComment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateComment; postId: number }) => commentApi.update(id, data),
    onMutate: async ({ id, data, postId }) => {
      await queryClient.cancelQueries({ queryKey: commentKeys.list(postId) })

      const previousComments = queryClient.getQueryData<CommentListResponse>(commentKeys.list(postId))

      queryClient.setQueryData<CommentListResponse>(commentKeys.list(postId), (old) => {
        if (!old) return old
        return {
          ...old,
          comments: old.comments.map((comment) => (comment.id === id ? { ...comment, ...data } : comment)),
        }
      })

      return { previousComments, postId, commentId: id }
    },
    onError: (_error, variables, context) => {
      // 실제 DummyJSON 데이터(ID 1~340)만 롤백
      if (variables.id <= DUMMYJSON_MAX_COMMENT_ID) {
        if (context?.previousComments && context?.postId) {
          queryClient.setQueryData(commentKeys.list(context.postId), context.previousComments)
        }
      }
      // ID 341+는 낙관적으로 생성된 가짜 데이터이므로 롤백 안 함
    },
  })
}

/**
 * 댓글 삭제 (낙관적 업데이트)
 */
export const useDeleteComment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: number; postId: number }) => commentApi.delete(id),
    onMutate: async ({ id, postId }) => {
      await queryClient.cancelQueries({ queryKey: commentKeys.list(postId) })

      const previousComments = queryClient.getQueryData<CommentListResponse>(commentKeys.list(postId))

      queryClient.setQueryData<CommentListResponse>(commentKeys.list(postId), (old) => {
        if (!old) return old
        return {
          ...old,
          comments: old.comments.filter((comment) => comment.id !== id),
          total: old.total - 1,
        }
      })

      return { previousComments, postId, deletedId: id }
    },
    onError: (_error, variables, context) => {
      // 실제 DummyJSON 데이터(ID 1~340)만 롤백
      if (variables.id <= DUMMYJSON_MAX_COMMENT_ID) {
        if (context?.previousComments && context?.postId) {
          queryClient.setQueryData(commentKeys.list(context.postId), context.previousComments)
        }
      }
      // ID 341+는 낙관적으로 생성된 가짜 데이터이므로 롤백 안 함
    },
  })
}

/**
 * 댓글 좋아요 토글 (낙관적 업데이트)
 *
 * - 좋아요 안 누른 상태 → 좋아요 추가 (+1)
 * - 좋아요 누른 상태 → 좋아요 취소 (-1)
 */
export const useLikeComment = (postId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, likes }: { id: number; likes: number }) => commentApi.like(id, { likes }),
    onMutate: async ({ id, likes }) => {
      await queryClient.cancelQueries({ queryKey: commentKeys.list(postId) })

      const previousComments = queryClient.getQueryData<CommentListResponse>(commentKeys.list(postId))

      queryClient.setQueryData<CommentListResponse>(commentKeys.list(postId), (old) => {
        if (!old) return old
        return {
          ...old,
          comments: old.comments.map((comment: Comment) => (comment.id === id ? { ...comment, likes } : comment)),
        }
      })

      return { previousComments, likedId: id }
    },
    onError: (_error, variables, context) => {
      // 실제 DummyJSON 데이터(ID 1~340)만 롤백
      if (variables.id <= DUMMYJSON_MAX_COMMENT_ID) {
        if (context?.previousComments) {
          queryClient.setQueryData(commentKeys.list(postId), context.previousComments)
        }
      }
      // ID 341+는 낙관적으로 생성된 가짜 데이터이므로 롤백 안 함
    },
  })
}
