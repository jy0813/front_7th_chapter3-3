/**
 * DummyJSON API 관련 상수
 * Mock API의 실제 데이터 범위 정의
 *
 * - 실제 데이터: API에 존재하며 CRUD 가능
 * - 낙관적 생성 데이터: 클라이언트에서만 존재 (캐시)
 */

// DummyJSON의 실제 게시물 데이터 최대 ID (1~251)
export const DUMMYJSON_MAX_POST_ID = 251

// DummyJSON의 실제 댓글 데이터 최대 ID (1~340)
export const DUMMYJSON_MAX_COMMENT_ID = 340

// DummyJSON의 실제 사용자 데이터 최대 ID (1~208)
export const DUMMYJSON_MAX_USER_ID = 208

/**
 * ID가 실제 DummyJSON 데이터인지 확인
 */
export const isRealPostId = (id: number): boolean => id <= DUMMYJSON_MAX_POST_ID

export const isRealCommentId = (id: number): boolean => id <= DUMMYJSON_MAX_COMMENT_ID

export const isRealUserId = (id: number): boolean => id <= DUMMYJSON_MAX_USER_ID
