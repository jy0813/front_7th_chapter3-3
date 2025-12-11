import type { User } from "@/entities/user/model/types";

/**
 * Post 도메인 타입 정의
 */

// 게시물 반응 타입
export interface PostReactions {
  likes: number;
  dislikes: number;
}

// 게시물 타입 (API 응답)
export interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
  tags: string[];
  reactions: PostReactions;
  views?: number;
  author?: User; // 조인된 사용자 정보
}

// 새 게시물 생성용 타입
export interface NewPost {
  title: string;
  body: string;
  userId: number;
  tags?: string[];
}

// 게시물 수정용 타입
export interface UpdatePost {
  title?: string;
  body?: string;
  tags?: string[];
}

// 게시물 목록 조회 파라미터
export interface PostListParams {
  limit: number;
  skip: number;
  tag?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}

// 게시물 목록 API 응답
export interface PostListResponse {
  posts: Post[];
  total: number;
  skip: number;
  limit: number;
}

// 게시물 검색 파라미터
export interface PostSearchParams {
  q: string;
}
