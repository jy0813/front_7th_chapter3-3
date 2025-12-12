/**
 * 모달 관련 순수함수
 */
import type { ModalType } from "@/shared/lib/modal-context"

/**
 * 모달 타입에 따른 기본 타이틀 반환
 * @param modalType 모달 타입
 * @returns 기본 타이틀 문자열
 */
export const getDefaultModalTitle = (modalType: ModalType): string => {
  switch (modalType) {
    case "postAdd":
      return "새 게시물 추가"
    case "postEdit":
      return "게시물 수정"
    case "postDetail":
      return "게시물 상세"
    case "commentAdd":
      return "새 댓글 추가"
    case "commentEdit":
      return "댓글 수정"
    case "userDetail":
      return "사용자 정보"
    default:
      return ""
  }
}
