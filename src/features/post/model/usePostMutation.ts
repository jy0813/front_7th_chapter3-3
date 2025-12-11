import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postApi } from "@/entities/post/api/postApi";
import { postKeys } from "@/entities/post/model/queryKeys";
import type { NewPost, UpdatePost } from "@/entities/post/model/types";

/**
 * Post 도메인 Mutation Hooks (CUD)
 * features 레이어 - 사용자 액션 처리
 */

/**
 * 게시물 생성
 */
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: NewPost) => postApi.create(data),
    onSuccess: () => {
      // 게시물 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
};

/**
 * 게시물 수정
 */
export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePost }) =>
      postApi.update(id, data),
    onSuccess: (_, variables) => {
      // 해당 게시물 상세 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: postKeys.detail(variables.id),
      });
      // 게시물 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
};

/**
 * 게시물 삭제
 */
export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => postApi.delete(id),
    onSuccess: () => {
      // 게시물 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
};
