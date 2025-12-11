import { create } from "zustand"

/**
 * 좋아요 누른 댓글 추적 Store
 *
 * DummyJSON API는 실제로 좋아요 상태를 저장하지 않으므로
 * 클라이언트에서 좋아요 누른 댓글 ID를 추적하여 토글 기능 구현
 */
interface LikedCommentStore {
  /** 좋아요 누른 댓글 ID Set */
  likedIds: Set<number>
  /** 좋아요 상태 토글 */
  toggleLike: (commentId: number) => boolean
  /** 좋아요 여부 확인 */
  isLiked: (commentId: number) => boolean
  /** 초기화 */
  clear: () => void
}

export const useLikedCommentStore = create<LikedCommentStore>((set, get) => ({
  likedIds: new Set<number>(),

  toggleLike: (commentId) => {
    const isCurrentlyLiked = get().likedIds.has(commentId)

    set((state) => {
      const newSet = new Set(state.likedIds)
      if (isCurrentlyLiked) {
        newSet.delete(commentId)
      } else {
        newSet.add(commentId)
      }
      return { likedIds: newSet }
    })

    // 토글 후 새로운 좋아요 상태 반환 (true = 좋아요 추가됨)
    return !isCurrentlyLiked
  },

  isLiked: (commentId) => get().likedIds.has(commentId),

  clear: () => set({ likedIds: new Set<number>() }),
}))
