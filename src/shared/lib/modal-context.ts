import { createContext, useContext } from "react";

/**
 * 모달 타입 정의
 * 각 모달의 고유 식별자
 */
export type ModalType =
  | "postAdd"
  | "postEdit"
  | "postDetail"
  | "commentAdd"
  | "commentEdit"
  | "userDetail";

/**
 * 모달 데이터 타입 맵
 * 각 모달 타입에 따른 데이터 구조 정의
 */
export interface ModalDataMap {
  postAdd: undefined;
  postEdit: { postId: number };
  postDetail: { postId: number };
  commentAdd: { postId: number };
  commentEdit: { commentId: number; postId: number };
  userDetail: { userId: number };
}

/**
 * 모달 상태 인터페이스
 */
export interface ModalState<T extends ModalType = ModalType> {
  type: T | null;
  data: T extends keyof ModalDataMap ? ModalDataMap[T] : undefined;
}

/**
 * 모달 Context 인터페이스
 * features/widgets 레이어에서 사용
 */
export interface ModalContextValue {
  /** 현재 열린 모달 타입 */
  modalType: ModalType | null;
  /** 모달에 전달된 데이터 */
  modalData: ModalDataMap[ModalType] | undefined;
  /** 모달 열기 */
  openModal: <T extends ModalType>(
    type: T,
    data?: ModalDataMap[T]
  ) => void;
  /** 모달 닫기 */
  closeModal: () => void;
  /** 특정 모달이 열려있는지 확인 */
  isOpen: (type: ModalType) => boolean;
}

/**
 * 모달 Context
 * app/providers/ModalProvider.tsx에서 값 주입
 */
export const ModalContext = createContext<ModalContextValue | null>(null);

/**
 * 모달 Context 훅
 * features/widgets 레이어에서 모달 제어에 사용
 *
 * @example
 * const { openModal, closeModal } = useModalContext();
 * openModal('postEdit', { postId: 1 });
 */
export const useModalContext = (): ModalContextValue => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error(
      "useModalContext must be used within a ModalProvider"
    );
  }
  return context;
};
