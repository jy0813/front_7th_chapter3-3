import type { ReactNode } from "react";
import { ModalContext } from "@/shared/lib/modal-context";
import { useModalStore } from "@/app/stores/modalStore";

/**
 * ModalProvider Props
 */
interface ModalProviderProps {
  children: ReactNode;
}

/**
 * 모달 Context Provider
 *
 * Zustand Store를 Context에 연결하여
 * features/widgets 레이어에서 useModalContext()로 접근 가능하게 함
 *
 * 스택 기반 중첩 모달 지원:
 * - modalStack: 전체 모달 스택
 * - modalType/modalData: 하위 호환성을 위한 최상위 모달 정보
 * - closeAllModals: 모든 모달 닫기
 *
 * 이 패턴을 사용하는 이유:
 * - FSD 아키텍처에서 하위 레이어(features)는 상위 레이어(app)를 import할 수 없음
 * - shared/lib/modal-context.ts에 인터페이스만 정의
 * - app 레이어에서 Zustand로 구현하고 Context로 주입
 * - features에서는 useModalContext() 훅으로 접근 (ESLint 규칙 준수)
 *
 * @example
 * // App.tsx
 * <ModalProvider>
 *   <App />
 * </ModalProvider>
 */
export const ModalProvider = ({ children }: ModalProviderProps) => {
  const { modalStack, openModal, closeModal, closeAllModals, isOpen } =
    useModalStore();

  // 하위 호환성을 위해 최상위 모달 정보 계산
  const topModal = modalStack[modalStack.length - 1];
  const modalType = topModal?.type ?? null;
  const modalData = topModal?.data;

  return (
    <ModalContext.Provider
      value={{
        modalStack,
        modalType,
        modalData,
        openModal,
        closeModal,
        closeAllModals,
        isOpen,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};
