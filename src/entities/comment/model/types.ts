import type { UserSummary } from "@/entities/user/model/types";

/**
 * Comment 도메인 타입 정의
 */

// 댓글 타입 (API 응답)
export interface Comment {
  id: number;
  body: string;
  postId: number;
  userId: number;
  user: UserSummary;
  likes: number;
}

// 새 댓글 생성용 타입
export interface NewComment {
  body: string;
  postId: number;
  userId: number;
}

// 댓글 수정용 타입
export interface UpdateComment {
  body: string;
}

// 댓글 좋아요용 타입
export interface LikeComment {
  likes: number;
}

// 댓글 목록 API 응답
export interface CommentListResponse {
  comments: Comment[];
  total: number;
  skip: number;
  limit: number;
}
