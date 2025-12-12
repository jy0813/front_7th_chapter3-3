/**
 * 댓글 좋아요 관련 순수함수
 * - 입력값만으로 결과 계산
 * - 부수효과 없음
 */

/**
 * 좋아요 토글 후 새 likes 수 계산
 * @param currentLikes 현재 좋아요 수
 * @param willBeLiked 토글 후 좋아요 상태 (true = 좋아요 추가, false = 좋아요 취소)
 * @returns 새 좋아요 수
 */
export const calculateNewLikes = (currentLikes: number, willBeLiked: boolean): number => {
  return willBeLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1)
}
