/**
 * Tag 도메인 타입 정의
 */

// 태그 타입 (API 응답)
export interface Tag {
  slug: string;
  name: string;
  url: string;
}

// 태그 목록 (API는 배열로 응답)
export type TagListResponse = Tag[];
