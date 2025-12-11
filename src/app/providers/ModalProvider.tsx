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
  const { modalType, modalData, openModal, closeModal, isOpen } =
    useModalStore();

  return (
    <ModalContext.Provider
      value={{
        modalType,
        modalData,
        openModal,
        closeModal,
        isOpen,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};
