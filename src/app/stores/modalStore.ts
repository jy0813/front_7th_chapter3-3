import { create } from "zustand";
import type { ModalType, ModalDataMap, ModalStackItem } from "@/shared/lib/modal-context";

/**
 * 모달 Store 상태 인터페이스
 * 스택 기반으로 중첩 모달 지원
 */
interface ModalStoreState {
  /** 모달 스택 (중첩 모달 지원) */
  modalStack: ModalStackItem[];
}

/**
 * 모달 Store 액션 인터페이스
 */
interface ModalStoreActions {
  /** 모달 열기 (스택에 추가) */
  openModal: <T extends ModalType>(type: T, data?: ModalDataMap[T]) => void;
  /** 모달 닫기 (스택에서 최상위 제거) */
  closeModal: () => void;
  /** 모든 모달 닫기 */
  closeAllModals: () => void;
  /** 특정 모달이 열려있는지 확인 */
  isOpen: (type: ModalType) => boolean;
}

type ModalStore = ModalStoreState & ModalStoreActions;

/**
 * Zustand 모달 Store
 *
 * app 레이어에서 관리, ModalProvider를 통해 Context로 주입
 * features/widgets에서는 useModalContext() 훅으로 접근
 *
 * 스택 기반으로 중첩 모달 지원:
 * - openModal: 스택에 새 모달 추가
 * - closeModal: 최상위 모달만 제거
 * - closeAllModals: 모든 모달 제거
 */
export const useModalStore = create<ModalStore>((set, get) => ({
  // 상태
  modalStack: [],

  // 액션
  openModal: (type, data) => {
    set((state) => ({
      modalStack: [
        ...state.modalStack,
        { type, data } as ModalStackItem,
      ],
    }));
  },

  closeModal: () => {
    set((state) => ({
      modalStack: state.modalStack.slice(0, -1),
    }));
  },

  closeAllModals: () => {
    set({ modalStack: [] });
  },

  isOpen: (type) => {
    return get().modalStack.some((item) => item.type === type);
  },
}));
