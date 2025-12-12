import { ThumbsUp } from "lucide-react"
import { Button } from "@/shared/ui"
import { useLikeComment } from "@/features/comment/model/useCommentMutation"
import { useLikedCommentStore } from "@/entities/comment/model/likedCommentStore"
import { calculateNewLikes } from "@/entities/comment/lib"

interface LikeCommentButtonProps {
  commentId: number
  postId: number
  currentLikes: number
}

/**
 * 댓글 좋아요 토글 버튼
 *
 * - 좋아요 안 누른 상태: 회색 아이콘, 클릭 시 +1
 * - 좋아요 누른 상태: 파란색 아이콘, 클릭 시 -1
 */
export const LikeCommentButton = ({ commentId, postId, currentLikes }: LikeCommentButtonProps) => {
  const likeComment = useLikeComment(postId)
  const isLiked = useLikedCommentStore((state) => state.isLiked(commentId))
  const toggleLike = useLikedCommentStore((state) => state.toggleLike)

  const handleLike = () => {
    // 토글: 좋아요 상태 변경 후 새 상태 반환
    const willBeLiked = toggleLike(commentId)
    // 순수함수로 새 likes 수 계산
    const newLikes = calculateNewLikes(currentLikes, willBeLiked)

    likeComment.mutate({ id: commentId, likes: newLikes })
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLike}
      disabled={likeComment.isPending}
      className={`flex items-center gap-1 ${isLiked ? "text-blue-500" : ""}`}
    >
      <ThumbsUp className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
      <span>{currentLikes}</span>
    </Button>
  )
}
