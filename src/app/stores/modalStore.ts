import { create } from "zustand";
import type { ModalType, ModalDataMap } from "@/shared/lib/modal-context";

/**
 * 모달 Store 상태 인터페이스
 */
interface ModalStoreState {
  /** 현재 열린 모달 타입 */
  modalType: ModalType | null;
  /** 모달에 전달된 데이터 */
  modalData: ModalDataMap[ModalType] | undefined;
}

/**
 * 모달 Store 액션 인터페이스
 */
interface ModalStoreActions {
  /** 모달 열기 */
  openModal: <T extends ModalType>(type: T, data?: ModalDataMap[T]) => void;
  /** 모달 닫기 */
  closeModal: () => void;
  /** 특정 모달이 열려있는지 확인 */
  isOpen: (type: ModalType) => boolean;
}

type ModalStore = ModalStoreState & ModalStoreActions;

/**
 * Zustand 모달 Store
 *
 * app 레이어에서 관리, ModalProvider를 통해 Context로 주입
 * features/widgets에서는 useModalContext() 훅으로 접근
 */
export const useModalStore = create<ModalStore>((set, get) => ({
  // 상태
  modalType: null,
  modalData: undefined,

  // 액션
  openModal: (type, data) => {
    set({
      modalType: type,
      modalData: data,
    });
  },

  closeModal: () => {
    set({
      modalType: null,
      modalData: undefined,
    });
  },

  isOpen: (type) => {
    return get().modalType === type;
  },
}));
