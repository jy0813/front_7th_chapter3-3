import type {
  Comment,
  NewComment,
  UpdateComment,
  LikeComment,
  CommentListResponse,
} from "@/entities/comment/model/types";

/**
 * Comment 도메인 API 함수
 * 모든 CRUD 작업을 포함 (features에서 Mutation용으로 import)
 */
export const commentApi = {
  /**
   * 게시물별 댓글 목록 조회
   */
  getByPostId: async (postId: number): Promise<CommentListResponse> => {
    const response = await fetch(`/api/comments/post/${postId}`);
    if (!response.ok) {
      throw new Error("댓글을 가져오는데 실패했습니다.");
    }
    return response.json();
  },

  /**
   * 댓글 생성
   */
  create: async (data: NewComment): Promise<Comment> => {
    const response = await fetch("/api/comments/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error("댓글 추가에 실패했습니다.");
    }
    return response.json();
  },

  /**
   * 댓글 수정
   */
  update: async (id: number, data: UpdateComment): Promise<Comment> => {
    const response = await fetch(`/api/comments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error("댓글 수정에 실패했습니다.");
    }
    return response.json();
  },

  /**
   * 댓글 삭제
   */
  delete: async (id: number): Promise<void> => {
    const response = await fetch(`/api/comments/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("댓글 삭제에 실패했습니다.");
    }
  },

  /**
   * 댓글 좋아요
   */
  like: async (id: number, data: LikeComment): Promise<Comment> => {
    const response = await fetch(`/api/comments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error("댓글 좋아요에 실패했습니다.");
    }
    return response.json();
  },
};
