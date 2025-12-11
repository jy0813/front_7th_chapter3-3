import { create } from "zustand"

/**
 * 수정된 게시글 ID 추적 Store
 *
 * DummyJSON mock API 특성상 서버에 실제 저장되지 않으므로,
 * 수정된 게시글 ID를 클라이언트에서 추적하여
 * 검색/필터 시 캐시 버전으로 대체할 수 있게 함
 */
interface ModifiedPostStore {
  // 수정된 게시글 ID Set
  modifiedIds: Set<number>

  // 수정된 ID 추가
  addModifiedId: (id: number) => void

  // 수정된 ID 제거 (삭제 시)
  removeModifiedId: (id: number) => void

  // ID가 수정되었는지 확인
  isModified: (id: number) => boolean

  // 전체 초기화
  clear: () => void
}

export const useModifiedPostStore = create<ModifiedPostStore>((set, get) => ({
  modifiedIds: new Set<number>(),

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

  clear: () => {
    set({ modifiedIds: new Set() })
  },
}))
