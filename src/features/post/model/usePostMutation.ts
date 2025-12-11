import { useMutation, useQueryClient } from "@tanstack/react-query"
import { postApi } from "@/entities/post/api/postApi"
import { postKeys } from "@/entities/post/model/queryKeys"
import { useModifiedPostStore } from "@/entities/post/model/modifiedPostStore"
import { usePostIdStore } from "@/entities/post/model/postIdStore"
import { DUMMYJSON_MAX_POST_ID } from "@/shared/config"
import type { NewPost, UpdatePost, Post, PostListResponse } from "@/entities/post/model/types"

/**
 * Post 도메인 Mutation Hooks (CUD)
 * features 레이어 - 사용자 액션 처리
 *
 * 낙관적 업데이트: API 호출 전에 UI 먼저 업데이트
 * DummyJSON mock API 특성:
 * - ID 1~251: 실제 존재하는 데이터 → 에러 시 롤백 필요
 * - ID 252+: 낙관적으로 생성된 가짜 데이터 → 에러 시 롤백 안 함
 */

/**
 * 게시물 생성 (낙관적 업데이트)
 */
export const useCreatePost = () => {
  const queryClient = useQueryClient()
  const generateId = usePostIdStore((state) => state.generateId)

  return useMutation({
    mutationFn: (data: NewPost) => postApi.create(data),
    onMutate: async (newPostData) => {
      await queryClient.cancelQueries({ queryKey: postKeys.lists() })

      const previousData = queryClient.getQueriesData<PostListResponse>({ queryKey: postKeys.lists() })

      // 전역 카운터에서 고유 ID 생성 (삭제 후 재생성해도 충돌 없음)
      const newId = generateId()

      const newPost: Post = {
        id: newId,
        ...newPostData,
        tags: newPostData.tags ?? [],
        reactions: { likes: 0, dislikes: 0 },
        views: 0,
      }

      queryClient.setQueriesData<PostListResponse>({ queryKey: postKeys.lists() }, (old) => {
        if (!old) return old
        return {
          ...old,
          posts: [newPost, ...old.posts],
          total: old.total + 1,
        }
      })

      return { previousData }
    },
    // 생성은 항상 새 ID이므로 롤백 불필요 (252+ 이므로)
  })
}

/**
 * 게시물 수정 (낙관적 업데이트)
 */
export const useUpdatePost = () => {
  const queryClient = useQueryClient()
  const addModifiedId = useModifiedPostStore((state) => state.addModifiedId)

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePost }) => postApi.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: postKeys.lists() })
      await queryClient.cancelQueries({ queryKey: postKeys.detail(id) })

      const previousLists = queryClient.getQueriesData<PostListResponse>({ queryKey: postKeys.lists() })
      const previousDetail = queryClient.getQueryData<Post>(postKeys.detail(id))

      // 목록 캐시 낙관적 업데이트
      queryClient.setQueriesData<PostListResponse>({ queryKey: postKeys.lists() }, (old) => {
        if (!old) return old
        return {
          ...old,
          posts: old.posts.map((post) => (post.id === id ? { ...post, ...data } : post)),
        }
      })

      // 상세 캐시 낙관적 업데이트
      queryClient.setQueryData<Post>(postKeys.detail(id), (old) => {
        if (!old) return old
        return { ...old, ...data }
      })

      // 기존 게시글(ID 1~251) 수정 시 ID 추적
      if (id <= DUMMYJSON_MAX_POST_ID) {
        addModifiedId(id)
      }

      return { previousLists, previousDetail, id }
    },
    onError: (_error, variables, context) => {
      // 실제 DummyJSON 데이터(ID 1~251)만 롤백
      if (variables.id <= DUMMYJSON_MAX_POST_ID) {
        if (context?.previousLists) {
          context.previousLists.forEach(([queryKey, data]) => {
            queryClient.setQueryData(queryKey, data)
          })
        }
        if (context?.previousDetail && context?.id) {
          queryClient.setQueryData(postKeys.detail(context.id), context.previousDetail)
        }
      }
      // ID 252+는 낙관적으로 생성된 가짜 데이터이므로 롤백 안 함
    },
  })
}

/**
 * 게시물 삭제 (낙관적 업데이트)
 */
export const useDeletePost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => postApi.delete(id),
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: postKeys.lists() })

      const previousData = queryClient.getQueriesData<PostListResponse>({ queryKey: postKeys.lists() })

      queryClient.setQueriesData<PostListResponse>({ queryKey: postKeys.lists() }, (old) => {
        if (!old) return old
        return {
          ...old,
          posts: old.posts.filter((post) => post.id !== deletedId),
          total: old.total - 1,
        }
      })

      return { previousData, deletedId }
    },
    onError: (_error, deletedId, context) => {
      // 실제 DummyJSON 데이터(ID 1~251)만 롤백
      if (deletedId <= DUMMYJSON_MAX_POST_ID) {
        if (context?.previousData) {
          context.previousData.forEach(([queryKey, data]) => {
            queryClient.setQueryData(queryKey, data)
          })
        }
      }
      // ID 252+는 낙관적으로 생성된 가짜 데이터이므로 롤백 안 함
    },
  })
}
