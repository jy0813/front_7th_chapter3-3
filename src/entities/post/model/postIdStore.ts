import { create } from "zustand"
import { DUMMYJSON_MAX_POST_ID } from "@/shared/config"

/**
 * 낙관적 게시글 ID 생성기
 *
 * DummyJSON은 ID 1~251까지 실제 데이터가 있음
 * 낙관적으로 생성하는 게시글은 252부터 시작
 *
 * 문제: total 기반 ID 생성 시, 삭제 후 재생성하면 ID 충돌
 * 해결: 전역 카운터로 항상 증가하는 고유 ID 보장
 */
interface PostIdStore {
  /** 다음에 사용할 ID (항상 증가) */
  nextId: number
  /** 새 ID 생성 */
  generateId: () => number
  /** ID 초기화 (캐시에서 가장 큰 ID 기준) */
  initializeFromMax: (maxId: number) => void
}

export const usePostIdStore = create<PostIdStore>((set, get) => ({
  // DummyJSON 최대 ID + 1부터 시작
  nextId: DUMMYJSON_MAX_POST_ID + 1,

  generateId: () => {
    const currentId = get().nextId
    set({ nextId: currentId + 1 })
    return currentId
  },

  initializeFromMax: (maxId: number) => {
    const currentNextId = get().nextId
    // 현재 nextId보다 큰 경우에만 업데이트
    if (maxId >= currentNextId) {
      set({ nextId: maxId + 1 })
    }
  },
}))
