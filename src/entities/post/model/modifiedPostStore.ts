import { create } from "zustand"

/**
 * 게시글 상태 추적 Store
 *
 * DummyJSON mock API 특성상 서버에 실제 저장되지 않으므로,
 * 클라이언트에서 다음을 추적:
 * - modifiedIds: 수정된 게시글 (검색/필터 시 캐시 버전으로 대체)
 * - newlyCreatedIds: 방금 생성된 게시글 (생성 직후 맨 위 표시용)
 */
interface ModifiedPostStore {
  // 수정된 게시글 ID Set
  modifiedIds: Set<number>

  // 방금 생성된 게시글 ID Set (필터/검색/페이지 이동 시 초기화)
  newlyCreatedIds: Set<number>

  // 수정된 ID 추가
  addModifiedId: (id: number) => void

  // 수정된 ID 제거 (삭제 시)
  removeModifiedId: (id: number) => void

  // ID가 수정되었는지 확인
  isModified: (id: number) => boolean

  // 새로 생성된 ID 추가
  addNewlyCreatedId: (id: number) => void

  // 새로 생성된 ID 초기화 (URL 변경 시 호출)
  clearNewlyCreated: () => void

  // 전체 초기화
  clear: () => void
}

export const useModifiedPostStore = create<ModifiedPostStore>((set, get) => ({
  modifiedIds: new Set<number>(),
  newlyCreatedIds: new Set<number>(),

  addModifiedId: (id) => {
    set((state) => {
      const newSet = new Set(state.modifiedIds)
      newSet.add(id)
      return { modifiedIds: newSet }
    })
  },

  removeModifiedId: (id) => {
    set((state) => {
      const newSet = new Set(state.modifiedIds)
      newSet.delete(id)
      return { modifiedIds: newSet }
    })
  },

  isModified: (id) => {
    return get().modifiedIds.has(id)
  },

  addNewlyCreatedId: (id) => {
    set((state) => {
      const newSet = new Set(state.newlyCreatedIds)
      newSet.add(id)
      return { newlyCreatedIds: newSet }
    })
  },

  clearNewlyCreated: () => {
    set({ newlyCreatedIds: new Set() })
  },

  clear: () => {
    set({ modifiedIds: new Set(), newlyCreatedIds: new Set() })
  },
}))
