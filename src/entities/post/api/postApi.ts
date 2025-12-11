import type {
  Post,
  NewPost,
  UpdatePost,
  PostListParams,
  PostListResponse,
} from "@/entities/post/model/types";

/**
 * Post 도메인 API 함수
 * 모든 CRUD 작업을 포함 (features에서 Mutation용으로 import)
 */
export const postApi = {
  /**
   * 게시물 목록 조회
   */
  getList: async (params: PostListParams): Promise<PostListResponse> => {
    const searchParams = new URLSearchParams({
      limit: String(params.limit),
      skip: String(params.skip),
    });

    if (params.sortBy && params.sortBy !== "none") {
      searchParams.set("sortBy", params.sortBy);
    }
    if (params.order) {
      searchParams.set("order", params.order);
    }

    const response = await fetch(`/api/posts?${searchParams.toString()}`);
    if (!response.ok) {
      throw new Error("게시물 목록을 가져오는데 실패했습니다.");
    }
    return response.json();
  },

  /**
   * 게시물 상세 조회
   */
  getById: async (id: number): Promise<Post> => {
    const response = await fetch(`/api/posts/${id}`);
    if (!response.ok) {
      throw new Error("게시물을 가져오는데 실패했습니다.");
    }
    return response.json();
  },

  /**
   * 게시물 검색
   */
  search: async (query: string): Promise<PostListResponse> => {
    const response = await fetch(`/api/posts/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error("게시물 검색에 실패했습니다.");
    }
    return response.json();
  },

  /**
   * 태그별 게시물 조회
   */
  getByTag: async (tag: string): Promise<PostListResponse> => {
    const response = await fetch(`/api/posts/tag/${encodeURIComponent(tag)}`);
    if (!response.ok) {
      throw new Error("태그별 게시물을 가져오는데 실패했습니다.");
    }
    return response.json();
  },

  /**
   * 게시물 생성
   */
  create: async (data: NewPost): Promise<Post> => {
    const response = await fetch("/api/posts/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error("게시물 추가에 실패했습니다.");
    }
    return response.json();
  },

  /**
   * 게시물 수정
   */
  update: async (id: number, data: UpdatePost): Promise<Post> => {
    const response = await fetch(`/api/posts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error("게시물 수정에 실패했습니다.");
    }
    return response.json();
  },

  /**
   * 게시물 삭제
   */
  delete: async (id: number): Promise<void> => {
    const response = await fetch(`/api/posts/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("게시물 삭제에 실패했습니다.");
    }
  },
};
